"use client"

import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

const testimonials = [
  {
    name: "AIArtistPro",
    role: "Digital Creator",
    roleZh: "数字创作者",
    avatar: "A",
    contentEn:
      "This editor completely changed my workflow. The character consistency is incredible - miles ahead of the competition!",
    contentZh: "这个编辑器完全改变了我的工作流程。角色一致性令人难以置信——远超竞争对手！",
  },
  {
    name: "ContentCreator",
    role: "UGC Specialist",
    roleZh: "UGC 专家",
    avatar: "C",
    contentEn:
      "Creating consistent AI influencers has never been easier. It maintains perfect face details across edits!",
    contentZh: "创建一致的 AI 网红从未如此简单。它在编辑过程中保持完美的面部细节！",
  },
  {
    name: "PhotoEditor",
    role: "Professional Editor",
    roleZh: "专业编辑",
    avatar: "P",
    contentEn: "One-shot editing is basically solved with this tool. The scene blending is so natural and realistic!",
    contentZh: "这个工具基本解决了一次性编辑的问题。场景融合非常自然逼真！",
  },
]

export function TestimonialsSection() {
  const { locale, t } = useLocale()

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-banana-dark font-semibold mb-2">User Reviews</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.testimonialsTitle}</h2>
          <p className="text-muted-foreground">{t.testimonialsSubtitle}</p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="p-6 bg-card hover:shadow-lg transition-shadow duration-300">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-banana text-banana" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground mb-6 leading-relaxed">
                &ldquo;{locale === "zh" ? testimonial.contentZh : testimonial.contentEn}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-banana flex items-center justify-center">
                  <span className="text-accent-foreground font-semibold">{testimonial.avatar}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {locale === "zh" ? testimonial.roleZh : testimonial.role}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
