'use client'

import { useSearchParams } from 'next/navigation' // 👈 引入这个钩子
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  // 获取网址里的错误信息
  const errorMsg = searchParams.get('error')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">登录验证失败</h1>
      
      {/* 👇 这里会显示具体的红色英文报错，请把这行红字截图发给我！ */}
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 max-w-lg break-all">
        <p className="font-bold">错误详情：</p>
        <p>{errorMsg || '未知错误'}</p>
      </div>

      <p className="text-gray-600 mb-8 max-w-md">
        请尝试返回首页重新登录。如果问题持续存在，请将上方的错误详情发送给开发者。
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

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>加载错误信息...</div>}>
      <ErrorContent />
    </Suspense>
  )
}