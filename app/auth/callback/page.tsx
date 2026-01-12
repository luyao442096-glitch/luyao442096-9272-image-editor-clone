// app/auth/callback/page.tsx
'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// 子组件：处理登录回调逻辑
const CallbackContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  // 初始化 Supabase 客户端
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 处理授权码并完成登录
  if (code) {
    supabase.auth.exchangeCodeForSession(code)
      .then(() => {
        // 登录成功后跳转到首页
        router.push('/');
      })
      .catch(() => {
        // 登录失败跳转到登录页
        router.push('/login');
      });
  }

  return <div>登录验证中，请稍候...</div>;
};

// 父组件：用 Suspense 包裹子组件
export default function CallbackPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <CallbackContent />
    </Suspense>
  );
}