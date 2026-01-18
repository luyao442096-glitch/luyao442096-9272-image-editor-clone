"use client"

import { Button } from "@/components/ui/button"
import { SparkleDecoration } from "@/components/banana-decoration"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"

export function HeroSection() {
  const { t } = useLocale()

  return (
    <section className="relative pt-44 pb-20 overflow-hidden bg-gradient-to-br from-background via-banana-100/30 to-background">
      {/* Sparkle decorations */}
      <SparkleDecoration className="absolute top-32 left-8 w-16 h-16 rotate-[-30deg] opacity-60" />
      <SparkleDecoration className="absolute top-48 right-12 w-20 h-20 rotate-[25deg] opacity-50" />
      <SparkleDecoration className="absolute bottom-20 left-1/4 w-12 h-12 rotate-[15deg] opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-banana-light border border-banana px-4 py-2 rounded-full mb-8">
          <span className="text-lg">⚡</span>
          <span className="text-sm font-medium text-accent-foreground">The AI model that outperforms Flux Kontext</span>
          <Link href="/generator" className="text-sm font-semibold text-banana-dark hover:underline">
            {t.tryNow} →
          </Link>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance">{t.heroTitle}</h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 text-balance leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-banana text-accent-foreground hover:bg-banana-dark px-8 h-12 text-base"
          >
            <Link href="/generator">
              <span className="mr-2">⚡</span>
              {t.getStarted}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8 h-12 text-base bg-transparent">
            <Link href="#showcase">{t.viewShowcase}</Link>
          </Button>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
          {["One-shot editing", "Multi-image support", "Natural language"].map((feature) => (
            <span key={feature} className="px-4 py-2 bg-secondary rounded-full text-sm text-secondary-foreground">
              {feature}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
