import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. 获取 URL 里的 code 参数
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  // 这里的 next 是登录后要跳去的页面，默认是首页 /
  const next = searchParams.get("next") ?? "/";

  if (code) {
    // 2. 初始化 Supabase 客户端
    const supabase = createClient();
    
    // 3. 核心步骤：用 code 换取 session (也就是登录成功)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // 4. 登录成功，跳转回首页
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 5. 如果出错了，跳转到错误页
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}