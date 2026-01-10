"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BananaDecoration } from "@/components/banana-decoration"
import { useLocale } from "@/lib/locale-context"

const faqs = [
  {
    questionEn: "What is Nano Banana?",
    questionZh: "什么是 Nano Banana？",
    answerEn:
      "It's a revolutionary AI image editing model that transforms photos using natural language prompts. This is currently one of the most powerful image editing models available, with exceptional consistency. It offers superior performance for consistent character editing and scene preservation.",
    answerZh:
      "这是一个革命性的 AI 图像编辑模型，使用自然语言提示来转换照片。这是目前最强大的图像编辑模型之一，具有卓越的一致性。它在保持角色编辑和场景保留方面提供卓越的性能。",
  },
  {
    questionEn: "How does it work?",
    questionZh: "它是如何工作的？",
    answerEn:
      'Simply upload an image and describe your desired edits in natural language. The AI understands complex instructions like "place the creature in a snowy mountain" or "imagine the whole face and create it". It processes your text prompt and generates perfectly edited images.',
    answerZh:
      '只需上传图像并用自然语言描述您想要的编辑。AI 能理解复杂的指令，如"将生物放置在雪山中"或"想象整个面孔并创建它"。它处理您的文本提示并生成完美编辑的图像。',
  },
  {
    questionEn: "How is it better than other tools?",
    questionZh: "它比其他工具好在哪里？",
    answerEn:
      "Nano Banana excels in character consistency, scene blending, and one-shot editing. Users report it delivers excellent results in preserving facial features and seamlessly integrating edits with backgrounds. It also supports multi-image context, making it ideal for creating consistent AI content.",
    answerZh:
      "Nano Banana 在角色一致性、场景融合和一次性编辑方面表现出色。用户反馈它在保持面部特征和无缝整合编辑与背景方面提供了出色的结果。它还支持多图像上下文，非常适合创建一致的 AI 内容。",
  },
  {
    questionEn: "Can I use it for commercial projects?",
    questionZh: "我可以将它用于商业项目吗？",
    answerEn:
      "Yes! It's perfect for creating AI UGC content, social media campaigns, and marketing materials. Many users leverage it for creating consistent AI influencers and product photography. The high-quality outputs are suitable for professional use.",
    answerZh:
      "可以！它非常适合创建 AI UGC 内容、社交媒体活动和营销材料。许多用户利用它来创建一致的 AI 网红和产品摄影。高质量的输出适合专业使用。",
  },
  {
    questionEn: "What types of edits can it handle?",
    questionZh: "它可以处理哪些类型的编辑？",
    answerEn:
      'The editor handles complex edits including face completion, background changes, object placement, style transfers, and character modifications. It excels at understanding contextual instructions like "place in a blizzard" or "create the whole face" while maintaining photorealistic quality.',
    answerZh:
      '编辑器可以处理复杂的编辑，包括面部完成、背景更改、物体放置、风格转换和角色修改。它擅长理解上下文指令，如"放置在暴风雪中"或"创建整个面孔"，同时保持照片级的质量。',
  },
  {
    questionEn: "Is there a free trial available?",
    questionZh: "有免费试用吗？",
    answerEn:
      "Yes! You can try Nano Banana for free through our web interface. Simply upload your image, enter a text prompt describing your desired edits, and watch as the AI transforms your photo with incredible accuracy and consistency.",
    answerZh:
      "有的！您可以通过我们的网页界面免费试用 Nano Banana。只需上传您的图像，输入描述您想要编辑的文本提示，然后观看 AI 以令人难以置信的准确性和一致性转换您的照片。",
  },
]

export function FAQSection() {
  const { locale, t } = useLocale()

  return (
    <section id="faq" className="py-20 bg-secondary/30 relative overflow-hidden">
      {/* Decorative bananas */}
      <BananaDecoration className="absolute top-20 left-5 w-14 h-14 rotate-[-25deg] opacity-25" />
      <BananaDecoration className="absolute bottom-10 right-8 w-18 h-18 rotate-[30deg] opacity-20" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-banana-dark font-semibold mb-2">FAQs</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t.faqTitle}</h2>
        </div>

        {/* FAQ accordion */}
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold text-foreground hover:text-banana-dark">
                {locale === "zh" ? faq.questionZh : faq.questionEn}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {locale === "zh" ? faq.answerZh : faq.answerEn}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
