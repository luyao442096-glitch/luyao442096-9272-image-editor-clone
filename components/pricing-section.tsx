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
    id: "basic",
    nameEn: "Basic",
    nameZh: "基础版",
    priceMonthly: 12,
    priceYearly: 144,
    creditsPerYear: 2400,
    imagesPerMonth: 100,
    featuresEn: [
      "All style templates",
      "Standard generation speed",
      "Basic customer support",
      "JPG/PNG format downloads",
      "Commercial use license",
    ],
    featuresZh: [
      "所有风格模板",
      "标准生成速度",
      "基础客户支持",
      "JPG/PNG格式下载",
      "商业使用许可",
    ],
    icon: Sparkles,
    popular: false,
  },
  {
    id: "pro",
    nameEn: "Pro",
    nameZh: "专业版",
    priceMonthly: 19.5,
    priceYearly: 234,
    creditsPerYear: 9600,
    imagesPerMonth: 400,
    featuresEn: [
      "Seedream-4 & Nanobanana-Pro models",
      "Priority generation queue",
      "Priority customer support",
      "JPG/PNG/WebP format downloads",
      "Batch generation feature",
      "Upcoming image editing tools",
      "Commercial use license",
    ],
    featuresZh: [
      "Seedream-4 和 Nanobanana-Pro 模型",
      "优先生成队列",
      "优先客户支持",
      "JPG/PNG/WebP格式下载",
      "批量生成功能",
      "即将推出的图像编辑工具",
      "商业使用许可",
    ],
    icon: Zap,
    popular: true,
  },
  {
    id: "max",
    nameEn: "Max",
    nameZh: "旗舰版",
    priceMonthly: 80,
    priceYearly: 960,
    creditsPerYear: 43200,
    imagesPerMonth: 1800,
    featuresEn: [
      "Fastest generation speed",
      "Dedicated account manager",
      "All format downloads",
      "Batch generation feature",
      "Upcoming professional editing suite",
      "Commercial use license",
    ],
    featuresZh: [
      "最快生成速度",
      "专属客户经理",
      "所有格式下载",
      "批量生成功能",
      "即将推出的专业编辑套件",
      "商业使用许可",
    ],
    icon: Crown,
    popular: false,
  },
]

export function PricingSection() {
  const { locale, t } = useLocale()
  const { user } = useAuth()
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly")
  const [loading, setLoading] = useState(false)

  const handleSubscribe = (planId: string) => {
    if (!user) {
      window.location.href = `/login?redirect=/pricing`
      return
    }

    // 直接使用用户提供的支付链接
    const paymentLinks: Record<string, string> = {
      "basic": "https://www.creem.io/payment/prod_2U14J3cNweMcQPQaQiTHTt",
      "pro": "https://www.creem.io/payment/prod_3GUDoBE0DSES3HGqYDC1S",
      "max": "https://www.creem.io/payment/prod_42aqCZ9KQG1nScBkhK6m10",
    }

    const checkoutUrl = paymentLinks[planId]
    if (checkoutUrl) {
      // 设置加载状态
      setLoading(true)
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

        {/* Billing period toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm ${billingPeriod === "monthly" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            {t.monthly}
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-8 bg-secondary rounded-full transition-colors"
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-banana rounded-full transition-transform ${
                billingPeriod === "yearly" ? "translate-x-6" : ""
              }`}
            />
          </button>
          <span className={`text-sm ${billingPeriod === "yearly" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            {t.yearly}
          </span>
          {billingPeriod === "yearly" && (
            <Badge variant="outline" className="ml-2 bg-banana-light text-banana-dark border-banana">
              {t.save50}
            </Badge>
          )}
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon
            const price = billingPeriod === "monthly" ? plan.priceMonthly : plan.priceYearly
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
                      <span className="text-4xl font-bold text-foreground">${price}</span>
                      <span className="text-sm text-muted-foreground">/{billingPeriod === "monthly" ? t.month : t.year}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      {plan.creditsPerYear.toLocaleString()} {t.creditsPerYear} ({plan.imagesPerMonth} {t.highQualityImagesPerMonth})
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
                    onClick={() => handleSubscribe(plan.id)}
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
                        {t.subscribeNow}
                      </>
                    ) : (
                      t.subscribeNow
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
              <p className="font-medium mb-1">{t.monthlyPlanCredits}</p>
              <p className="text-muted-foreground">{t.monthlyPlanCreditsDesc}</p>
            </div>
            <div>
              <p className="font-medium mb-1">{t.yearlyPlanCredits}</p>
              <p className="text-muted-foreground">{t.yearlyPlanCreditsDesc}</p>
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
