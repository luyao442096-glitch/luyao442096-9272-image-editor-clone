import { NextRequest, NextResponse } from "next/server"

// ✅ 配置区：已填入你的 3 个真实产品链接
const PLAN_LINKS = {
  // Basic Plan ($144)
  "basic": "https://www.creem.io/payment/prod_2U14J3cNweMcQPQaQiTHTt",
  
  // Pro Plan ($234)
  "pro":   "https://www.creem.io/payment/prod_3GUDoBE0DSES3HGqYDC1S",   
  
  // Max Plan ($960)
  "max":   "https://www.creem.io/payment/prod_42aqCZ9KQG1nScBkhK6m10",   
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // 获取前端传过来的套餐名字 (basic, pro, 或 max)
    const { planId } = body 

    console.log("🚀 用户选择套餐:", planId);

    // 1. 查表找到对应的链接
    let targetUrl = PLAN_LINKS[planId as keyof typeof PLAN_LINKS];

    // 2. 如果找不到（防止意外），默认跳转到 Basic
    if (!targetUrl) {
      console.warn("⚠️ 未找到对应套餐，降级使用 Basic 链接");
      targetUrl = PLAN_LINKS["basic"];
    }

    console.log("🔗 准备跳转:", targetUrl);

    // 3. 返回链接给前端，让浏览器跳转
    return NextResponse.json({
      checkoutUrl: targetUrl,
      sessionId: "manual_bypass_" + planId,
    })

  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}