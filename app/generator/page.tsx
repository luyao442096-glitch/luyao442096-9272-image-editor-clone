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

type EditorMode = "image-to-image" | "text-to-image"

interface UploadedImage {
  id: string
  url: string
  name: string
}

interface GeneratedImage {
  id: string
  url: string
  prompt: string
}

interface ImageAnalysis {
  imageId: string
  analysis: string
  prompt: string
}

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
  
  // 初始化 Supabase
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

  // --- 核心修复区域 ---
  const handleGenerate = async () => {
    if ((mode === "image-to-image" && uploadedImages.length === 0) || !prompt.trim()) {
      return
    }

    setIsGenerating(true)

    try {
      // 1. 获取最新 Token (强制刷新)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session || !session.access_token) {
         // 如果没 Token，说明登录彻底过期了
         alert("⚠️ 登录已过期，请点击右上角【退出】后重新登录！")
         setIsGenerating(false)
         return
      }

      const token = session.access_token
      console.log("✅ 正在使用 Token 发起请求...")

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
            // ✅ 修复：把大模型参数加回来了！
            model: selectedModel 
          }
          
          const response = await fetch("/api/generate-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // ✅ 修复：手动带上 Token
              "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(requestBody),
          })

          let data: any
          try {
            const text = await response.text()
            data = JSON.parse(text)
          } catch (e) {
            throw new Error(`服务器响应格式错误: ${response.status}`)
          }

          if (!response.ok) {
            // 如果是 401，提示用户去登录
            if (response.status === 401) {
                throw new Error("Unauthorized: 您的登录凭证已失效，请退出并重新登录")
            }
            throw new Error(data.error || data.message || "生成失败")
          }

          if (data.success && data.imageUrl) {
            newImages.push({
              id: crypto.randomUUID(),
              url: data.imageUrl,
              prompt,
            })
          } else {
            throw new Error(data.error || "未返回图片数据")
          }
        } catch (error: any) {
          console.error(`生成错误:`, error)
          if (i === 0) alert(`生成失败: ${error.message}`)
          if (count === 1) throw error
        }
      }
      setGeneratedImages((prev) => [...newImages, ...prev])
    } catch (error: any) {
      console.error("Critical error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = async (imageUrl: string, filename: string, imageId?: string) => {
    try {
      if (imageId) setDownloadingId(imageId)
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      if (imageId) {
        setDownloadedIds((prev) => new Set([...prev, imageId]))
        setTimeout(() => setDownloadedIds((prev) => {
            const next = new Set(prev); next.delete(imageId); return next;
        }), 2000)
      }
    } catch (error) { console.error(error) } finally { setDownloadingId(null) }
  }

  const downloadAllImages = () => {
    generatedImages.forEach((img, index) => {
      setTimeout(() => downloadImage(img.url, `nano-banana-${index + 1}.png`), index * 500)
    })
  }

  const analyzeImage = async (imageId: string, imageUrl: string) => {
    if (analyzingId) return
    setAnalyzingId(imageId)
    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, prompt: analysisPrompt }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setAnalyses((prev) => {
        const next = new Map(prev)
        next.set(imageId, { imageId, analysis: data.analysis, prompt: analysisPrompt })
        return next
      })
    } catch (error: any) { alert(error.message) } finally { setAnalyzingId(null) }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            <span className="text-foreground font-medium">{t.generator}</span>
          </div>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <span className="text-4xl">🍌</span>
              {mode === "image-to-image" ? t.imageEdit : t.textToImage}
            </h1>
            <p className="text-muted-foreground">{mode === "image-to-image" ? t.transformExisting : t.generateNew}</p>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-[1fr,400px] gap-8">
            {/* Left Panel - Input */}
            <Card className="p-6 bg-card border-border">
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg w-fit">
                <button
                  onClick={() => setMode("image-to-image")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === "image-to-image"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.imageEdit}
                </button>
                <button
                  onClick={() => setMode("text-to-image")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === "text-to-image"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.textToImage}
                </button>
              </div>

              {/* Prompt Input */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">{t.promptInput}</h3>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    mode === "image-to-image"
                      ? "Describe how you want to transform your image..."
                      : "Describe the image you want to generate..."
                  }
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* AI Model Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">{t.aiModelSelection}</h3>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍌</span>
                        <span>
                          {selectedModel === "nano-banana"
                            ? "Nano Banana"
                            : selectedModel === "nano-banana-pro"
                              ? "Nano Banana Pro"
                              : "SeeDream 4"}
                        </span>
                        {selectedModel === "nano-banana-pro" && (
                          <Badge className="bg-banana text-accent-foreground text-[10px] px-1">PRO</Badge>
                        )}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nano-banana">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍌</span>
                        <span>Nano Banana</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="nano-banana-pro">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍌</span>
                        <span>Nano Banana Pro</span>
                        <Badge className="bg-banana text-accent-foreground text-[10px] px-1">PRO</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="seedream-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <span>SeeDream 4</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1.5">{t.differentModels}</p>
              </div>

              {/* Resolution Settings */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">{t.resolutionSettings}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">{t.aspectRatio}</label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASPECT_RATIOS.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">{t.generationCount}</label>
                    <Select value={generationCount} onValueChange={setGenerationCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GENERATION_COUNTS.map((count) => (
                          <SelectItem key={count.value} value={count.value}>
                            {count.label} {t.images}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-banana-dark" />
                  {t.resolution2k4k}
                </p>
              </div>

              {/* Image Analysis Section */}
              {mode === "image-to-image" && uploadedImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-2">Image Analysis</h3>
                  <Textarea
                    value={analysisPrompt}
                    onChange={(e) => setAnalysisPrompt(e.target.value)}
                    placeholder="What would you like to know about the image?"
                    className="min-h-[60px] resize-none mb-2 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mb-3">
                    Ask questions about your uploaded images using AI vision analysis
                  </p>
                </div>
              )}

              {/* Reference Images (Image-to-Image mode only) */}
              {mode === "image-to-image" && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{t.referenceImage}</h3>
                    <span className="text-xs text-muted-foreground">
                      {uploadedImages.length}/{MAX_IMAGES}
                    </span>
                  </div>

                  {/* Uploaded images grid */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {uploadedImages.map((image) => {
                      const analysis = analyses.get(image.id)
                      return (
                        <div key={image.id} className="space-y-2">
                          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeImage(image.id)}
                              className="absolute top-1 right-1 p-1 bg-foreground/80 text-background rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => analyzeImage(image.id, image.url)}
                              disabled={analyzingId === image.id}
                              className="absolute bottom-1 left-1 p-1.5 bg-banana text-accent-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                              title="Analyze image"
                            >
                              {analyzingId === image.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          {analysis && (
                            <div className="p-2 bg-muted rounded-lg text-xs">
                              <p className="font-medium mb-1 text-foreground">Analysis:</p>
                              <p className="text-muted-foreground line-clamp-3">{analysis.analysis}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Add image button */}
                    {uploadedImages.length < MAX_IMAGES && (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault()
                          setIsDragging(true)
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`
                          aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer
                          transition-colors duration-200
                          ${
                            isDragging
                              ? "border-banana bg-banana-light/30"
                              : "border-border hover:border-banana/50 hover:bg-secondary/50"
                          }
                        `}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="image-upload"
                          multiple
                        />
                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center p-2">
                          <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-[10px] text-muted-foreground text-center">{t.addImage}</span>
                          <span className="text-[9px] text-muted-foreground">{t.maxSize}</span>
                        </label>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" size="sm" className="w-full text-xs bg-transparent" disabled>
                    <ImageIcon className="w-3 h-3 mr-1" />
                    {t.selectFromLibrary}
                  </Button>
                </div>
              )}

              {/* Notify checkbox */}
              <div className="flex items-center space-x-2 mb-6">
                <Checkbox
                  id="notify"
                  checked={notifyWhenDone}
                  onCheckedChange={(checked) => setNotifyWhenDone(checked as boolean)}
                />
                <label htmlFor="notify" className="text-sm text-muted-foreground">
                  {t.notifyWhenDone}
                </label>
              </div>

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (mode === "image-to-image" && uploadedImages.length === 0) || !prompt.trim()}
                className="w-full bg-banana text-accent-foreground hover:bg-banana-dark h-12 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin mr-2" />
                    {t.generating}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t.generateNow} ({CREDITS_PER_GENERATION} {t.credits})
                  </>
                )}
              </Button>

              {!user && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  <Link href="/login" className="text-banana-dark hover:underline">
                    Sign in
                  </Link>{" "}
                  to save your generations and get more credits
                </p>
              )}
            </Card>

            {/* Right Panel - Output */}
            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-banana-dark" />
                    {t.outputGallery}
                  </h3>
                  {generatedImages.length > 0 && (
                    <Button variant="outline" size="sm" onClick={downloadAllImages}>
                      <Download className="w-4 h-4 mr-1" />
                      {t.downloadAll}
                    </Button>
                  )}
                </div>

                {/* Output display */}
                {isGenerating ? (
                  <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-banana-light flex items-center justify-center mb-4 animate-pulse">
                      <span className="text-3xl">🍌</span>
                    </div>
                    <p className="font-medium text-foreground mb-2">{t.generating}</p>
                  </div>
                ) : generatedImages.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {generatedImages.slice(0, 4).map((img) => (
                        <div key={img.id} className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
                          <img
                            src={img.url || "/placeholder.svg"}
                            alt={img.prompt}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => downloadImage(img.url, `nano-banana-${img.id.slice(0, 8)}.png`, img.id)}
                            className={`absolute bottom-2 right-2 p-2 rounded-lg transition-all ${
                              downloadedIds.has(img.id)
                                ? "bg-green-500 text-background"
                                : "bg-foreground/80 text-background opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            {downloadingId === img.id ? (
                              <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                            ) : downloadedIds.has(img.id) ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={downloadAllImages}
                      className="w-full bg-banana text-accent-foreground hover:bg-banana-dark"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t.download} ({generatedImages.length} {t.images})
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-banana-light flex items-center justify-center mb-4">
                      <span className="text-3xl">🍌</span>
                    </div>
                    <p className="font-medium text-foreground mb-2">{t.readyForGeneration}</p>
                    <p className="text-sm text-muted-foreground">{t.enterPrompt}</p>
                  </div>
                )}
              </Card>

              {/* Tips Card */}
              <Card className="p-4 bg-banana-light/30 border-banana/30">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-banana-dark flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground text-sm mb-1">{t.tips}</h4>
                    <p className="text-xs text-muted-foreground">{t.tipsContent}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}