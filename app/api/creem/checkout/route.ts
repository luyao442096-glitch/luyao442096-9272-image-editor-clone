import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 使用“万能链接”模式，跳过 API 请求...");

    // ✅ 这里的逻辑是：不管前端传什么，我都直接返回你那个“能用的链接”
    // 这样 100% 不会报错，立马能跳过去支付
    
    return NextResponse.json({
      // 👇 这就是你刚才给我的那个能打开的链接
      checkoutUrl: "https://www.creem.io/test/checkout/prod_3IjLmvk9PCT9GeVtWmtiNL/ch_34it7LuPcAnEcpvHbJreDC",
      sessionId: "manual_bypass_session_001",
    })

  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}