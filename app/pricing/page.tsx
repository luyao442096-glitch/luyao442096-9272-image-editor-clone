import { Metadata } from "next"
import { Header } from "@/components/header"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

// 定价页面特定的元数据
export const metadata: Metadata = {
  title: "Pricing - Nano Banana AI Image Editor",
  description: "Flexible pricing plans for Nano Banana AI Image Editor. Choose Basic, Pro, or Max Plan to suit your needs. Upgrade or downgrade at any time.",
  keywords: [
    "Nano Banana Pricing",
    "AI Image Editor Pricing",
    "AI Editor Plans",
    "Nano Banana Plans",
    "AI Image Editing Subscription",
    "AI Editor Pricing"
  ],
  openGraph: {
    title: "Pricing - Nano Banana AI Image Editor",
    description: "Flexible pricing plans for Nano Banana AI Image Editor. Choose Basic, Pro, or Max Plan to suit your needs. Upgrade or downgrade at any time.",
    url: "https://www.zlseren.online/pricing"
  },
  twitter: {
    title: "Pricing - Nano Banana AI Image Editor",
    description: "Flexible pricing plans for Nano Banana AI Image Editor. Choose Basic, Pro, or Max Plan to suit your needs. Upgrade or downgrade at any time.",
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
