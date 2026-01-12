'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CallbackPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null
    let timeoutId: NodeJS.Timeout | null = null

    const handleCallback = async () => {
      try {
        // 初始化前端 Supabase 客户端
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // 检查 URL 参数中的错误
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (errorParam) {
          const errorMessage = errorDescription 
            ? decodeURIComponent(errorDescription) 
            : 'Authentication failed'
          setError('登录失败：' + errorMessage)
          setLoading(false)
          setTimeout(() => {
            router.push(`/login?error=auth_failed&details=${encodeURIComponent(errorMessage)}`)
          }, 2000)
          return
        }

        // 检查 URL 参数中的 code（OAuth 回调）
        const code = searchParams.get('code')
        
        if (code) {
          // 使用 code 交换会话
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            throw exchangeError
          }
          
          // 登录成功，跳转到首页或指定页面
          const next = searchParams.get('next') || '/'
          setLoading(false)
          router.push(next)
          return
        }

        // 如果没有 code，监听认证状态变化
        // 处理谷歌登录回调，获取用户会话
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            // 登录成功，跳转到首页或指定页面
            const next = searchParams.get('next') || '/'
            setLoading(false)
            router.push(next)
          } else if (event === 'SIGNED_OUT') {
            setError('登录失败：用户已登出')
            setLoading(false)
            setTimeout(() => {
              router.push('/login')
            }, 2000)
          }
        })

        subscription = authSubscription

        // 检查当前会话状态
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }
        
        if (session) {
          // 用户已认证，直接跳转
          const next = searchParams.get('next') || '/'
          setLoading(false)
          router.push(next)
        } else {
          // 没有会话，等待认证状态变化
          // 如果 5 秒后还没有登录，显示错误
          timeoutId = setTimeout(() => {
            setError('登录失败：超时')
            setLoading(false)
            setTimeout(() => {
              router.push('/login')
            }, 2000)
          }, 5000)
        }
      } catch (err: any) {
        setError('登录失败：' + (err?.message || '未知错误'))
        setLoading(false)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    }

    handleCallback()

    // 清理函数
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [router, searchParams])

  if (loading) return <div>登录验证中...</div>
  if (error) return <div>{error}</div>
  return null
}
