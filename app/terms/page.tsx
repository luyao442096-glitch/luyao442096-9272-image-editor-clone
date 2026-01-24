import { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SparkleDecoration } from "@/components/banana-decoration"

export const metadata: Metadata = {
  title: "Privacy Policy - Zlseren AI",
  description: "Zlseren AI Privacy Policy - Learn how we protect your personal information",
  alternates: {
    canonical: "https://www.zlseren.online/terms"
  }
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="pt-24 pb-20 relative overflow-hidden">
        {/* Decorative bananas */}
        <SparkleDecoration className="absolute top-20 left-5 w-14 h-14 rotate-[-25deg] opacity-10" />
        <SparkleDecoration className="absolute bottom-10 right-8 w-18 h-18 rotate-[30deg] opacity-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="mt-4 text-gray-600">Last updated: January 18, 2026</p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p>
                Welcome to Zlseren AI. We value your privacy and are committed to protecting your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <p>We may collect the following types of information:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Personal information (name, email address, etc.)</li>
                <li>Payment information (processed securely through Creem)</li>
                <li>Usage data and analytics</li>
                <li>Cookies and tracking technologies</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>To provide and maintain our services</li>
                <li>To process transactions and manage your account</li>
                <li>To communicate with you about updates and offers</li>
                <li>To improve our services based on your feedback</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your information with:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Service providers (like Creem for payment processing)</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your consent</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Security Measures</h2>
              <p>
                We implement industry-standard security measures to protect your personal information from unauthorized access,
                disclosure, alteration, or destruction.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information. You may also opt out of marketing communications.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy
                on this page and updating the "Last updated" date.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at luyao442096@gmail.com.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
