"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SparkleDecoration } from "@/components/banana-decoration"
import Link from "next/link"
import Image from "next/image"
import { useLocale } from "@/lib/locale-context"

const showcaseItems = [
  {
    titleEn: "Intelligent Cleanup: Original",
    titleZh: "智能清理：原始图像",
    descriptionEn: "Complex scene with unwanted tourists and cluttered objects.",
    descriptionZh: "包含多余游客和杂乱物体的复杂场景。",
    image: "/showcase-cleanup-before.jpg",
    badgeEn: "Input Image",
    badgeZh: "输入图像",
  },
  {
    titleEn: "Intelligent Cleanup: Processed",
    titleZh: "智能清理：处理后",
    descriptionEn: "Distractions removed instantly while perfectly reconstructing the background.",
    descriptionZh: "瞬间移除干扰物，同时完美重建背景。",
    image: "/showcase-cleanup-after.jpg",
    badgeEn: "AI Processed",
    badgeZh: "AI处理",
  },
  {
    titleEn: "Cinematic Concept Art",
    titleZh: "电影级概念艺术",
    descriptionEn: "Generate breathtaking 8K sci-fi landscapes from simple text descriptions.",
    descriptionZh: "从简单的文字描述生成令人惊叹的8K科幻景观。",
    image: "/showcase-creative-city.jpg",
    badgeEn: "Text-to-Image",
    badgeZh: "文生图",
  },
  {
    titleEn: "Photorealistic Product Shots",
    titleZh: "逼真产品摄影",
    descriptionEn: "Studio-quality commercial photography generated without a physical camera.",
    descriptionZh: "无需实体相机即可生成工作室级商业摄影。",
    image: "/showcase-product-photo.jpg",
    badgeEn: "Commercial Quality",
    badgeZh: "商业品质",
  },
];

export function ShowcaseSection() {
  const { locale, t } = useLocale()

  return (
    <section id="showcase" className="py-20 bg-secondary/30 relative overflow-hidden">
      {/* Decorative bananas */}
      <SparkleDecoration className="absolute top-10 right-10 w-24 h-24 rotate-[20deg] opacity-30" />
      <SparkleDecoration className="absolute bottom-20 left-10 w-16 h-16 rotate-[-15deg] opacity-25" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-banana-dark font-semibold mb-2">Showcase</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.showcaseTitle}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t.showcaseSubtitle}</p>
        </div>

        {/* Showcase grid */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <Card className="overflow-hidden group cursor-pointer bg-card">
            <div className="aspect-video relative overflow-hidden bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: 'url(https://via.placeholder.com/800x450?text=Intelligent+Cleanup+Original)'}}>
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-banana text-accent-foreground text-xs font-medium rounded-full">
                  ⚡ Input Image
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-foreground mb-2">Intelligent Cleanup: Original</h3>
              <p className="text-sm text-muted-foreground">
                Complex scene with unwanted tourists and cluttered objects.
              </p>
            </div>
          </Card>
          <Card className="overflow-hidden group cursor-pointer bg-card">
            <div className="aspect-video relative overflow-hidden bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: 'url(https://via.placeholder.com/800x450?text=Intelligent+Cleanup+Processed)'}}>
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-banana text-accent-foreground text-xs font-medium rounded-full">
                  ⚡ AI Processed
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-foreground mb-2">Intelligent Cleanup: Processed</h3>
              <p className="text-sm text-muted-foreground">
                Distractions removed instantly while perfectly reconstructing the background.
              </p>
            </div>
          </Card>
          <Card className="overflow-hidden group cursor-pointer bg-card">
            <div className="aspect-video relative overflow-hidden bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: 'url(https://via.placeholder.com/800x450?text=Cinematic+Concept+Art)'}}>
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-banana text-accent-foreground text-xs font-medium rounded-full">
                  ⚡ Text-to-Image
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-foreground mb-2">Cinematic Concept Art</h3>
              <p className="text-sm text-muted-foreground">
                Generate breathtaking 8K sci-fi landscapes from simple text descriptions.
              </p>
            </div>
          </Card>
          <Card className="overflow-hidden group cursor-pointer bg-card">
            <div className="aspect-video relative overflow-hidden bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: 'url(https://via.placeholder.com/800x450?text=Photorealistic+Product+Shots)'}}>
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-banana text-accent-foreground text-xs font-medium rounded-full">
                  ⚡ Commercial Quality
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-foreground mb-2">Photorealistic Product Shots</h3>
              <p className="text-sm text-muted-foreground">
                Studio-quality commercial photography generated without a physical camera.
              </p>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {locale === "zh" ? "亲自体验 Zlseren AI 的强大功能" : "Experience the power of Zlseren AI yourself"}
          </p>
          <Button size="lg" className="bg-banana text-accent-foreground hover:bg-banana-dark" asChild>
            <Link href="/generator">
              <span className="mr-2">⚡</span>
              {t.generator}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
