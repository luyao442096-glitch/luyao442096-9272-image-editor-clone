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
  title: "Zlseren - 全球领先的 AI 智能助手 | 积分制按需付费",
  description:
    "Zlseren 提供稳定高效的 AI 工具服务。采用灵活积分制计费，充值即用，支持多种支付方式，助力您的智能办公与创意写作。",
  generator: 'v0.app',
  // SEO 增强
  keywords: [
    "ZlserenAI",
    "AI助手",
    "积分充值",
    "AI绘画",
    "AI对话",
    "Creem支付",
    "智能效率工具"
  ],
  // 社交媒体元数据
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://www.zlseren.online/',
    title: 'Zlseren - 全球领先的 AI 智能助手 | 积分制按需付费',
    description: 'Zlseren 提供稳定高效的 AI 工具服务。采用灵活积分制计费，充值即用，支持多种支付方式，助力您的智能办公与创意写作。',
    siteName: 'Zlseren AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zlseren - 全球领先的 AI 智能助手 | 积分制按需付费',
    description: 'Zlseren 提供稳定高效的 AI 工具服务。采用灵活积分制计费，充值即用，支持多种支付方式，助力您的智能办公与创意写作。',
    creator: '@ZlserenAI'
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
              name: 'Zlseren AI',
              url: 'https://www.zlseren.online/',
              description: 'Zlseren 提供稳定高效的 AI 工具服务。采用灵活积分制计费，充值即用，支持多种支付方式，助力您的智能办公与创意写作。',
              publisher: {
                '@type': 'Organization',
                name: 'Zlseren AI',
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
