import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 获取登录后要跳转的地址，如果没有就跳回首页
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies() // 👈 Next.js 15 必须加 await
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // 在 Server Action 或 Route Handler 中设置 cookie 是安全的
              // 这里的 try/catch 是为了忽略某些边缘情况的报错
            }
          },
        },
      }
    )
    
    // 用验证码交换 Session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 登录成功！把用户重定向到他原本想去的地方
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 如果出错，跳回错误页
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}