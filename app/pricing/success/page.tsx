"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import { useAuth } from "@/lib/auth-context"

// 1. 创建一个 loading 组件，用于 Suspense 的 fallback
function LoadingState() {
  return (
    <div className="pt-24 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-banana mx-auto mb-4"></div>
        <p className="text-muted-foreground">Verifying payment...</p>
      </div>
    </div>
  )
}

// 2. 将原本的主逻辑剥离到这个子组件中
function PaymentVerificationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")
  const { t } = useLocale()
  const { refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (sessionId) {
      // Verify the session with backend
      fetch(`/api/creem/verify-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then(async (data) => {
          if (data.error) {
            setError(data.error)
          } else if (data.verified) {
            setVerified(true)
            // 支付验证成功后，刷新用户数据以获取最新的积分
            // 等待一小段时间确保 webhook 已经处理完成
            setTimeout(async () => {
              await refreshUser()
              // 刷新页面路由以确保所有组件都更新
              router.refresh()
            }, 2000) // 等待 2 秒让 webhook 有时间处理
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error verifying session:", err)
          setError("Failed to verify payment")
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [sessionId, refreshUser, router])

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Payment Verification Failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/pricing">Back to Pricing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="pt-24 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-banana-light rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-banana-dark" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your subscription. Your account has been upgraded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Session ID:</p>
            <p className="text-xs font-mono break-all">{sessionId}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full bg-banana text-accent-foreground hover:bg-banana-dark">
              <Link href="/generator">Start Using Generator</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/pricing">Back to Pricing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 3. 主页面只负责渲染 Layout 和 Suspense 边界
export default function PricingSuccessPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<LoadingState />}>
        <PaymentVerificationContent />
      </Suspense>
      <Footer />
    </main>
  )
}