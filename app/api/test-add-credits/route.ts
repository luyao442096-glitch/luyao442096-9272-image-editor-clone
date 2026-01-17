import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // 使用服务角色密钥创建客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    // 获取当前用户的身份验证令牌
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 验证用户身份
    const { data: { user }, error: verifyError } = await supabase.auth.getUser(token);
    if (!user || verifyError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 获取请求体中的积分数量和产品ID
    const body = await request.json();
    const { credits = 2400, productId = "prod_2U14J3cNweMcQPQaQiTHTt" } = body;

    // 查找用户
    const { data: profile, error: findError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (findError || !profile) {
      console.error(`❌ 数据库里没找到这个用户: ${user.id}`, findError);
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    console.log(`✅ 找到用户: ${user.email}, 当前积分: ${profile.credits}`);
    console.log(`📈 准备增加 ${credits} 积分，产品ID: ${productId}`);

    // 更新积分
    const newCredits = (profile.credits || 0) + credits;
    const { data: updatedUser, error: updateError } = await supabase
      .from("profiles")
      .update({ credits: newCredits })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError || !updatedUser) {
      console.error("❌ 积分更新失败:", updateError);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    console.log(`🚀 测试充值成功! 已为 ${user.email} 增加 ${credits} 积分，新积分: ${updatedUser.credits}`);

    return NextResponse.json({
      success: true,
      message: "测试积分已成功添加",
      userId: user.id,
      email: user.email,
      oldCredits: profile.credits,
      newCredits: updatedUser.credits,
      creditsAdded: credits,
      productId: productId
    });

  } catch (err: any) {
    console.error("测试积分API错误:", err);
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "测试积分API - 使用POST请求添加积分",
    usage: {
      method: "POST",
      headers: {
        "Authorization": "Bearer <your-access-token>",
        "Content-Type": "application/json"
      },
      body: {
        "credits": 2400, // 默认是2400（Basic Plan的积分）
        "productId": "prod_2U14J3cNweMcQPQaQiTHTt" // 默认是Basic Plan的产品ID
      }
    },
    note: "这是一个测试API，仅用于开发和测试目的"
  });
}