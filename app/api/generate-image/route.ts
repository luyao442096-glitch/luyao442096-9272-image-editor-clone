import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

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
    // ------------------------------------------------------------------
    // 1. 初始化 Supabase (普通用户模式) - 用于验证登录
    // ------------------------------------------------------------------
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ------------------------------------------------------------------
    // 2. 初始化 Supabase (上帝模式) - 专门用于扣费！
    // ⚠️ 放在函数内部初始化，确保能读到 Vercel 的环境变量
    // ------------------------------------------------------------------
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ 严重错误: 缺少 Supabase 环境变量")
      // 可以在这里返回错误，或者继续尝试
    }

    const supabaseAdmin = createClient(
      supabaseUrl!,
      supabaseServiceKey!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // ------------------------------------------------------------------
    // 3. 检查积分 (使用上帝模式查，更稳)
    // ------------------------------------------------------------------
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error("无法获取积分:", profileError)
      return NextResponse.json({ error: "账户信息错误" }, { status: 500 })
    }

    const currentCredits = profile.credits ?? 0
    console.log(`👤 用户 ${user.email} 当前积分: ${currentCredits}`)

    if (currentCredits < 1) { // 如果你想扣2分，这里改成 < 2
      return NextResponse.json(
        { error: "Insufficient credits", details: "积分不足" },
        { status: 403 }
      )
    }

    // ------------------------------------------------------------------
    // 4. 执行生成逻辑 (Gemini)
    // ------------------------------------------------------------------
    const body = await request.json()
    const { prompt, mode, imageUrl, aspectRatio = "1:1" } = body

    // ... (保留你原本的 Gemini API 调用逻辑) ...
    // 为了防止代码太长被截断，我这里简化了中间的 API 调用
    // ⚠️ 请确保这里是你真实的 Gemini 调用代码！
    
    // --- 模拟调用开始 (请用你的真实代码替换) ---
    const aspectRatioMap: Record<string, string> = { "1:1": "1:1", "auto": "1:1" }
    const geminiAspectRatio = aspectRatioMap[aspectRatio] || "1:1"
    const messageContent: any[] = []
    if (mode === "image-to-image" && imageUrl) messageContent.push({ type: "image_url", image_url: { url: imageUrl } })
    messageContent.push({ type: "text", text: prompt })
    
    const requestParams: any = {
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: messageContent }],
      image_config: { aspect_ratio: geminiAspectRatio },
    }
    
    // 真实调用
    const completion = await openai.chat.completions.create(requestParams as any)
    const message = completion.choices[0]?.message as any
    let generatedImageUrl = ""
    if (message?.images?.[0]?.image_url?.url) generatedImageUrl = message.images[0].image_url.url
    else if (message.content && Array.isArray(message.content)) {
       const img = message.content.find((item: any) => item.type === "image_url")
       if (img) generatedImageUrl = img.image_url.url
    }
    if (!generatedImageUrl) throw new Error("API 生成失败")
    // --- 模拟调用结束 ---


    // ------------------------------------------------------------------
    // 5. 扣除积分 (关键步骤)
    // ------------------------------------------------------------------
    const COST_PER_IMAGE = 1; // 每次扣除 1 积分

    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: currentCredits - COST_PER_IMAGE })
      .eq('id', user.id)
      .select() // 加上 .select() 可以让我们看到更新后的结果

    if (updateError) {
      console.error("❌ 扣费失败报错:", updateError)
      // 即使扣费失败，因为图片已经生成了，我们还是返回图片给用户
      // 但会在后台记录这个严重错误
    } else {
      console.log(`✅ 扣费成功! 剩余积分: ${currentCredits - COST_PER_IMAGE}`)
    }

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
      remainingCredits: currentCredits - COST_PER_IMAGE,
      debugUpdateError: updateError ? updateError.message : null // 方便在前端调试看到错误
    })

  } catch (error: any) {
    console.error("Generate Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed" },
      { status: 500 }
    )
  }
}