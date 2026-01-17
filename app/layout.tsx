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
  title: "Zlseren - 全球领先的 AI 智能助手 | 积分制按需付费，解锁无限创意",
  description:
    "Zlseren 提供稳定、高效的 AI 对话与创作工具。采用灵活的积分制管理，无订阅压力，充值即用。无论是创意写作、代码编写还是日常办公，Zlseren 都是您最可靠的 AI 伙伴。立即注册，开启您的智能之旅。",
  generator: 'v0.app',
  // SEO 增强
  keywords: [
    "AI智能助手",
    "Zlseren",
    "AI对话",
    "AI创作",
    "积分制",
    "按需付费",
    "AI伙伴",
    "创意写作",
    "代码编写",
    "日常办公"
  ],
  // 社交媒体元数据
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://www.zlseren.online/',
    title: 'Zlseren - 全球领先的 AI 智能助手 | 积分制按需付费，解锁无限创意',
    description: 'Zlseren 提供稳定、高效的 AI 对话与创作工具。采用灵活的积分制管理，无订阅压力，充值即用。无论是创意写作、代码编写还是日常办公，Zlseren 都是您最可靠的 AI 伙伴。立即注册，开启您的智能之旅。',
    siteName: 'Zlseren',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zlseren - 全球领先的 AI 智能助手 | 积分制按需付费，解锁无限创意',
    description: 'Zlseren 提供稳定、高效的 AI 对话与创作工具。采用灵活的积分制管理，无订阅压力，充值即用。无论是创意写作、代码编写还是日常办公，Zlseren 都是您最可靠的 AI 伙伴。立即注册，开启您的智能之旅。',
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
              name: 'Zlseren',
              url: 'https://www.zlseren.online/',
              description: 'Zlseren 提供稳定、高效的 AI 对话与创作工具。采用灵活的积分制管理，无订阅压力，充值即用。无论是创意写作、代码编写还是日常办公，Zlseren 都是您最可靠的 AI 伙伴。立即注册，开启您的智能之旅。',
              publisher: {
                '@type': 'Organization',
                name: 'Zlseren Team',
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
