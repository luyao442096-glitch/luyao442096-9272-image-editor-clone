"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"

export default function PricingSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const { t } = useLocale()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      // Verify the session with backend
      fetch(`/api/creem/verify-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error)
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
  }, [sessionId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-banana mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying payment...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
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
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
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
      <Footer />
    </main>
  )
}
