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
    
    // 测试模式：如果没有提供令牌，尝试使用一个硬编码的测试用户ID
    // 注意：这只是为了测试方便，生产环境中应该移除
    let userId = "test_user_id";
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      
      // 验证用户身份
      const { data: { user }, error: verifyError } = await supabase.auth.getUser(token);
      if (user && !verifyError) {
        userId = user.id;
      } else {
        console.warn("⚠️ 令牌验证失败，使用测试用户ID");
        // 不返回错误，继续使用测试用户ID
      }
    } else {
      console.warn("⚠️ 没有提供令牌，使用测试用户ID");
    }

    // 获取请求体中的积分数量和产品ID
    const body = await request.json();
    const { credits = 2400, productId = "prod_2U14J3cNweMcQPQaQiTHTt" } = body;

    // 查找用户 - 优先使用真实用户ID，如果找不到则使用测试用户ID
    let profile, findError;
    ({ data: profile, error: findError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single());

    // 如果找不到用户，尝试查找第一个用户（用于测试）
    if (findError || !profile) {
      console.warn(`⚠️ 没找到用户ID ${userId}，尝试查找第一个用户...`);
      ({ data: profile, error: findError } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .single());
    }

    if (findError || !profile) {
      console.error(`❌ 数据库里没找到用户`, findError);
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    console.log(`✅ 找到用户: ${profile.email || "test@example.com"}, 当前积分: ${profile.credits}`);
    console.log(`📈 准备增加 ${credits} 积分，产品ID: ${productId}`);

    // 更新积分
    const newCredits = (profile.credits || 0) + credits;
    const { data: updatedUser, error: updateError } = await supabase
      .from("profiles")
      .update({ credits: newCredits })
      .eq("id", profile.id)
      .select()
      .single();

    if (updateError || !updatedUser) {
      console.error("❌ 积分更新失败:", updateError);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    console.log(`🚀 测试充值成功! 已为 ${profile.email || "test@example.com"} 增加 ${credits} 积分，新积分: ${updatedUser.credits}`);

    return NextResponse.json({
      success: true,
      message: "测试积分已成功添加",
      userId: profile.id,
      email: profile.email || "test@example.com",
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