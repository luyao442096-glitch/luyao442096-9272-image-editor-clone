import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Creem API Key - 从环境变量读取，如果没有则使用测试密钥
const CREEM_API_KEY = process.env.CREEM_API_KEY || "creem_test_3dlkEtyc4co7RWiLPFNHAE"

// 产品ID映射 - 根据 planId 和 billingPeriod 选择对应的 Creem 产品ID
// 目前所有计划都使用同一个产品ID，后续可以根据需要扩展
const PRODUCT_ID_MAP: Record<string, Record<string, string>> = {
  basic: {
    monthly: "prod_3IjLmvk9PCT9GeVtWmtiNL", // 如果将来有单独的月度产品ID
    yearly: "prod_3IjLmvk9PCT9GeVtWmtiNL",
  },
  pro: {
    monthly: "prod_3IjLmvk9PCT9GeVtWmtiNL", // 如果将来有单独的月度产品ID
    yearly: "prod_3IjLmvk9PCT9GeVtWmtiNL",
  },
  max: {
    monthly: "prod_3IjLmvk9PCT9GeVtWmtiNL", // 如果将来有单独的月度产品ID
    yearly: "prod_3IjLmvk9PCT9GeVtWmtiNL",
  },
}

export async function POST(request: NextRequest) {
  try {
    // 读取请求体
    const body = await request.json()
    const { planId, billingPeriod } = body

    if (!planId || !billingPeriod) {
      console.error("❌ Missing planId or billingPeriod in request body:", body)
      return NextResponse.json(
        { error: "Missing planId or billingPeriod" },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error("❌ User not logged in")
      return NextResponse.json(
        { error: "User must be logged in to checkout" },
        { status: 401 }
      )
    }

    // 获取产品ID
    const productId = PRODUCT_ID_MAP[planId]?.[billingPeriod] || "prod_3IjLmvk9PCT9GeVtWmtiNL"
    
    console.log("🚀 Starting Checkout:", {
      planId,
      billingPeriod,
      productId,
      userId: user.id,
      userEmail: user.email,
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const cleanBaseUrl = baseUrl.replace(/\/$/, "")
    // Creem API 会在成功时重定向到 success_url，并附加查询参数
    const successUrl = `${cleanBaseUrl}/pricing/success`

    // 准备请求体 - 根据 Creem API 文档格式
    // 注意：Creem API 不支持 cancel_url 参数
    const requestBody: any = {
      product_id: productId,
      success_url: successUrl,
    }

    // 添加客户信息 - 使用 customer 对象格式
    if (user.email) {
      requestBody.customer = {
        email: user.email,
        id: user.id,
      }
    }

    // 添加 metadata
    requestBody.metadata = {
      user_id: user.id,
      plan_id: planId,
      billing_period: billingPeriod,
    }

    // 验证 API Key 是否存在
    if (!CREEM_API_KEY || CREEM_API_KEY.trim() === "") {
      console.error("❌ CREEM_API_KEY is not set or empty")
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      )
    }

    // 根据 Creem API 文档，正确的端点是 /v1/checkouts，认证头是 x-api-key
    const apiUrl = "https://api.creem.io/v1/checkouts"
    
    console.log("📤 Creem API Request:", {
      url: apiUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${CREEM_API_KEY.substring(0, 20)}...`,
      },
      body: requestBody,
      apiKeyLength: CREEM_API_KEY.length,
      apiKeyPrefix: CREEM_API_KEY.substring(0, 12),
    })

    // 调用 Creem API 创建 checkout session
    let creemResponse: Response
    try {
      creemResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CREEM_API_KEY,
        },
        body: JSON.stringify(requestBody),
      })
    } catch (fetchError) {
      console.error("❌ Fetch error:", fetchError)
      return NextResponse.json(
        { 
          error: "Failed to connect to Creem API",
          details: fetchError instanceof Error ? fetchError.message : String(fetchError)
        },
        { status: 500 }
      )
    }

    console.log("📥 Creem API Response Status:", creemResponse.status, creemResponse.statusText)
    
    if (!creemResponse.ok) {
      const errorText = await creemResponse.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText, raw: errorText }
      }
      
      console.error("❌ Creem API error:", {
        status: creemResponse.status,
        statusText: creemResponse.statusText,
        headers: Object.fromEntries(creemResponse.headers.entries()),
        error: errorData,
        requestBody: requestBody,
      })
      
      // 返回更详细的错误信息
      const errorMessage = errorData.message || errorData.error || errorData.raw || "Failed to create checkout session"
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorData,
          status: creemResponse.status,
        },
        { status: creemResponse.status >= 400 && creemResponse.status < 500 ? creemResponse.status : 500 }
      )
    }

    const checkoutData = await creemResponse.json()
    
    console.log("✅ Checkout session created:", {
      fullResponse: checkoutData,
      sessionId: checkoutData.id,
      checkoutUrl: checkoutData.checkout_url || checkoutData.url || checkoutData.checkoutUrl,
    })

    // Creem API 返回的 checkout_url 字段名可能是 checkout_url
    const checkoutUrl = checkoutData.checkout_url || checkoutData.url || checkoutData.checkoutUrl

    if (!checkoutUrl) {
      console.error("❌ No checkout URL in response:", checkoutData)
      return NextResponse.json(
        { error: "No checkout URL received from Creem API", details: checkoutData },
        { status: 500 }
      )
    }

    return NextResponse.json({
      checkoutUrl: checkoutUrl,
      sessionId: checkoutData.id,
    })
  } catch (error) {
    console.error("❌ Checkout error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}