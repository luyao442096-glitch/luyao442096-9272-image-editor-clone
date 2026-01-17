import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

// 初始化 OpenAI
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title": process.env.SITE_NAME || "Nano Banana",
  },
})

export async function POST(request: NextRequest) {
  try {
    // ==========================================
    // 0. 初始化权限最高的 Supabase Admin 客户端
    // ==========================================
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // 检查环境变量是否缺失
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ 严重错误: Vercel 环境变量缺失 (URL 或 SERVICE_ROLE_KEY)")
      return NextResponse.json({ 
        error: "Server Config Error", 
        details: "服务器端缺少 Supabase 环境变量，请检查 Vercel 设置" 
      }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // ==========================================
    // 1. 身份验证 (使用 Service Role 验证 Token)
    // ==========================================
    let user = null;
    let authErrorDetail = "";

    // 优先尝试从 Header 获取 Token
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      // 使用 Admin 客户端验证 Token (这比使用 Anon Key 更稳健)
      const { data: { user: headerUser }, error: verifyError } = await supabaseAdmin.auth.getUser(token);
      
      if (!verifyError && headerUser) {
        user = headerUser;
        console.log(`✅ Header 验证成功: ${user.email}`);
      } else {
        authErrorDetail = verifyError?.message || "Token 无效";
        console.error(`⚠️ Header 验证失败: ${authErrorDetail}`);
      }
    }

    // 如果 Header 失败，尝试 Cookie (兼容旧版)
    if (!user) {
      try {
        const cookieStore = await cookies();
        const supabaseCookie = createRouteHandlerClient({ cookies: () => cookieStore as any });
        const { data: { session } } = await supabaseCookie.auth.getSession();
        if (session?.user) {
          user = session.user;
          console.log(`✅ Cookie 验证成功: ${user.email}`);
        }
      } catch (e) {
        // Cookie 验证也失败，无需处理
      }
    }

    // 如果彻底失败，返回详细错误给前端弹窗
    if (!user) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        details: `身份验证失败: ${authErrorDetail || "请尝试重新登录"}` 
      }, { status: 401 });
    }

    // ==========================================
    // 2. 检查积分
    // ==========================================
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    const currentCredits = profile?.credits ?? 0
    
    // 如果积分不足，直接返回
    if (currentCredits < 1) { 
      return NextResponse.json({ error: "Insufficient credits", details: "您的积分不足，无法生成图片" }, { status: 403 })
    }

    // ==========================================
    // 3. 解析请求并执行生成
    // ==========================================
    const body = await request.json()
    // ⚠️ 关键修复：读取前端传来的 model 参数
    const { prompt, mode, imageUrl, aspectRatio = "1:1", model } = body

    // 如果前端没传 model，使用默认值
    const targetModel = model || "google/gemini-2.5-flash-image";
    console.log(`🚀 开始生成... 模型: ${targetModel}, 用户: ${user.email}`);

    const aspectRatioMap: Record<string, string> = { "1:1": "1:1", "auto": "1:1" }
    const geminiAspectRatio = aspectRatioMap[aspectRatio] || "1:1"

    const messageContent: any[] = []
    if (mode === "image-to-image" && imageUrl) {
        messageContent.push({ type: "image_url", image_url: { url: imageUrl } })
    }
    messageContent.push({ type: "text", text: prompt })
    
    const requestParams: any = {
      model: targetModel, // 使用动态模型
      messages: [{ role: "user", content: messageContent }],
      image_config: { aspect_ratio: geminiAspectRatio },
    }
    
    const completion = await openai.chat.completions.create(requestParams as any)
    const message = completion.choices[0]?.message as any
    
    let generatedImageUrl = ""
    if (message?.images?.[0]?.image_url?.url) {
        generatedImageUrl = message.images[0].image_url.url
    } else if (message.content && Array.isArray(message.content)) {
       const img = message.content.find((item: any) => item.type === "image_url")
       if (img) generatedImageUrl = img.image_url.url
    }
    
    if (!generatedImageUrl) {
        throw new Error("API 调用成功但未返回图片 URL")
    }

    // ==========================================
    // 4. 扣除积分
    // ==========================================
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: currentCredits - 1 })
      .eq('id', user.id)

    if (updateError) {
        console.error("❌ 扣费失败:", updateError)
        // 注意：这里我们只记录日志，不阻断返回，因为用户已经拿到图片了
    }

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
      remainingCredits: currentCredits - 1
    })

  } catch (error: any) {
    console.error("Generate Error Detail:", error)
    return NextResponse.json({ 
        error: error.message || "Failed", 
        details: error.response?.data || error.toString() 
    }, { status: 500 })
  }
}