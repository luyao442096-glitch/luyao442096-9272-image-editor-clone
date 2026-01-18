"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SparkleDecoration } from "@/components/banana-decoration"
import { useLocale } from "@/lib/locale-context"

const faqs = [
  {
    questionEn: "Do my credits ever expire?",
    questionZh: "我的积分会过期吗？",
    answerEn: "No! Once you purchase credits, they stay in your account forever until you use them.",
    answerZh: "不会！一旦您购买积分，它们会永远留在您的账户中，直到您使用它们。",
  },
  {
    questionEn: "Is the payment secure?",
    questionZh: "支付安全吗？",
    answerEn: "Absolutely. We use Creem for all transactions, ensuring industry-standard encryption and security for your credit card data.",
    answerZh: "绝对安全。我们使用 Creem 处理所有交易，确保您的信用卡数据采用行业标准的加密和安全措施。",
  },
  {
    questionEn: "Can I get a refund?",
    questionZh: "我可以退款吗？",
    answerEn: "If you haven't used any of your purchased credits, we offer a 7-day hassle-free refund policy.",
    answerZh: "如果您尚未使用任何购买的积分，我们提供7天无理由退款政策。",
  },
  {
    questionEn: "What is Zlseren AI?",
    questionZh: "什么是 Zlseren AI？",
    answerEn:
      "It's a revolutionary AI platform that offers powerful AI tools for image editing, content creation, and more. Zlseren AI provides flexible credit-based pricing with no subscription required.",
    answerZh:
      "这是一个革命性的 AI 平台，提供强大的 AI 工具用于图像编辑、内容创作等。Zlseren AI 采用灵活的积分制定价，无需订阅。",
  },
  {
    questionEn: "How do I use my credits?",
    questionZh: "如何使用我的积分？",
    answerEn:
      'Your credits can be used across all Zlseren AI tools. The number of credits required varies based on the complexity of the task and the quality of the output.',
    answerZh:
      '您的积分可以在所有 Zlseren AI 工具中使用。所需积分数量根据任务的复杂度和输出质量而有所不同。',
  },
  {
    questionEn: "Can I upgrade or downgrade my plan?",
    questionZh: "我可以升级或降级我的计划吗？",
    answerEn:
      "Since we use a credit-based system, there are no fixed plans to upgrade or downgrade. Simply purchase additional credits whenever you need them.",
    answerZh:
      "由于我们使用积分制系统，没有固定的计划需要升级或降级。您可以随时购买额外的积分。",
  },
];

export function FAQSection() {
  const { locale, t } = useLocale()

  return (
    <section id="faq" className="py-20 bg-white relative overflow-hidden">
      {/* Decorative sparkles */}
      <SparkleDecoration className="absolute top-20 left-5 w-14 h-14 rotate-[-25deg] opacity-10" />
      <SparkleDecoration className="absolute bottom-10 right-8 w-18 h-18 rotate-[30deg] opacity-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>

        {/* FAQ list - American style (simple, direct, easy to scan) */}
        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {locale === "zh" ? faq.questionZh : faq.questionEn}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {locale === "zh" ? faq.answerZh : faq.answerEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
