"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SparkleDecoration } from "@/components/banana-decoration"
import Link from "next/link"
import Image from "next/image"
import { useLocale } from "@/lib/locale-context"

const showcaseItems = [
  {
    titleEn: "Ultra-Fast Mountain Generation",
    titleZh: "超快速山景生成",
    descriptionEn: "Created in 0.8 seconds with Zlseren AI's optimized neural engine",
    descriptionZh: "使用 Zlseren AI 优化的神经引擎在 0.8 秒内创建",
    image: "/mountain-landscape.png",
  },
  {
    titleEn: "Instant Garden Creation",
    titleZh: "即时花园创作",
    descriptionEn: "Complex scene rendered in milliseconds using Zlseren AI technology",
    descriptionZh: "使用 Zlseren AI 技术在毫秒内渲染复杂场景",
    image: "/beautiful-garden-with-colorful-flowers.jpg",
  },
  {
    titleEn: "Real-time Beach Synthesis",
    titleZh: "实时海滩合成",
    descriptionEn: "Zlseren AI delivers photorealistic results at lightning speed",
    descriptionZh: "Zlseren AI 以闪电般的速度呈现逼真的效果",
    image: "/tropical-beach-with-crystal-clear-water.jpg",
  },
  {
    titleEn: "Rapid Aurora Generation",
    titleZh: "快速极光生成",
    descriptionEn: "Advanced effects processed instantly with Zlseren AI",
    descriptionZh: "使用 Zlseren AI 即时处理高级效果",
    image: "/northern-lights-aurora-borealis-over-snowy-landsca.jpg",
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
          {showcaseItems.map((item) => (
            <Card key={item.titleEn} className="overflow-hidden group cursor-pointer bg-card">
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={`Zlseren AI ${locale === "zh" ? item.titleZh : item.titleEn}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  priority={item === showcaseItems[0]}
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-banana text-accent-foreground text-xs font-medium rounded-full">
                    ⚡ Zlseren AI Speed
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-foreground mb-2">{locale === "zh" ? item.titleZh : item.titleEn}</h3>
                <p className="text-sm text-muted-foreground">
                  {locale === "zh" ? item.descriptionZh : item.descriptionEn}
                </p>
              </div>
            </Card>
          ))}
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
