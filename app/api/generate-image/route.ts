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
    // 1. 初始化 Supabase (普通用户模式) - 修复 Next.js 15 兼容性问题
    // ------------------------------------------------------------------
    const cookieStore = await cookies() // 关键修改：手动 await 获取 cookies
    
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ------------------------------------------------------------------
    // 2. 初始化 Supabase (上帝模式) - 专门用于扣费！
    // ------------------------------------------------------------------
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ 严重错误: 缺少 Supabase 环境变量")
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 })
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // ------------------------------------------------------------------
    // 3. 检查积分
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

    if (currentCredits < 1) { 
      return NextResponse.json(
        { error: "Insufficient credits", details: "积分不足" },
        { status: 403 }
      )
    }

    // ------------------------------------------------------------------
    // 4. 执行生成逻辑
    // ------------------------------------------------------------------
    const body = await request.json()
    const { prompt, mode, imageUrl, aspectRatio = "1:1" } = body

    // ---------------------------------------
    // 这里是你真实的 Gemini 调用逻辑 (模拟)
    // ---------------------------------------
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
    
    // 调用 API
    const completion = await openai.chat.completions.create(requestParams as any)
    const message = completion.choices[0]?.message as any
    let generatedImageUrl = ""
    if (message?.images?.[0]?.image_url?.url) generatedImageUrl = message.images[0].image_url.url
    else if (message.content && Array.isArray(message.content)) {
       const img = message.content.find((item: any) => item.type === "image_url")
       if (img) generatedImageUrl = img.image_url.url
    }
    if (!generatedImageUrl) throw new Error("API 生成失败")
    // ---------------------------------------


    // ------------------------------------------------------------------
    // 5. 扣除积分
    // ------------------------------------------------------------------
    const COST_PER_IMAGE = 1; 

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: currentCredits - COST_PER_IMAGE })
      .eq('id', user.id)

    if (updateError) {
      console.error("❌ 扣费失败报错:", updateError)
    } else {
      console.log(`✅ 扣费成功! 剩余积分: ${currentCredits - COST_PER_IMAGE}`)
    }

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
      remainingCredits: currentCredits - COST_PER_IMAGE
    })

  } catch (error: any) {
    console.error("Generate Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed" },
      { status: 500 }
    )
  }
}