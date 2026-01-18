"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Sparkles, X, Copy, Plus, Lock, Download, Check } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

type EditorMode = "image-to-image" | "text-to-image"

interface UploadedImage {
  id: string
  url: string
  name: string
}

export function EditorSection() {
  const { t } = useLocale()
  const [mode, setMode] = useState<EditorMode>("image-to-image")
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [prompt, setPrompt] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [selectedModel, setSelectedModel] = useState("nano-banana")
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const MAX_IMAGES = 9
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

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
          const newImage: UploadedImage = {
            id: crypto.randomUUID(),
            url: e.target?.result as string,
            name: file.name,
          }
          setUploadedImages((prev) => (prev.length < MAX_IMAGES ? [...prev, newImage] : prev))
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

  const copyPrompt = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt)
    }
  }

  const handleGenerate = async () => {
    if ((mode === "image-to-image" && uploadedImages.length === 0) || !prompt.trim()) {
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      console.log("开始生成图片...")
      console.log("生成参数:", {
        mode,
        hasPrompt: !!prompt,
        promptLength: prompt.length,
        hasUploadedImages: uploadedImages.length > 0,
        imageUrlLength: mode === "image-to-image" && uploadedImages.length > 0 
          ? uploadedImages[0].url?.length 
          : 0,
      })

      const requestBody = {
        prompt,
        mode,
        imageUrl: mode === "image-to-image" && uploadedImages.length > 0 
          ? uploadedImages[0].url 
          : undefined,
        aspectRatio: "auto", // Default aspect ratio for home page
      }

      console.log("请求体大小:", JSON.stringify(requestBody).length, "bytes")
      if (mode === "image-to-image" && requestBody.imageUrl) {
        console.log("图片 URL 前100字符:", requestBody.imageUrl.substring(0, 100))
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log(`API 响应状态: ${response.status} ${response.statusText}`)

      let data: any
      try {
        const text = await response.text()
        console.log("API 响应内容 (前500字符):", text.substring(0, 500))
        data = JSON.parse(text)
      } catch (parseError) {
        console.error("解析响应 JSON 失败:", parseError)
        throw new Error(`服务器返回了无效的响应格式。状态码: ${response.status}`)
      }

      if (!response.ok) {
        const errorMsg = data.error || data.message || "Failed to generate image"
        const details = data.details ? `\n详细信息: ${data.details}` : ""
        const suggestion = data.suggestion ? `\n建议: ${data.suggestion}` : ""
        const fullError = `${errorMsg}${details}${suggestion}`
        console.error("API 返回错误:", fullError)
        console.error("完整错误数据:", data)
        throw new Error(fullError)
      }

      if (data.success && data.imageUrl) {
        console.log("图片生成成功!")
        setGeneratedImage(data.imageUrl)
      } else {
        console.error("Unexpected response format:", data)
        throw new Error(data.error || "图片生成失败：API返回格式不正确")
      }
    } catch (error: any) {
      console.error("生成图片时出错:", error)
      const errorMsg = error.message || "未知错误"
      let fullErrorMsg = `图片生成失败: ${errorMsg}`
      
      // Add more context based on error type
      if (errorMsg.includes("网络连接失败") || errorMsg.includes("fetch failed") || errorMsg.includes("Failed to fetch")) {
        fullErrorMsg += `\n\n可能的原因：\n1. 网络连接问题\n2. OpenRouter API 无法访问\n3. 防火墙或代理设置\n4. API 服务暂时不可用\n\n建议：\n- 检查网络连接\n- 查看浏览器控制台和服务器日志获取更多信息\n- 确认 .env.local 文件中的 API key 正确\n- 确认已重启开发服务器\n- 稍后重试`
      } else if (errorMsg.includes("超时") || errorMsg.includes("timeout")) {
        fullErrorMsg += `\n\n请求超时，可能是：\n1. 网络速度较慢\n2. API 服务器响应慢\n3. 模型正在加载中\n\n建议：稍后重试`
      } else if (errorMsg.includes("API 密钥") || errorMsg.includes("401") || errorMsg.includes("unauthorized")) {
        fullErrorMsg += `\n\n认证失败：\n1. 请检查 .env.local 文件中的 OPENROUTER_API_KEY\n2. 确认 API key 正确无误\n3. 重启开发服务器以加载新的环境变量\n4. 查看服务器终端确认 API key 已加载`
      } else if (errorMsg.includes("速率限制") || errorMsg.includes("429") || errorMsg.includes("rate limit")) {
        fullErrorMsg += `\n\n请求过于频繁，请稍后重试`
      } else if (errorMsg.includes("未找到图片数据") || errorMsg.includes("响应格式")) {
        fullErrorMsg += `\n\nAPI 响应格式异常：\n1. 请查看服务器终端日志了解详细信息\n2. 可能是 API 参数配置问题\n3. 请检查 OpenRouter API 文档`
      }
      
      alert(fullErrorMsg)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
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
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 2000)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  return (
    <section id="generator" className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-banana-dark font-semibold mb-2">{t.getStarted}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {mode === "image-to-image" ? t.imageEdit : t.textToImage}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {mode === "image-to-image" ? t.transformExisting : t.generateNew}
          </p>
        </div>

        {/* Editor interface */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input panel */}
          <Card className="p-6 bg-card border-border">
            <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-banana-dark" />
              {t.promptInput}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">{t.differentModels}</p>

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

            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">{t.aiModelSelection}</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {selectedModel === "nano-banana"
                          ? "✨"
                          : selectedModel === "nano-banana-pro"
                            ? "⚡"
                            : "✨"}
                      </span>
                      <span>
                        {selectedModel === "nano-banana"
                          ? "Zlseren Basic"
                          : selectedModel === "nano-banana-pro"
                            ? "Zlseren Pro"
                            : "SeeDream 4"}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nano-banana">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      <span>Zlseren Basic</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="nano-banana-pro">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      <span>Zlseren Pro</span>
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

            <div className="mb-6 flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Batch Processing</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-banana text-banana-dark">
                  Pro
                </Badge>
              </div>
              <Switch checked={batchProcessing} onCheckedChange={() => {}} disabled />
            </div>
            <p className="text-xs text-muted-foreground mb-4 -mt-4 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Enable batch mode to process multiple images at once
            </p>

            {mode === "image-to-image" && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">{t.referenceImage}</label>
                  <span className="text-xs text-muted-foreground">
                    {uploadedImages.length}/{MAX_IMAGES}
                  </span>
                </div>

                {/* Uploaded images grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
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
                    </div>
                  ))}

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
              </div>
            )}

            {/* Prompt input */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Main Prompt</label>
                <button onClick={copyPrompt} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === "image-to-image"
                    ? "Describe how you want to transform your image..."
                    : "Describe the image you want to generate..."
                }
                className="min-h-[100px] resize-none"
              />
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
                  {t.generateNow}
                </>
              )}
            </Button>
          </Card>

          {/* Output panel */}
          <Card className="p-6 bg-card border-border">
            <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-banana-dark" />
              {t.outputGallery}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">{t.tipsContent}</p>

            {/* Output display */}
            <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center text-center p-8 overflow-hidden relative group">
              {isGenerating ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-banana-light flex items-center justify-center mb-4 animate-pulse">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <p className="font-medium text-foreground mb-2">{t.generating}</p>
                </div>
              ) : generatedImage ? (
                <>
                  <img
                    src={generatedImage || "/placeholder.svg"}
                    alt="Generated result"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => downloadImage(generatedImage, "nano-banana-output.png")}
                    className="w-full mt-4 bg-banana text-accent-foreground hover:bg-banana-dark"
                  >
                    {downloadSuccess ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {t.downloaded || "Downloaded!"}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        {t.download}
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-banana-light flex items-center justify-center mb-4">
                    <span className="text-3xl">✨</span>
                  </div>
                  <p className="font-medium text-foreground mb-2">{t.readyForGeneration}</p>
                  <p className="text-sm text-muted-foreground">{t.enterPrompt}</p>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
