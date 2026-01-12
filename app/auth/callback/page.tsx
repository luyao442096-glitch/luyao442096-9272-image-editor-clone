// app/auth/callback/page.tsx
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// 把需要用 useSearchParams 的逻辑抽成子组件
const CallbackContent = () => {
  const searchParams = useSearchParams();
  // 你的原有逻辑...
  return <div>登录验证中...</div>;
};

// 父组件用 Suspense 包裹子组件
export default function CallbackPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <CallbackContent />
    </Suspense>
  );
}