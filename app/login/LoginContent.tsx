'use client'

import { useSearchParams } from 'next/navigation';
import GoogleLoginButton from '@/components/google-login-button';

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

export default LoginContent;
