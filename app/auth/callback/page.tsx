// app/login/page.tsx
'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/google-login-button';

// 子组件：处理登录页逻辑
const LoginContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  return (
    <div className="login-page">
      <h1>登录</h1>
      {error && <p className="error">登录失败，请重试</p>}
      <GoogleLoginButton />
    </div>
  );
};

// 父组件：用 Suspense 包裹子组件
export default function LoginPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <LoginContent />
    </Suspense>
  );
}