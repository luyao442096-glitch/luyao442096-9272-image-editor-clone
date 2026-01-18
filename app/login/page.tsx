import { Metadata } from 'next';
import { Suspense } from 'react';
import GoogleLoginButton from '@/components/google-login-button';
import LoginContent from './LoginContent';

// 登录页面特定的元数据
export const metadata: Metadata = {
  title: "登录 - Zlseren AI 智能助手",
  description: "登录到您的 Zlseren 账户，访问 AI 智能助手功能并管理您的积分。",
  keywords: [
    "Zlseren 登录",
    "AI 智能助手登录",
    "Zlseren 账户",
    "AI 助手登录",
    "Zlseren 登录入口"
  ],
  openGraph: {
    title: "登录 - Zlseren AI 智能助手",
    description: "登录到您的 Zlseren 账户，访问 AI 智能助手功能并管理您的积分。",
    url: "https://www.zlseren.online/login"
  },
  twitter: {
    title: "登录 - Zlseren AI 智能助手",
    description: "登录到您的 Zlseren 账户，访问 AI 智能助手功能并管理您的积分。",
  },
  alternates: {
    canonical: "https://www.zlseren.online/login"
  }
};

// 默认导出页面组件，必须用 Suspense 包裹
export default function LoginPage() {
  return (
    // Suspense 是解决 "useSearchParams" 构建错误的关键
    <Suspense fallback={<div className="p-4 text-center">正在加载登录界面...</div>}>
      <LoginContent />
    </Suspense>
  );
}