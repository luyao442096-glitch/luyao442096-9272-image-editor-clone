import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

// Using OpenRouter Gemini 2.5 Flash Image API for image generation
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
    const body = await request.json()
    const { prompt, mode, imageUrl, aspectRatio = "1:1" } = body

    console.log("收到图片生成请求:", { prompt, mode, aspectRatio, hasImage: !!imageUrl })

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to .env.local" },
        { status: 500 }
      )
    }

    console.log("已找到 OpenRouter API Key")

    // Map aspect ratios to Gemini supported formats
    // Supported: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
    const aspectRatioMap: Record<string, string> = {
      "1:1": "1:1",
      "4:3": "4:3",
      "3:4": "3:4",
      "16:9": "16:9",
      "9:16": "9:16",
      "auto": "1:1", // Default to 1:1 for auto
    }

    const geminiAspectRatio = aspectRatioMap[aspectRatio] || "1:1"

    // Build the message content
    // For image-to-image mode, put image first, then text
    // For text-to-image mode, only text
    const messageContent: any[] = []

    // Add image if provided (for image-to-image mode)
    // Image should come before text for better context
    if (mode === "image-to-image" && imageUrl) {
      // Validate image URL format
      if (!imageUrl) {
        throw new Error("图片编辑模式需要提供参考图片")
      }
      
      if (!imageUrl.startsWith("data:") && !imageUrl.startsWith("http")) {
        throw new Error("图片 URL 格式无效。请确保图片已正确上传。")
      }
      
      // Check if it's a data URL and validate format
      if (imageUrl.startsWith("data:")) {
        const dataUrlMatch = imageUrl.match(/^data:([^;]+);base64,(.+)$/)
        if (!dataUrlMatch) {
          throw new Error("图片数据格式无效。请重新上传图片。")
        }
        const mimeType = dataUrlMatch[1]
        const base64Data = dataUrlMatch[2]
        
        // Validate MIME type
        if (!mimeType.startsWith("image/")) {
          throw new Error(`不支持的图片格式: ${mimeType}`)
        }
        
        // Estimate size (base64 is ~33% larger than binary)
        const estimatedSize = (base64Data.length * 3) / 4
        const maxSize = 7 * 1024 * 1024 // 7MB limit
        if (estimatedSize > maxSize) {
          throw new Error(`图片太大 (约 ${Math.round(estimatedSize / 1024 / 1024)}MB)。请使用小于 7MB 的图片。`)
        }
        
        console.log("图片数据验证通过:", {
          mimeType,
          estimatedSizeMB: Math.round(estimatedSize / 1024 / 1024 * 100) / 100,
          base64Length: base64Data.length,
        })
      }
      
      messageContent.push({
        type: "image_url",
        image_url: {
          url: imageUrl, // Can be data URL or regular URL
        },
      })
      console.log("已添加参考图片到请求中，URL 长度:", imageUrl.length)
    } else if (mode === "image-to-image" && !imageUrl) {
      throw new Error("图片编辑模式需要上传参考图片")
    }

    // Add text prompt
    // For text-to-image mode, enhance prompt to explicitly request image generation
    // Gemini 2.5 Flash Image needs clear instructions to generate images, not just descriptions
    let enhancedPrompt = prompt.trim()
    
    if (mode === "text-to-image") {
      // Always add explicit English instruction to ensure image generation
      // Even if the prompt contains Chinese keywords, add English instruction for better API compatibility
      const promptLower = enhancedPrompt.toLowerCase()
      
      // Check if it already starts with explicit image generation command in English
      const hasExplicitEnglishCommand = /^(generate|create|draw|make|design)\s+(an\s+)?image/i.test(enhancedPrompt)
      
      if (!hasExplicitEnglishCommand) {
        // Add clear English instruction at the beginning
        // This ensures the API understands we want an image, not text description
        enhancedPrompt = `Generate an image: ${enhancedPrompt}`
      }
    } else {
      // For image-to-image, the prompt should describe the transformation
      enhancedPrompt = prompt
    }
    
    messageContent.push({
      type: "text",
      text: enhancedPrompt,
    })
    
    console.log("原始提示词:", prompt)
    console.log("增强后提示词:", enhancedPrompt)

    console.log("调用 Gemini 2.5 Flash Image API...")
    console.log("模式:", mode)
    console.log("提示词:", prompt.substring(0, 100) + (prompt.length > 100 ? "..." : ""))
    console.log("宽高比:", geminiAspectRatio)
    console.log("包含图片:", mode === "image-to-image" && !!imageUrl)
    console.log("消息内容结构:", JSON.stringify(messageContent.map(item => ({
      type: item.type,
      hasText: !!item.text,
      hasImageUrl: !!item.image_url?.url,
      imageUrlLength: item.image_url?.url?.length || 0
    })), null, 2))

    try {
      // Build request parameters
      // For text-to-image, prioritize image generation
      const requestParams: any = {
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: messageContent,
          },
        ],
        // Enable image generation (OpenRouter-specific parameters)
        // For text-to-image, only request image output to avoid text responses
        // For image-to-image, allow both image and text (text might be description)
        modalities: mode === "text-to-image" ? ["image"] : ["image", "text"],
        image_config: {
          aspect_ratio: geminiAspectRatio,
        },
      }
      
      // For text-to-image mode, add explicit instruction in system message if needed
      // This helps ensure the model generates images instead of text descriptions

      console.log("发送 API 请求，参数:", {
        model: requestParams.model,
        modalities: requestParams.modalities,
        image_config: requestParams.image_config,
        messageContentTypes: messageContent.map(item => item.type),
      })

      // Use type assertion to pass OpenRouter-specific parameters
      // These parameters are not in OpenAI SDK types but are supported by OpenRouter
      const completion = await openai.chat.completions.create(requestParams as any)

      console.log("API 响应:", {
        model: completion.model,
        choices: completion.choices?.length,
        fullResponse: JSON.stringify(completion, null, 2).substring(0, 1000), // 前1000字符用于调试
      })

      // Extract image from response
      const message = completion.choices[0]?.message
      if (!message) {
        console.error("API 响应中没有 message:", completion)
        throw new Error("API 返回了空的响应")
      }

      // Type assertion for OpenRouter-specific response format
      // OpenRouter's Gemini 2.5 Flash Image returns images in a non-standard format
      const messageWithImages = message as any

      console.log("Message 结构:", {
        hasImages: !!messageWithImages.images,
        imagesLength: messageWithImages.images?.length,
        hasContent: !!message.content,
        contentType: typeof message.content,
        messageKeys: Object.keys(message),
      })

      // Check if response contains images array (Gemini 2.5 Flash Image format)
      if (messageWithImages.images && Array.isArray(messageWithImages.images) && messageWithImages.images.length > 0) {
        const imageItem = messageWithImages.images[0]
        console.log("找到 images 数组，第一个元素:", imageItem)
        if (imageItem && imageItem.image_url && imageItem.image_url.url) {
          const generatedImageUrl = imageItem.image_url.url
          console.log("图片生成成功! URL 长度:", generatedImageUrl.length)
          
          return NextResponse.json({
            success: true,
            imageUrl: generatedImageUrl,
            prompt,
            model: "google/gemini-2.5-flash-image",
            aspectRatio,
            mode,
          })
        } else {
          console.warn("images 数组中的元素格式不正确:", imageItem)
        }
      }

      // Fallback: check content field (some APIs might use this)
      if (message.content) {
        console.log("检查 content 字段...")
        // The content might be an array or a string
        const content = Array.isArray(message.content) ? message.content : [message.content]
        console.log("Content 类型:", typeof message.content, "是否为数组:", Array.isArray(message.content))
        
        // Find image content
        const imageContent = content.find((item: any) => item && (item.type === "image_url" || item.type === "image"))
        console.log("找到的 imageContent:", imageContent)
        
        if (imageContent && imageContent.image_url && imageContent.image_url.url) {
          const generatedImageUrl = imageContent.image_url.url
          console.log("图片生成成功 (从 content 字段)! URL 长度:", generatedImageUrl.length)
          
          return NextResponse.json({
            success: true,
            imageUrl: generatedImageUrl,
            prompt,
            model: "google/gemini-2.5-flash-image",
            aspectRatio,
            mode,
          })
        }
      }

      // If no image found, check for text response (might be an error message)
      let textContent: any = null
      const messageContentValue = message.content
      if (typeof messageContentValue === 'string') {
        textContent = messageContentValue
      } else if (Array.isArray(messageContentValue)) {
        const textItem = (messageContentValue as any[]).find((item: any) => item && item.type === "text")
        textContent = textItem?.text || null
      }
      
      if (textContent) {
        console.warn("API 返回了文本而不是图片:", textContent)
        console.warn("这可能是因为提示词不够明确，模型返回了文本描述而不是生成图片")
        console.warn("尝试使用更明确的提示词，例如：'Generate an image of...' 或 'Create a picture of...'")
        
        // Provide helpful error message
        const errorMessage = `API 返回了文本响应而不是图片。\n\n返回的文本: ${textContent.substring(0, 200)}${textContent.length > 200 ? '...' : ''}\n\n可能的原因：\n1. 提示词不够明确，模型理解为文本描述请求\n2. 提示词需要更明确地要求生成图片\n\n建议：\n- 在提示词中添加"生成图片"、"create an image"等明确指令\n- 例如："生成一张路飞24节气海报图" 改为 "生成一张图片：路飞24节气海报图"\n- 或者使用英文："Generate an image of Luffy 24 solar terms poster"`
        throw new Error(errorMessage)
      }
      
      // Log full message structure for debugging
      console.error("完整的 message 结构:", JSON.stringify(message, null, 2))
      throw new Error("API 响应中未找到图片数据。请查看服务器日志了解详细信息。")
    } catch (error: any) {
      console.error("Gemini API 错误详情:", {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        response: error.response?.data,
        stack: error.stack,
      })
      
      // Handle specific error types
      if (error.status === 401 || error.message?.includes('401') || error.message?.includes('unauthorized')) {
        return NextResponse.json(
          {
            error: "API 密钥无效或缺失",
            details: "请检查您的 OPENROUTER_API_KEY 环境变量",
            suggestion: "在 .env.local 文件中添加有效的 OpenRouter API Key，然后重启服务器",
          },
          { status: 401 }
        )
      }
      
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('rate limit')) {
        return NextResponse.json(
          {
            error: "请求过于频繁，请稍后重试",
            details: "已达到速率限制",
            suggestion: "请稍后再试或升级您的 OpenRouter 计划",
          },
          { status: 429 }
        )
      }

      // Check for API parameter errors
      if (error.message?.includes('modalities') || error.message?.includes('image_config')) {
        console.error("API 参数错误，可能需要调整调用方式")
        return NextResponse.json(
          {
            error: "API 参数错误",
            details: error.message,
            suggestion: "请检查 OpenRouter API 文档确认正确的参数格式",
          },
          { status: 400 }
        )
      }
      
      // Return detailed error for debugging
      return NextResponse.json(
        {
          error: error.message || "API 调用失败",
          details: error.response?.data || error.stack?.substring(0, 500),
          suggestion: "请查看服务器日志获取更多信息",
        },
        { status: error.status || 500 }
      )
    }
  } catch (error: any) {
    console.error("Image generation error (外层捕获):", {
      message: error.message,
      name: error.name,
      status: error.status,
      statusCode: error.statusCode,
      response: error.response?.data,
      stack: error.stack?.substring(0, 500),
    })
    
    // If error already has a status, return it
    if (error.status || error.statusCode) {
      return NextResponse.json(
        {
          error: error.message || "Failed to generate image",
          details: error.response?.data || error.details,
          suggestion: error.suggestion || "请查看服务器日志获取更多信息",
        },
        { status: error.status || error.statusCode || 500 }
      )
    }
    
    // Generic error response
    return NextResponse.json(
      {
        error: error.message || "Failed to generate image",
        details: error.response?.data || error.stack?.substring(0, 500),
        suggestion: "请查看服务器日志获取更多信息",
      },
      { status: 500 }
    )
  }
}
