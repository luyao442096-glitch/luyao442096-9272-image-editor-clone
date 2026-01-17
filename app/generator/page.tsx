"use client"

import type React from "react"
import { useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageIcon, Sparkles, X, Plus, Download, ChevronDown, Home, Lightbulb, Crown, Check, Eye, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { useLocale } from "@/lib/locale-context"
import { useAuth } from "@/lib/auth-context"
// 引入 Supabase 客户端
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// ... (类型定义保持不变，为了节省篇幅省略，请保留你原有的类型定义) ...
type EditorMode = "image-to-image" | "text-to-image"
interface UploadedImage { id: string; url: string; name: string }
interface GeneratedImage { id: string; url: string; prompt: string }
interface ImageAnalysis { imageId: string; analysis: string; prompt: string }

const ASPECT_RATIOS = [
  { value: "auto", label: "Auto" },
  { value: "1:1", label: "Square (1:1)" },
  { value: "4:3", label: "Landscape (4:3)" },
  { value: "3:4", label: "Portrait (3:4)" },
  { value: "16:9", label: "Widescreen (16:9)" },
  { value: "9:16", label: "Vertical (9:16)" },
]
const GENERATION_COUNTS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
]

export default function GeneratorPage() {
  const { t } = useLocale()
  const { user } = useAuth()
  
  // ✅ 初始化 Supabase
  const supabase = createClientComponentClient()

  const [mode, setMode] = useState<EditorMode>("image-to-image")
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [prompt, setPrompt] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [selectedModel, setSelectedModel] = useState("nano-banana")
  const [aspectRatio, setAspectRatio] = useState("auto")
  const [generationCount, setGenerationCount] = useState("1")
  const [notifyWhenDone, setNotifyWhenDone] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set())
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [analyses, setAnalyses] = useState<Map<string, ImageAnalysis>>(new Map())
  const [analysisPrompt, setAnalysisPrompt] = useState("What is in this image?")

  const MAX_IMAGES = 9
  const MAX_FILE_SIZE = 10 * 1024 * 1024 
  const CREDITS_PER_GENERATION = 2

  // ... (保留原本的 handleDrop, handleFiles, handleFileSelect, removeImage 函数，不变) ...
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE)
    imageFiles.forEach((file) => {
      if (uploadedImages.length < MAX_IMAGES) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedImages((prev) => (prev.length < MAX_IMAGES ? [...prev, {
            id: crypto.randomUUID(),
            url: e.target?.result as string,
            name: file.name,
          }] : prev))
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id))
  }

  // ✅ 重点修改了 handleGenerate 函数
  const handleGenerate = async () => {
    if ((mode === "image-to-image" && uploadedImages.length === 0) || !prompt.trim()) {
      return
    }

    setIsGenerating(true)

    try {
      // 1. 获取 Token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      // 2. 调试检查：如果没有 Token，直接提示用户重新登录
      if (!token) {
         alert("⚠️ 身份验证信息已过期，无法扣除积分。\n\n请点击右上角【退出登录】，然后【重新登录】即可解决！")
         setIsGenerating(false)
         return
      }

      console.log("✅ 成功获取 Token，准备发送请求...")

      const count = Number.parseInt(generationCount)
      const newImages: GeneratedImage[] = []

      for (let i = 0; i < count; i++) {
        try {
          console.log(`开始生成图片 ${i + 1}/${count}...`)
          
          const requestBody = {
            prompt,
            mode,
            imageUrl: mode === "image-to-image" && uploadedImages.length > 0 
              ? uploadedImages[0].url 
              : undefined,
            aspectRatio,
          }
          
          const response = await fetch("/api/generate-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // 3. 在这里携带身份证
              "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(requestBody),
          })

          console.log(`API 响应状态: ${response.status} ${response.statusText}`)

          let data: any
          try {
            const text = await response.text()
            data = JSON.parse(text)
          } catch (parseError) {
            console.error("解析响应 JSON 失败:", parseError)
            throw new Error(`服务器返回了无效的响应格式。状态码: ${response.status}`)
          }

          if (!response.ok) {
            const errorMsg = data.error || data.message || "Failed to generate image"
            const details = data.details ? `\n详细信息: ${data.details}` : ""
            console.error("API 返回错误:", errorMsg)
            throw new Error(`${errorMsg}${details}`)
          }

          if (data.success && data.imageUrl) {
            newImages.push({
              id: crypto.randomUUID(),
              url: data.imageUrl,
              prompt,
            })
          } else {
            throw new Error(data.error || "图片生成失败")
          }
        } catch (error: any) {
          console.error(`生成图片 ${i + 1} 时出错:`, error)
          if (i === 0) alert(`生成失败: ${error.message}`)
          if (count === 1) throw error
        }
      }
      setGeneratedImages((prev) => [...newImages, ...prev])
    } catch (error: any) {
      console.error("Generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  // ... (保留 downloadImage, downloadAllImages, analyzeImage 和 return JSX 部分，完全不变) ...
  // 为了确保代码完整，请只覆盖 handleGenerate 及其上方的代码，或者如果你不确定，
  // 最好把整个文件内容发给我，我帮你合成好。
  // 但既然你之前自己修改过，只需确保 handleGenerate 里有 "Authorization": `Bearer ${token}` 这一行即可。
  
  // (为节省篇幅，这里省略了后面的辅助函数和 JSX，请保留你文件里原有的这部分)
  const downloadImage = async (imageUrl: string, filename: string, imageId?: string) => { /*...*/ }
  const downloadAllImages = () => { /*...*/ }
  const analyzeImage = async (imageId: string, imageUrl: string) => { /*...*/ }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      {/* ... 你的 JSX 代码 ... */}
      <div className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* ... */}
           {/* 请确保这里的 Button onClick 绑定的是 handleGenerate */}
           {/* ... */}
           <Button
                onClick={handleGenerate}
                disabled={isGenerating || (mode === "image-to-image" && uploadedImages.length === 0) || !prompt.trim()}
                className="w-full bg-banana text-accent-foreground hover:bg-banana-dark h-12 disabled:opacity-50"
              >
            {/* ... */}
          </Button>
          {/* ... */}
        </div>
      </div>
    </main>
  )
}