import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Plan configuration mapping
const PLAN_CONFIG = {
  basic: {
    monthly: {
      productId: process.env.CREEM_PRODUCT_BASIC_MONTHLY || "", 
      price: 12.0,
    },
    yearly: {
      // ✅ 这里我已经帮你填好了真实的 ID，直接用！
      productId: "prod_5rZTLlWyTtk3sFfYx9LU7E", 
      price: 144.0,
    },
  },
  pro: {
    monthly: {
      productId: process.env.CREEM_PRODUCT_PRO_MONTHLY || "",
      price: 19.5,
    },
    yearly: {
      productId: process.env.CREEM_PRODUCT_PRO_YEARLY || "", 
      price: 234.0,
    },
  },
  max: {
    monthly: {
      productId: process.env.CREEM_PRODUCT_MAX_MONTHLY || "",
      price: 80.0,
    },
    yearly: {
      productId: process.env.CREEM_PRODUCT_MAX_YEARLY || "", 
      price: 960.0,
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { planId, billingPeriod } = body

    if (!planId || !billingPeriod) {
      return NextResponse.json(
        { error: "Missing planId or billingPeriod" },
        { status: 400 }
      )
    }

    // Get plan configuration
    const planConfig = PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG]?.[
      billingPeriod as "monthly" | "yearly"
    ]

    // 检查配置是否存在
    if (!planConfig || !planConfig.productId) {
      console.error(`Missing product ID for plan: ${planId}, period: ${billingPeriod}`);
      return NextResponse.json(
        { error: "Invalid plan configuration" },
        { status: 400 }
      )
    }

    // Get API Key
    const creemApiKey = process.env.CREEM_API_KEY
    if (!creemApiKey) {
      console.error("Creem API Key is missing");
      return NextResponse.json(
        { error: "Creem API key not configured" },
        { status: 500 }
      )
    }

    // Construct URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    // 确保 URL 格式正确，去掉末尾可能多余的斜杠
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const successUrl = `${cleanBaseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${cleanBaseUrl}/pricing`

    console.log("Creating session with:", {
      productId: planConfig.productId,
      baseUrl: cleanBaseUrl
    });

    // Call Creem API
    const creemResponse = await fetch("https://api.creem.io/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${creemApiKey}`,
      },
      body: JSON.stringify({
        product_id: planConfig.productId,
        customer_email: user.email,
        customer_id: user.id,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: user.id,
          plan_id: planId,
          billing_period: billingPeriod,
        },
      }),
    })

    if (!creemResponse.ok) {
      const errorData = await creemResponse.text()
      console.error("Creem API error response:", errorData)
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      )
    }

    const checkoutData = await creemResponse.json()

    return NextResponse.json({
      checkoutUrl: checkoutData.checkout_url || checkoutData.url,
      sessionId: checkoutData.id,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}