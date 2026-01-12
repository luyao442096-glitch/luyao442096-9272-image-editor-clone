"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const { login, signup, signInWithGoogle } = useAuth()
  const { t } = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get("error")
    const errorDetails = searchParams.get("details")
    
    if (errorParam === "auth_failed") {
      let errorMessage = "Google 登录失败，请重试。"
      
      if (errorDetails) {
        const decodedDetails = decodeURIComponent(errorDetails)
        errorMessage = `Google 登录失败: ${decodedDetails}`
        
        // Provide helpful hints based on error
        if (decodedDetails.includes("redirect_uri_mismatch")) {
          errorMessage += "\n\n提示：请检查 Google Cloud Console 中的重定向 URI 配置"
        } else if (decodedDetails.includes("provider") || decodedDetails.includes("disabled")) {
          errorMessage += "\n\n提示：请确保在 Supabase 中已启用 Google 提供商"
        } else if (decodedDetails.includes("configuration")) {
          errorMessage += "\n\n提示：请检查 Supabase 环境变量配置"
        }
      }
      
      setError(errorMessage)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      let success: boolean
      if (isLogin) {
        success = await login(email, password)
      } else {
        success = await signup(email, password, name)
      }

      if (success) {
        router.push("/generator")
      } else {
        setError("Invalid credentials. Please try again.")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-10 rotate-12">🍌</div>
        <div className="absolute bottom-20 right-10 text-6xl opacity-10 -rotate-12">🍌</div>
        <div className="absolute top-1/2 right-20 text-4xl opacity-5 rotate-45">🍌</div>
      </div>

      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">🍌</span>
            <span className="font-bold text-2xl">Nano Banana</span>
          </Link>
          <CardTitle className="text-2xl">{isLogin ? t.welcomeBack : t.signUp}</CardTitle>
          <CardDescription>{t.loginSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-sm text-muted-foreground">
                    {t.rememberMe}
                  </label>
                </div>
                <Link href="#" className="text-sm text-banana-dark hover:underline">
                  {t.forgotPassword}
                </Link>
              </div>
            )}

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-banana text-accent-foreground hover:bg-banana-dark"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : isLogin ? (
                t.signIn
              ) : (
                t.signUp
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t.orContinueWith}</span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                type="button"
                className="w-full"
                disabled={isGoogleLoading}
                onClick={async () => {
                  setIsGoogleLoading(true)
                  setError("")
                  try {
                    await signInWithGoogle()
                  } catch (err: any) {
                    const errorMessage = err?.message || "Google 登录失败，请重试。"
                    setError(errorMessage)
                    setIsGoogleLoading(false)
                    console.error("Google login error:", err)
                  }
                }}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? t.noAccount : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-banana-dark hover:underline font-medium"
            >
              {isLogin ? t.signUp : t.signIn}
            </button>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
