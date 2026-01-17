"use client"

import { useEffect, useState } from "react" // 1. 引入 useState
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, User, LogOut, ChevronDown } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client" // 2. 引入 Supabase 客户端

export function Header() {
  const { locale, setLocale, t } = useLocale()
  const { user, logout, refreshUser } = useAuth()
  const pathname = usePathname()
  
  // 3. 新增：专门用于显示的实时积分状态
  const [displayCredits, setDisplayCredits] = useState(0)
  const supabase = createClient()

  // 4. 新增：当用户登录后，直接去 profiles 表查积分
  useEffect(() => {
    async function fetchLatestCredits() {
      if (!user) return
      
      // 先用 user 里现有的作为兜底
      setDisplayCredits(user.credits || 0)

      // 去数据库查最新的
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (data && !error) {
        console.log("Realtime credits fetched:", data.credits) // 调试用
        setDisplayCredits(data.credits)
      }
    }

    fetchLatestCredits()
  }, [user, supabase])

  // Refresh user data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        refreshUser();
        // 页面可见时，也重新触发一次查询（可选）
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, refreshUser]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      {/* ...省略部分代码保持不变... */}
      <div className="bg-banana text-accent-foreground py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
           {/* ...省略 Banner 部分... */}
           <span className="flex items-center gap-1">
            <span className="text-base">🍌</span>
            {t.newBanner}
          </span>
          <Link href="/generator" className="font-semibold hover:underline">
            {t.tryNow}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
             {/* ...Logo... */}
             <span className="font-bold text-xl text-foreground">Nano Banana</span>
          </Link>

          {/* ...Nav Links... */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/generator" className="..."> {t.generator} </Link>
            <Link href="/#features" className="..."> {t.features} </Link>
            <Link href="/#showcase" className="..."> {t.showcase} </Link>
            <Link href="/pricing" className="..."> {t.pricing} </Link>
            <Link href="/#faq" className="..."> {t.faq} </Link>
          </nav>

          <div className="flex items-center gap-3">
             {/* ...省略 Pricing 和 Language ... */}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-banana flex items-center justify-center">
                      <User className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <span className="hidden sm:inline">{user.name}</span>
                    
                    {/* 5. 修改：这里使用 displayCredits 而不是 user.credits */}
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      {displayCredits} credits
                    </Badge>

                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                   {/* ...Menu Items... */}
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
               /* ...Login Buttons... */
               <Button asChild><Link href="/login">{t.login}</Link></Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}