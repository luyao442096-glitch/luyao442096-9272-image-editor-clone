"use client"

import { MessageSquare, User, Layers, Zap, Images, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useLocale } from "@/lib/locale-context"

const features = [
  {
    icon: MessageSquare,
    titleEn: "Natural Language Editing",
    titleZh: "自然语言编辑",
    descriptionEn:
      "Edit images using simple text prompts. Nano Banana AI understands complex instructions like GPT for images.",
    descriptionZh: "使用简单的文字提示编辑图像。Nano Banana AI 能理解复杂的指令，就像图像版的 GPT。",
  },
  {
    icon: User,
    titleEn: "Character Consistency",
    titleZh: "角色一致性",
    descriptionEn:
      "Maintain perfect character details across edits. This model excels at preserving faces and identities.",
    descriptionZh: "在编辑过程中保持完美的角色细节。该模型擅长保持面部特征和身份一致性。",
  },
  {
    icon: Layers,
    titleEn: "Scene Preservation",
    titleZh: "场景保留",
    descriptionEn: "Seamlessly blend edits with original backgrounds. Superior scene fusion compared to competitors.",
    descriptionZh: "无缝融合编辑与原始背景。场景融合能力优于竞争对手。",
  },
  {
    icon: Zap,
    titleEn: "One-Shot Editing",
    titleZh: "一次成功编辑",
    descriptionEn:
      "Perfect results in a single attempt. Nano Banana solves one-shot image editing challenges effortlessly.",
    descriptionZh: "一次尝试即可获得完美结果。Nano Banana 轻松解决一次性图像编辑的难题。",
  },
  {
    icon: Images,
    titleEn: "Multi-Image Context",
    titleZh: "多图像上下文",
    descriptionEn: "Process multiple images simultaneously. Support for advanced multi-image editing workflows.",
    descriptionZh: "同时处理多张图像。支持高级多图像编辑工作流程。",
  },
  {
    icon: Sparkles,
    titleEn: "AI UGC Creation",
    titleZh: "AI UGC 创作",
    descriptionEn:
      "Create consistent AI influencers and UGC content. Perfect for social media and marketing campaigns.",
    descriptionZh: "创建一致的 AI 网红和 UGC 内容。非常适合社交媒体和营销活动。",
  },
]

export function FeaturesSection() {
  const { locale, t } = useLocale()

  return (
    <section id="features" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-banana-dark font-semibold mb-2">Core Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.featuresTitle}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t.featuresSubtitle}</p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.titleEn} className="p-6 bg-card hover:shadow-lg transition-shadow duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-banana-light flex items-center justify-center mb-4 group-hover:bg-banana transition-colors">
                <feature.icon className="w-6 h-6 text-banana-dark group-hover:text-accent-foreground transition-colors" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {locale === "zh" ? feature.titleZh : feature.titleEn}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {locale === "zh" ? feature.descriptionZh : feature.descriptionEn}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
