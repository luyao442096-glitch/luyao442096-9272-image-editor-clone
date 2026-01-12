'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs' // 👈 引入 Supabase 客户端
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface GoogleLoginButtonProps {
  next?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'
  children?: React.ReactNode
}

export default function GoogleLoginButton({
  next,
  className,
  variant = 'outline',
  size = 'default',
  children,
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  // 创建 Supabase 客户端实例
  const supabase = createClientComponentClient()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      // 1. 获取当前网站的域名 (比如 https://www.zlseren.online)
      const origin = window.location.origin
      
      // 2. 决定登录后跳去哪里
      const nextPath = next || searchParams.get('next') || '/generator'
      
      // 3. 直接调用 Supabase 登录接口
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // 拼接完整的回调地址，并带上 next 参数以便登录后跳转
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('登录出错:', error.message)
        alert('登录出错: ' + error.message) // 弹个窗提示错误
        setIsLoading(false)
      }
      // 如果成功，Supabase 会自动跳转，不需要我们在代码里写 router.push
    } catch (err) {
      console.error('发生意外错误:', err)
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
      type="button"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {children || '登录中...'}
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
          {children || '谷歌账号登录'}
        </>
      )}
    </Button>
  )
}