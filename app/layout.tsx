import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
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
    { name: 'Zlseren AI Team' }
  ],
  category: 'Technology',
  publisher: 'Zlseren AI',
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
      {/* Google Tag Manager - 添加到 head 中尽可能靠上的位置 */}
      <Script
        id="google-tag-manager"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TCGJHBJ5');`,
        }}
      />
      
      <body className="font-sans antialiased">
        {/* Google Tag Manager (noscript) - 紧跟起始 body 标记之后 */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TCGJHBJ5"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        
        {/* Ahrefs Analytics Script - 添加到 head 部分 */}
        <Script
          id="ahrefs-analytics"
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="5gzv0pKH6Z/18hLrdcc42Q"
          strategy="afterInteractive"
        />
        
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
