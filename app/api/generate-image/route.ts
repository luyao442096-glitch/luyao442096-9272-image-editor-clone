import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

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
    // ------------------------------------------------------------------
    // 1. 身份验证 (双重保险模式：查 Cookie + 查 Header)
    // ------------------------------------------------------------------
    let user = null;
    let authMethod = "none";

    // 方式 A: 尝试从 Header 获取 Token (最稳的方式)
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      // 创建一个临时客户端来验证 Token
      const supabaseJWT = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user: headerUser }, error: jwtError } = await supabaseJWT.auth.getUser(token);
      
      if (!jwtError && headerUser) {
        user = headerUser;
        authMethod = "header_token";
      }
    }

    // 方式 B: 如果 Header 没拿到，尝试从 Cookie 获取 (旧方式)
    if (!user) {
      try {
        const cookieStore = await cookies();
        const supabaseCookie = createRouteHandlerClient({ 
          cookies: () => cookieStore as any
        });
        const { data: { session } } = await supabaseCookie.auth.getSession();
        if (session?.user) {
          user = session.user;
          authMethod = "cookie";
        }
      } catch (e) {
        console.log("Cookie auth failed:", e);
      }
    }

    if (!user) {
      console.error("❌ 身份验证失败: Header和Cookie都无效");
      return NextResponse.json({ error: "Unauthorized", details: "请重新登录" }, { status: 401 });
    }

    // ------------------------------------------------------------------
    // 2. 初始化 Supabase (上帝模式) - 扣费专用
    // ------------------------------------------------------------------
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Server Config Error" }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // ------------------------------------------------------------------
    // 3. 检查积分
    // ------------------------------------------------------------------
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.log("Profile not found, user might be new or table is empty");
      return NextResponse.json({ error: "Account Error", details: "无法读取积分信息" }, { status: 500 });
    }

    const currentCredits = profile.credits ?? 0
    console.log(`👤 用户 [${user.email}] 验证成功 (${authMethod})，当前积分: ${currentCredits}`)

    if (currentCredits < 1) { 
      return NextResponse.json({ error: "Insufficient credits", details: "积分不足" }, { status: 403 })
    }

    // ------------------------------------------------------------------
    // 4. 执行生成 (Gemini)
    // ------------------------------------------------------------------
    const body = await request.json()
    const { prompt, mode, imageUrl, aspectRatio = "1:1" } = body

    const aspectRatioMap: Record<string, string> = { "1:1": "1:1", "auto": "1:1" }
    const geminiAspectRatio = aspectRatioMap[aspectRatio] || "1:1"

    const messageContent: any[] = []
    if (mode === "image-to-image" && imageUrl) {
        messageContent.push({ type: "image_url", image_url: { url: imageUrl } })
    }
    messageContent.push({ type: "text", text: prompt })
    
    const requestParams: any = {
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: messageContent }],
      image_config: { aspect_ratio: geminiAspectRatio },
    }
    
    // 调用 API
    const completion = await openai.chat.completions.create(requestParams as any)
    const message = completion.choices[0]?.message as any
    let generatedImageUrl = ""
    
    if (message?.images?.[0]?.image_url?.url) {
        generatedImageUrl = message.images[0].image_url.url
    } else if (message.content && Array.isArray(message.content)) {
       const img = message.content.find((item: any) => item.type === "image_url")
       if (img) generatedImageUrl = img.image_url.url
    }
    
    if (!generatedImageUrl) throw new Error("API 生成失败")

    // ------------------------------------------------------------------
    // 5. 扣除积分
    // ------------------------------------------------------------------
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: currentCredits - 1 })
      .eq('id', user.id)

    if (updateError) console.error("❌ 扣费失败:", updateError)

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
      remainingCredits: currentCredits - 1
    })

  } catch (error: any) {
    console.error("Generate Error:", error)
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 })
  }
}