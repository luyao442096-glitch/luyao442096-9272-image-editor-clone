'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
// 确保这个路径与您实际的项目结构一致，如果报错找不到组件，请检查这里
import GoogleLoginButton from '@/components/google-login-button'; 

// 1. 创建一个内部组件专门处理搜索参数（useSearchParams）
function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="login-container flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">登录</h1>
      
      {/* 如果 URL 中包含 error 参数，显示错误提示 */}
      {error && (
        <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4">
          登录失败，请重试
        </div>
      )}

      {/* 谷歌登录按钮 */}
      <GoogleLoginButton />
    </div>
  );
}

// 2. 默认导出页面组件，必须用 Suspense 包裹
export default function LoginPage() {
  return (
    // Suspense 是解决 "useSearchParams" 构建错误的关键
    <Suspense fallback={<div className="p-4 text-center">正在加载登录界面...</div>}>
      <LoginContent />
    </Suspense>
  );
}