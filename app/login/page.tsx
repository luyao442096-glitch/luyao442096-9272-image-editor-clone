'use client'; // 👈 必须放在第一行！

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// 确保下面这个组件的路径是正确的，如果不正确请修改
import GoogleLoginButton from '@/components/google-login-button'; 

// 1. 拆分出一个内部组件来处理搜索参数逻辑
function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  return (
    <div className="login-page">
      <h1>登录</h1>
      {/* 如果有错误参数，显示提示 */}
      {error && <p className="error" style={{color: 'red'}}>登录失败，请重试</p>}
      <GoogleLoginButton />
    </div>
  );
}

// 2. 主页面导出
export default function LoginPage() {
  return (
    // 👈 关键：用 Suspense 包裹住使用了 useSearchParams 的组件
    // 这样 Next.js 在构建时就不会报错了
    <Suspense fallback={<div>加载中...</div>}>
      <LoginContent />
    </Suspense>
  );
}