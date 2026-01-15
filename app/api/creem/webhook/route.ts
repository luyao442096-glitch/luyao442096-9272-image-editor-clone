import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 1. 使用 Service Role Key 初始化管理员权限的数据库客户端
// 这允许代码直接修改用户的积分字段
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 2. 配置每个套餐对应的积分发放额度
const PLAN_CREDITS: Record<string, number> = {
  "basic": 2400,
  "pro":   4800,
  "max":   12000
};

export async function POST(req: NextRequest) {
  try {
    // 解析来自 Creem 的通知数据
    const body = await req.json();
    const { event, data } = body;

    console.log("📩 收到 Webhook 事件:", event);

    // 3. 核心逻辑：当支付完成时触发
    if (event === "checkout.completed") {
      const customerEmail = data.customer_email;
      
      // 从支付元数据中获取套餐 ID，默认为 basic
      const planId = data.metadata?.planId || "basic"; 

      console.log(`✅ 开始为用户 ${customerEmail} 充值套餐: ${planId}`);

      const creditsToAdd = PLAN_CREDITS[planId] || 0;

      if (creditsToAdd > 0 && customerEmail) {
        // 4. 首先查询该用户当前的积分
        const { data: profile, error: fetchError } = await supabaseAdmin
          .from("profiles")
          .select("credits")
          .eq("email", customerEmail)
          .single();

        if (profile) {
          // 5. 计算新总额并在数据库中累加
          const newCredits = (profile.credits || 0) + creditsToAdd;
          
          const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ 
              credits: newCredits,
              subscription_tier: planId 
            })
            .eq("email", customerEmail);

          if (!updateError) {
            console.log(`🚀 充值成功！${customerEmail} 当前积分已更新为: ${newCredits}`);
          } else {
            console.error("❌ 数据库更新失败:", updateError);
          }
        } else {
          console.error("❌ 未找到匹配该 Email 的用户档案");
        }
      }
    }

    // 必须返回 200 状态码告诉 Creem 你已经收到了信号
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (err: any) {
    console.error("❌ Webhook 处理异常:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}