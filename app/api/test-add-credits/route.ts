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
    
    console.log("🔍 收到请求，检查授权头...");
    console.log(`📌 授权头: ${authHeader || "没有提供"}`);
    
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      
      console.log("🔐 正在验证令牌...");
      
      // 验证用户身份
      try {
        const { data: { user }, error: verifyError } = await supabase.auth.getUser(token);
        
        if (verifyError) {
          console.error("❌ 令牌验证失败:", verifyError);
        } else if (user) {
          console.log(`✅ 令牌验证成功，用户ID: ${user.id}`);
          userId = user.id;
        }
      } catch (error) {
        console.error("❌ 令牌验证过程中发生错误:", error);
      }
    } else {
      console.warn("⚠️ 没有提供授权头");
    }
    
    // 调试：打印所有用户信息
    console.log("📊 正在获取所有用户列表...");
    const { data: allUsers, error: listError } = await supabase
      .from("profiles")
      .select("id, email, credits");
    
    if (listError) {
      console.error("❌ 获取用户列表失败:", listError);
    } else {
      console.log(`📋 找到 ${allUsers.length} 个用户:`);
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (ID: ${user.id}, 积分: ${user.credits})`);
      });
    }
    
    // 如果找不到用户ID，尝试使用第一个用户的ID（仅用于测试）
    if (!userId && allUsers && allUsers.length > 0) {
      console.warn("⚠️ 没有有效的用户ID，使用第一个用户的ID");
      userId = allUsers[0].id;
    }
    
    if (!userId) {
      console.error("❌ 无法获取有效的用户ID");
      return NextResponse.json({ error: "无法获取有效的用户ID" }, { status: 400 });
    }

    // 获取请求体中的积分数量、产品ID和目标邮箱
    const body = await request.json();
    const { 
      credits = 2400, 
      productId = "prod_2U14J3cNweMcQPQaQiTHTt",
      targetEmail = null  // 新增：目标用户邮箱
    } = body;

    // 优先使用目标邮箱查找用户
    let profile, findError;
    if (targetEmail) {
      console.log(`📧 正在按邮箱查找用户: ${targetEmail}`);
      ({ data: profile, error: findError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", targetEmail)
        .single());
    } 
    // 如果没有提供目标邮箱，使用用户ID查找
    else if (userId) {
      console.log(`🆔 正在按用户ID查找用户: ${userId}`);
      ({ data: profile, error: findError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single());
    }

    // 如果找不到用户，尝试使用第一个用户
    if (findError || !profile) {
      console.warn("⚠️ 没找到指定用户，尝试使用第一个用户");
      ({ data: profile, error: findError } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .single());
    }

    if (findError || !profile) {
      console.error("❌ 数据库里没找到用户", findError);
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