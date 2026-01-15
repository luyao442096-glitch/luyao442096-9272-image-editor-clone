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
    const successUrl = `${cleanBaseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${cleanBaseUrl}/pricing`

    // 准备请求体
    const requestBody: any = {
      product_id: productId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }

    // 添加可选字段
    if (user.email) {
      requestBody.customer_email = user.email
    }

    // 添加 metadata
    requestBody.metadata = {
      user_id: user.id,
      plan_id: planId,
      billing_period: billingPeriod,
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
    })

    // 调用 Creem API 创建 checkout session
    const creemResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CREEM_API_KEY,
      },
      body: JSON.stringify(requestBody),
    })

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
      sessionId: checkoutData.id,
      checkoutUrl: checkoutData.checkout_url || checkoutData.url,
    })

    return NextResponse.json({
      checkoutUrl: checkoutData.checkout_url || checkoutData.url,
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