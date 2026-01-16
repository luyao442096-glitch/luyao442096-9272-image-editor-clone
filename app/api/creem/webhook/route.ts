import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 1. 初始化管理员权限的数据库客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 2. 【Plan B】直接使用你的正式产品 ID 进行映射
// 这样就不需要在 Creem 后台设置 Metadata 了
const PLAN_CREDITS: Record<string, number> = {
  "prod_2U14J3cNweMcQPQaQiTHTt": 2400,  // Basic Plan
  "prod_3GUDoBE0DSES3HGqYDC1S":  4800,  // Pro Plan
  "prod_42aqCZ9KQG1nScBkhK6m10": 12000  // Max Plan
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, data } = body;

    console.log("📩 收到 Webhook:", event);

    if (event === "checkout.completed") {
      const customerEmail = data.customer_email;
      // 优先尝试获取 product_id (不同版本字段可能不同，做个兼容)
      const productId = data.product_id || data.productId; 

      console.log(`🔍 用户 ${customerEmail} 购买了产品 ID: ${productId}`);

      // 3. 根据 ID 查积分
      const creditsToAdd = PLAN_CREDITS[productId] || 0;

      if (creditsToAdd > 0 && customerEmail) {
        // 4. 查用户
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("credits")
          .eq("email", customerEmail)
          .single();

        if (profile) {
          // 5. 加积分
          const newCredits = (profile.credits || 0) + creditsToAdd;
          
          const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ 
              credits: newCredits,
              subscription_tier: productId // 记录用户买了哪个套餐ID
            })
            .eq("email", customerEmail);

          if (!updateError) {
            console.log(`🚀 充值成功！${customerEmail} 新积分: ${newCredits}`);
          } else {
            console.error("❌ 数据库更新失败:", updateError);
          }
        } else {
          console.error("❌ 数据库里没找到这个邮箱:", customerEmail);
        }
      } else {
        console.log(`⚠️ 未识别的产品ID (${productId}) 或无积分额度`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}