import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    // 1. 使用 Service Role Key 创建“管理员”客户端
    // 这把钥匙能绕过 RLS 权限锁，看到所有用户数据
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    const body = await req.json();
    const { event, data } = body;

    console.log(`📩 收到 Webhook 事件: ${event}`);

    // 只处理支付成功的事件
    if (event === "checkout.completed") {
      const email = data.customer_email;
      const productId = data.product_id;

      console.log(`🔍 正在数据库查找用户: ${email}`);

      // 2. 查找用户 (现在拥有管理员权限，一定能找到)
      const { data: user, error: findError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (findError || !user) {
        console.error(`❌ 数据库里没找到这个邮箱: ${email}`, findError);
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }

      console.log(`✅ 找到用户 ID: ${user.id}, 当前积分: ${user.credits}`);

      // 3. 计算要加多少分
      let creditsToAdd = 0;
      // Basic Plan ID
      if (productId === "prod_2U14J3cNweMcQPQaQiTHTt") creditsToAdd = 100; // 这里的100只是示例，按你的套餐改
      // 其他 Plan 可以在这里加 else if...
      
      // 如果是用测试代码，强制加 2400 分方便观察
      if (!creditsToAdd) creditsToAdd = 2400; 

      // 4. 更新积分
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: (user.credits || 0) + creditsToAdd })
        .eq("id", user.id);

      if (updateError) {
        console.error("❌ 积分更新失败:", updateError);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }

      console.log(`🚀 充值成功! 已为 ${email} 增加 ${creditsToAdd} 积分`);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}