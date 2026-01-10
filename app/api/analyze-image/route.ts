import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title": process.env.SITE_NAME || "Image Editor",
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, prompt = "What is in this image?" } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured" },
        { status: 500 }
      )
    }

    // Handle both data URLs (base64) and regular URLs
    const imageUrlForAPI = imageUrl.startsWith("data:") 
      ? imageUrl 
      : imageUrl

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrlForAPI,
              },
            },
          ],
        },
      ],
    })

    const response = completion.choices[0]?.message?.content || "No response generated"

    return NextResponse.json({ 
      success: true,
      analysis: response,
      model: "google/gemini-2.5-flash-image"
    })
  } catch (error: any) {
    console.error("Image analysis error:", error)
    return NextResponse.json(
      { 
        error: error.message || "Failed to analyze image",
        details: error.response?.data || null
      },
      { status: 500 }
    )
  }
}

