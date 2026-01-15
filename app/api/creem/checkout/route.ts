import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// ✅ 1. 之前修正过的正确 Product ID
const TARGET_PRODUCT_ID = "prod_3ljLmvK9PCT9GeVtWmtiNL"; 

export async function POST(request: NextRequest) {
  try {
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
    
    // 即使未登录也继续，方便测试
    if (!user) {
      console.log("⚠️ User not logged in, proceeding with test user...")
    }

    // ✅ 2. 你的密钥 (已验证是有效的，只是之前头不对)
    const creemApiKey = "creem_test_3dlkEtyc4co7RWiLPFNHAE"; 

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const successUrl = `${cleanBaseUrl}/pricing/success`
    const cancelUrl = `${cleanBaseUrl}/pricing`

    console.log("🚀 Starting Checkout with ID:", TARGET_PRODUCT_ID);
    console.log("🔑 Using Header: x-api-key (New Rule)");

    // ✅✅✅ 3. 核心修改：使用邮件要求的测试专用域名
    const creemResponse = await fetch("https://test-api.creem.io/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ✅✅✅ 4. 核心修改：头部改成 x-api-key (解决 403 的关键！)
        "x-api-key": creemApiKey, 
      },
      body: JSON.stringify({
        product_id: TARGET_PRODUCT_ID,
        customer_email: "vip_tester_new_008@gmail.com", 
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    })

    if (!creemResponse.ok) {
      const errorData = await creemResponse.text()
      console.error("Creem API error:", errorData)
      return NextResponse.json({ error: `Creem Error: ${errorData}` }, { status: 500 })
    }

    const checkoutData = await creemResponse.json()
    return NextResponse.json({
      checkoutUrl: checkoutData.checkout_url || checkoutData.url,
      sessionId: checkoutData.id,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}