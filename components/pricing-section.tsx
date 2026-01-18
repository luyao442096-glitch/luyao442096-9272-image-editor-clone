"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Sparkles, Loader2 } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAuth } from "@/lib/auth-context"
import { SparkleDecoration } from "@/components/banana-decoration"

const plans = [
  {
    id: "starter",
    nameEn: "Starter Pack",
    nameZh: "入门包",
    credits: 200,
    price: 9.90,
    productId: "prod_6WKalf5Of9J37S0yXEqKcK",
    link: "https://www.creem.io/payment/prod_6WKalf5Of9J37S0yXEqKcK",
    featuresEn: [
      "200 credits",
      "All basic features",
      "Standard generation speed",
      "JPG/PNG format downloads",
      "Commercial use license",
    ],
    featuresZh: [
      "200 积分",
      "所有基础功能",
      "标准生成速度",
      "JPG/PNG格式下载",
      "商业使用许可",
    ],
    icon: Sparkles,
    popular: false,
  },
  {
    id: "professional",
    nameEn: "Professional Pack",
    nameZh: "专业包",
    credits: 800,
    price: 29.90,
    productId: "prod_65qZgLFUGQ1vI1mberV0pW",
    link: "https://www.creem.io/payment/prod_65qZgLFUGQ1vI1mberV0pW",
    featuresEn: [
      "800 credits",
      "All professional features",
      "Priority generation queue",
      "JPG/PNG/WebP format downloads",
      "Batch generation feature",
      "Commercial use license",
    ],
    featuresZh: [
      "800 积分",
      "所有专业功能",
      "优先生成队列",
      "JPG/PNG/WebP格式下载",
      "批量生成功能",
      "商业使用许可",
    ],
    icon: Zap,
    popular: true,
  },
  {
    id: "studio",
    nameEn: "Studio Pack",
    nameZh: "工作室包",
    credits: 2000,
    price: 69.90,
    productId: "prod_4qjJaeiFEH8K0LEo5rRftl",
    link: "https://www.creem.io/payment/prod_4qjJaeiFEH8K0LEo5rRftl",
    featuresEn: [
      "2000 credits",
      "All premium features",
      "Fastest generation speed",
      "All format downloads",
      "Batch generation feature",
      "Commercial use license",
    ],
    featuresZh: [
      "2000 积分",
      "所有高级功能",
      "最快生成速度",
      "所有格式下载",
      "批量生成功能",
      "商业使用许可",
    ],
    icon: Crown,
    popular: false,
  },
]

export function PricingSection() {
  const { locale, t } = useLocale()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleBuyCredits = (planId: string) => {
    if (!user) {
      window.location.href = `/login?redirect=/pricing`
      return
    }

    // 找到对应的套餐
    const selectedPlan = plans.find(plan => plan.id === planId)
    
    if (selectedPlan) {
      // 设置加载状态
      setLoading(true)
      
      // 在URL后拼接用户邮箱
      const checkoutUrl = selectedPlan.link + `?email=${encodeURIComponent(user.email || '')}`
      
      // 直接重定向到Creem支付页面
      window.location.href = checkoutUrl
    } else {
      console.error("Invalid plan ID:", planId)
      alert("Invalid plan selected. Please try again.")
    }
  }

  return (
    <section id="pricing" className="py-20 bg-background relative overflow-hidden">
      {/* Decorative bananas */}
      <SparkleDecoration className="absolute top-20 left-5 w-14 h-14 rotate-[-25deg] opacity-25" />
      <SparkleDecoration className="absolute bottom-10 right-8 w-18 h-18 rotate-[30deg] opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-banana-dark font-semibold mb-2">{t.pricingBadge}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.pricingTitle}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.pricingSubtitle}</p>
        </div>



        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon
            const features = locale === "zh" ? plan.featuresZh : plan.featuresEn
            const planName = locale === "zh" ? plan.nameZh : plan.nameEn

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? "border-banana border-2 shadow-lg scale-105" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-banana text-accent-foreground">
                    {t.mostPopular}
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-6 h-6 text-banana-dark" />
                    <CardTitle className="text-2xl">{planName}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">${plan.price.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      {plan.credits.toLocaleString()} {t.credits}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-banana-dark shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleBuyCredits(plan.id)}
                    className={`w-full ${plan.popular
                      ? "bg-banana text-accent-foreground hover:bg-banana-dark"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"}
                    `}
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.buyCredits}
                      </>
                    ) : (
                      t.buyCredits
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Credit system info */}
        <div className="bg-secondary/50 rounded-lg p-6 max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold mb-3">{t.creditSystemTitle}</h3>
          <p className="text-muted-foreground text-sm mb-4">{t.creditSystemDescription}</p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">{t.creditPackInfo}</p>
              <p className="text-muted-foreground">{t.creditPackInfoDesc}</p>
            </div>
            <div>
              <p className="font-medium mb-1">{t.creditUsageInfo}</p>
              <p className="text-muted-foreground">{t.creditUsageInfoDesc}</p>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-2">{t.paymentMethods}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>💳 {t.creditCard}</span>
            <span>💳 {t.debitCard}</span>
            <span>📱 Alipay</span>
            <span>💬 WeChat Pay</span>
          </div>
        </div>

        {/* Trust signal */}
        <div className="text-center mt-12 pt-6 border-t border-border text-sm font-medium text-foreground">
          {t.securePayment}
        </div>
      </div>
    </section>
  )
}
