import { Metadata } from "next"
import { Header } from "@/components/header"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

// 定价页面特定的元数据
export const metadata: Metadata = {
  title: "Pricing - Zlseren AI 智能助手",
  description: "Zlseren 灵活的定价方案，采用积分制管理，无订阅压力，充值即用。选择 Basic、Pro 或 Max Plan 满足您的需求，随时升级或降级。",
  keywords: [
    "Zlseren Pricing",
    "AI 智能助手定价",
    "AI 助手套餐",
    "Zlseren 套餐",
    "AI 服务积分制",
    "按需付费 AI 助手"
  ],
  openGraph: {
    title: "Pricing - Zlseren AI 智能助手",
    description: "Zlseren 灵活的定价方案，采用积分制管理，无订阅压力，充值即用。选择 Basic、Pro 或 Max Plan 满足您的需求，随时升级或降级。",
    url: "https://www.zlseren.online/pricing"
  },
  twitter: {
    title: "Pricing - Zlseren AI 智能助手",
    description: "Zlseren 灵活的定价方案，采用积分制管理，无订阅压力，充值即用。选择 Basic、Pro 或 Max Plan 满足您的需求，随时升级或降级。",
  },
  alternates: {
    canonical: "https://www.zlseren.online/pricing"
  }
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-24">
        <PricingSection />
        <FAQSection />
      </div>
      <Footer />
    </main>
  )
}
