import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // 创建 Supabase 客户端
  const supabase = createMiddlewareClient({ req, res })
  
  // 关键一步：刷新 Session
  // 这会让 Supabase 读取 Cookie 并更新它，确保后续的 Route Handler 能读到用户
  await supabase.auth.getSession()
  
  return res
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (图标)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}