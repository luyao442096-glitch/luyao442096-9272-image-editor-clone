"use client"

import { Metadata } from "next"
import type React from "react"

// 生成器页面特定的元数据
export const metadata: Metadata = {
  title: "生成器 - Zlseren AI 智能助手",
  description: "使用简单的文本提示生成或编辑图像。Zlseren AI 智能助手提供高级的图像编辑功能，支持角色一致性和场景保留。",
  keywords: [
    "AI 图像生成器",
    "Zlseren 生成器",
    "图像到图像",
    "文本到图像",
    "AI 图像编辑",
    "图像生成",
    "AI 智能助手"
  ],
  openGraph: {
    title: "生成器 - Zlseren AI 智能助手",
    description: "使用简单的文本提示生成或编辑图像。Zlseren AI 智能助手提供高级的图像编辑功能，支持角色一致性和场景保留。",
    url: "https://www.zlseren.online/generator"
  },
  twitter: {
    title: "生成器 - Zlseren AI 智能助手",
    description: "使用简单的文本提示生成或编辑图像。Zlseren AI 智能助手提供高级的图像编辑功能，支持角色一致性和场景保留。",
  },
  alternates: {
    canonical: "https://www.zlseren.online/generator"
  }
}
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
import { createClient } from "@/lib/supabase/client"

// 类型定义
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
const GENERATION_COUNTS = [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]

export default function GeneratorPage() {
  const { t } = useLocale()
  const { user } = useAuth()
  const supabase = createClient()

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
  const CREDITS_PER_GENERATION = 2 // 实际上后端扣1分，前端显示2分? 按你的原代码保留

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFiles(Array.from(e.dataTransfer.files)) }, [])
  const handleFiles = (files: File[]) => {
     const imageFiles = files.filter((file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE)
     imageFiles.forEach((file) => {
       if (uploadedImages.length < MAX_IMAGES) {
         const reader = new FileReader()
         reader.onload = (e) => setUploadedImages((prev) => (prev.length < MAX_IMAGES ? [...prev, { id: crypto.randomUUID(), url: e.target?.result as string, name: file.name }] : prev))
         reader.readAsDataURL(file)
       }
     })
  }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => handleFiles(Array.from(e.target.files || []))
  const removeImage = (id: string) => setUploadedImages((prev) => prev.filter((img) => img.id !== id))

  // ✅ 核心生成函数
  const handleGenerate = async () => {
    if ((mode === "image-to-image" && uploadedImages.length === 0) || !prompt.trim()) return

    setIsGenerating(true)

    try {
      // 1. 获取最新 Token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
         alert("⚠️ 您的登录状态已失效，无法验证身份。\n\n请点击右上角头像 -> 退出登录 -> 然后重新登录。")
         setIsGenerating(false)
         return
      }

      const count = Number.parseInt(generationCount)
      const newImages: GeneratedImage[] = []

      for (let i = 0; i < count; i++) {
        try {
          // 2. 发送请求
          const response = await fetch("/api/generate-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({
              prompt,
              mode,
              imageUrl: mode === "image-to-image" && uploadedImages.length > 0 ? uploadedImages[0].url : undefined,
              aspectRatio,
              model: selectedModel // ✅ 确保模型参数传给后端
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            // 如果出错，显示后端返回的详细 details
            const errorMsg = data.details || data.error || "请求失败"
            throw new Error(errorMsg)
          }

          if (data.success && data.imageUrl) {
            newImages.push({ id: crypto.randomUUID(), url: data.imageUrl, prompt })
          }
        } catch (error: any) {
          console.error("生成出错:", error)
          // 只有第一张出错时弹窗
          if (i === 0) alert(`❌ 生成失败: ${error.message}`)
          if (count === 1) throw error
        }
      }
      setGeneratedImages((prev) => [...newImages, ...prev])
    } catch (error) { 
        // 这里的错误已经在上面处理过了，或者会被静默
    } finally { 
        setIsGenerating(false) 
    }
  }

  // ... 其余辅助函数保持不变 ...
  const downloadImage = async (imageUrl: string, filename: string, imageId?: string) => {
      try {
        if (imageId) setDownloadingId(imageId); const res = await fetch(imageUrl); const blob = await res.blob();
        const url = window.URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
        if (imageId) { setDownloadedIds(p=>new Set([...p,imageId])); setTimeout(()=>setDownloadedIds(p=>{const n=new Set(p);n.delete(imageId);return n}),2000) }
      } catch(e){console.error(e)} finally{setDownloadingId(null)}
  }
  const downloadAllImages = () => generatedImages.forEach((img, i) => setTimeout(() => downloadImage(img.url, `img-${i}.png`), i * 500))
  const analyzeImage = async (imageId: string, imageUrl: string) => {
      if(analyzingId)return; setAnalyzingId(imageId);
      try{
          const res=await fetch("/api/analyze-image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageUrl,prompt:analysisPrompt})});
          const d=await res.json(); if(!res.ok)throw new Error(d.error);
          setAnalyses(p=>{const n=new Map(p);n.set(imageId,{imageId,analysis:d.analysis,prompt:analysisPrompt});return n})
      }catch(e:any){alert(e.message)}finally{setAnalyzingId(null)}
  }

  // ... JSX ...
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb & Title */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6"><Link href="/" className="hover:text-foreground flex items-center gap-1"><Home className="w-4 h-4"/>Home</Link><ChevronDown className="w-4 h-4 rotate-[-90deg]"/><span className="text-foreground font-medium">{t.generator}</span></div>
          <div className="mb-8"><h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3"><span className="text-4xl">🍌</span>{mode === "image-to-image" ? t.imageEdit : t.textToImage}</h1><p className="text-muted-foreground">{mode === "image-to-image" ? t.transformExisting : t.generateNew}</p></div>
          
          <div className="grid lg:grid-cols-[1fr,400px] gap-8">
            <Card className="p-6 bg-card border-border">
              {/* Controls */}
              <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg w-fit">
                <button onClick={() => setMode("image-to-image")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === "image-to-image"?"bg-background text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>{t.imageEdit}</button>
                <button onClick={() => setMode("text-to-image")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === "text-to-image"?"bg-background text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>{t.textToImage}</button>
              </div>
              <div className="mb-6"><h3 className="font-semibold text-foreground mb-2">{t.promptInput}</h3><Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={mode === "image-to-image" ? "Describe..." : "Describe..."} className="min-h-[120px] resize-none"/></div>
              
              <div className="mb-6"><h3 className="font-semibold text-foreground mb-2">{t.aiModelSelection}</h3>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nano-banana"><div className="flex items-center gap-2"><span>🍌</span><span>Nano Banana</span></div></SelectItem>
                    <SelectItem value="nano-banana-pro"><div className="flex items-center gap-2"><span>🍌</span><span>Nano Banana Pro</span><Badge className="bg-banana text-accent-foreground text-[10px] px-1">PRO</Badge></div></SelectItem>
                    <SelectItem value="seedream-4"><div className="flex items-center gap-2"><span>✨</span><span>SeeDream 4</span></div></SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1.5">{t.differentModels}</p>
              </div>

              <div className="mb-6"><h3 className="font-semibold text-foreground mb-2">{t.resolutionSettings}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground mb-1.5 block">{t.aspectRatio}</label><Select value={aspectRatio} onValueChange={setAspectRatio}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{ASPECT_RATIOS.map((r)=><SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-sm text-muted-foreground mb-1.5 block">{t.generationCount}</label><Select value={generationCount} onValueChange={setGenerationCount}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{GENERATION_COUNTS.map((c)=><SelectItem key={c.value} value={c.value}>{c.label} {t.images}</SelectItem>)}</SelectContent></Select></div>
                </div>
              </div>

              {mode === "image-to-image" && uploadedImages.length > 0 && (<div className="mb-6"><h3 className="font-semibold text-foreground mb-2">Image Analysis</h3><Textarea value={analysisPrompt} onChange={(e)=>setAnalysisPrompt(e.target.value)} className="min-h-[60px] resize-none mb-2 text-sm"/><p className="text-xs text-muted-foreground mb-3">Ask questions...</p></div>)}

              {mode === "image-to-image" && (<div className="mb-6">
                  <div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-foreground">{t.referenceImage}</h3><span className="text-xs text-muted-foreground">{uploadedImages.length}/{MAX_IMAGES}</span></div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {uploadedImages.map((img) => (<div key={img.id} className="relative aspect-square bg-muted rounded-lg overflow-hidden group"><img src={img.url} className="w-full h-full object-cover"/><button onClick={()=>removeImage(img.id)} className="absolute top-1 right-1 p-1 bg-foreground/80 text-background rounded-full opacity-0 group-hover:opacity-100"><X className="w-3 h-3"/></button></div>))}
                    {uploadedImages.length < MAX_IMAGES && (<div onDrop={handleDrop} onDragOver={e=>{e.preventDefault();setIsDragging(true)}} onDragLeave={()=>setIsDragging(false)} className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer ${isDragging?"border-banana":"border-border"}`}><input type="file" onChange={handleFileSelect} className="hidden" id="img-up"/><label htmlFor="img-up" className="cursor-pointer flex flex-col items-center"><Plus className="w-6 h-6 text-muted-foreground"/></label></div>)}
                  </div>
              </div>)}
              
              <Button onClick={handleGenerate} disabled={isGenerating || (mode === "image-to-image" && uploadedImages.length === 0) || !prompt.trim()} className="w-full bg-banana text-accent-foreground hover:bg-banana-dark h-12">
                {isGenerating ? <>{t.generating}</> : <><Sparkles className="w-4 h-4 mr-2"/>{t.generateNow} ({CREDITS_PER_GENERATION} {t.credits})</>}
              </Button>
              {!user && <p className="text-xs text-muted-foreground text-center mt-3"><Link href="/login">Sign in</Link></p>}
            </Card>

            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-lg flex items-center gap-2"><ImageIcon className="w-5 h-5 text-banana-dark"/>{t.outputGallery}</h3>{generatedImages.length > 0 && <Button variant="outline" size="sm" onClick={downloadAllImages}><Download className="w-4 h-4 mr-1"/>{t.downloadAll}</Button>}</div>
                {isGenerating ? (<div className="aspect-square bg-muted rounded-lg flex items-center justify-center"><p>{t.generating}</p></div>) : generatedImages.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">{generatedImages.slice(0,4).map(img=>(<div key={img.id} className="relative aspect-square"><img src={img.url} className="w-full h-full object-cover"/><button onClick={()=>downloadImage(img.url,`img.png`,img.id)} className="absolute bottom-2 right-2 p-2 bg-foreground/80 text-background rounded-lg"><Download className="w-4 h-4"/></button></div>))}</div>
                    <Button onClick={downloadAllImages} className="w-full bg-banana text-accent-foreground"><Download className="w-4 h-4 mr-2"/>{t.download}</Button>
                  </div>
                ) : (<div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center text-center p-8"><p>{t.readyForGeneration}</p></div>)}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}