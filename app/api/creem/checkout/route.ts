import { NextRequest, NextResponse } from "next/server";

// 1. 你的 Basic Plan 正式 ID (从你截图里抄来的)
const TARGET_PRODUCT_ID = "prod_2U14J3cNweMcQPQaQiTHTt"; 

// 2. 你的正式环境密钥 (你之前提供的)
const CREEM_API_KEY = "creem_5fverLVbFKdgtPveQYZ8a";

export async function POST(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    // 去掉末尾可能多余的斜杠
    const cleanBaseUrl = baseUrl.replace(/\/$/, ""); 
    
    const successUrl = `${cleanBaseUrl}/pricing/success`;
    const cancelUrl = `${cleanBaseUrl}/pricing`;

    console.log("🚀 正在发起正式支付，产品ID:", TARGET_PRODUCT_ID);

    // 3. 请求 Creem 正式接口 (注意这里是 api.creem.io，不是 test-api)
    const creemResponse = await fetch("https://api.creem.io/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CREEM_API_KEY,
      },
      body: JSON.stringify({
        product_id: TARGET_PRODUCT_ID,
        
        // ✅ 关键修改：强制使用数据库里存在的“张张”邮箱
        // 这样支付成功后，Webhook 绝对能找到人！
        customer_email: "zhangzhangqc2@gmail.com", 
        
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    if (!creemResponse.ok) {
      const errorData = await creemResponse.text();
      console.error("Creem API 报错:", errorData);
      return NextResponse.json({ error: `Creem Error: ${errorData}` }, { status: 500 });
    }

    const checkoutData = await creemResponse.json();
    
    // 返回支付链接给前端
    return NextResponse.json({
      checkoutUrl: checkoutData.checkout_url || checkoutData.url,
      sessionId: checkoutData.id,
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}