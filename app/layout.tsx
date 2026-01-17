import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LocaleProvider } from "@/lib/locale-context"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nano Banana - AI Image Editor",
  description:
    "Transform any image with simple text prompts. Advanced AI-powered image editing with character consistency and scene preservation.",
  generator: 'v0.app',
  // SEO 增强
  keywords: [
    "AI Image Editor",
    "Nano Banana",
    "AI Image Editing",
    "Text to Image",
    "Image Generation",
    "AI Editor",
    "Character Consistency",
    "Scene Preservation"
  ],
  // 社交媒体元数据
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.zlseren.online/',
    title: 'Nano Banana - AI Image Editor',
    description: 'Transform any image with simple text prompts. Advanced AI-powered image editing with character consistency and scene preservation.',
    siteName: 'Nano Banana',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nano Banana - AI Image Editor',
    description: 'Transform any image with simple text prompts. Advanced AI-powered image editing with character consistency and scene preservation.',
    creator: '@NanoBananaAI'
  },
  // 规范URL
  alternates: {
    canonical: 'https://www.zlseren.online/'
  },
  // 其他元数据
  authors: [
    { name: 'Nano Banana Team' }
  ],
  category: 'Technology',
  publisher: 'Nano Banana',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  referrer: 'origin-when-cross-origin'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {/* 结构化数据 - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Nano Banana',
              url: 'https://www.zlseren.online/',
              description: 'Transform any image with simple text prompts. Advanced AI-powered image editing with character consistency and scene preservation.',
              publisher: {
                '@type': 'Organization',
                name: 'Nano Banana Team',
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://www.zlseren.online/search?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        
        <AuthProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
