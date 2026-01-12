'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">登录验证失败</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        我们在验证您的谷歌登录信息时遇到了一些问题。这通常是因为验证码过期或浏览器 Cookie 限制导致的。
      </p>
      <div className="space-x-4">
        <Link href="/login">
          <Button>返回登录页重试</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">回首页</Button>
        </Link>
      </div>
    </div>
  )
}