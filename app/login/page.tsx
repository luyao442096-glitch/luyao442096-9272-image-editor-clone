// 第一步：先添加这行代码（最顶部）
export const dynamic = 'force-dynamic';

// 原来的代码（use client 等）放在下面
'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/google-login-button';

// 剩下的组件代码保持不变...
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <LoginContent />
    </Suspense>
  );
}