import { Header } from "@/components/header"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

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
