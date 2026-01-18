import { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BananaDecoration } from "@/components/banana-decoration"

export const metadata: Metadata = {
  title: "Terms of Service - Zlseren AI",
  description: "Zlseren AI Terms of Service - Learn the rules and conditions for using our services",
  alternates: {
    canonical: "https://www.zlseren.online/privacy"
  }
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="pt-24 pb-20 relative overflow-hidden">
        {/* Decorative bananas */}
        <BananaDecoration className="absolute top-20 left-5 w-14 h-14 rotate-[-25deg] opacity-10" />
        <BananaDecoration className="absolute bottom-10 right-8 w-18 h-18 rotate-[30deg] opacity-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Terms of Service</h1>
            <p className="mt-4 text-gray-600">Last Updated: January 17, 2026</p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <div>
              <p>
                Welcome to <strong>zlseren.online</strong>. By accessing or using our website and AI services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Description of Service</h2>
              <p>
                zlseren.online provides an AI-powered tool that allows users to generate passport and ID photos from uploaded images ("Service"). The Service is provided on an "as-is" and "as-available" basis.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Accounts</h2>
              <p>
                To access certain features, you may need to register via Google Authentication. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Payments and Credits</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Pricing:</strong> Services are purchased using credits or direct payments as displayed on the pricing page.</li>
                <li><strong>Payment Processing:</strong> Payments are securely processed by our third-party partner, <strong>Creem</strong>. We do not store your financial information.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Policy (Important)</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Digital Goods:</strong> Due to the nature of digital content and AI processing costs, purchases are generally <strong>non-refundable</strong> once the AI generation process has started.</li>
                <li><strong>Exceptions:</strong> If a technical failure occurs that prevents the delivery of your generated image, or if you are double-charged due to a system error, please contact us at <strong>support@zlseren.online</strong> within 7 days. We will review your case and issue a refund if the error is confirmed on our end.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Conduct & Prohibited Content</h2>
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Upload images of others without their explicit consent.</li>
                <li>Upload content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable.</li>
                <li>Generate fake identification documents for fraudulent purposes.</li>
                <li>We reserve the right to ban any user found violating these terms without refund.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Your Content:</strong> You retain ownership of the images you upload.</li>
                <li><strong>Our Technology:</strong> The website design, code, and AI workflows are the property of zlseren.online.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, zlseren.online shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the Service. We do not guarantee that the generated photos will be accepted by all government authorities, as requirements vary by jurisdiction.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Email:</strong> support@zlseren.online</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
