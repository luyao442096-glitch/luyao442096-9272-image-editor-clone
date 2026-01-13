"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, User, LogOut, ChevronDown } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAuth } from "@/lib/auth-context"

export function Header() {
  const { locale, setLocale, t } = useLocale()
  const { user, logout } = useAuth()
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="bg-banana text-accent-foreground py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
          <Badge
            variant="outline"
            className="bg-background text-foreground border-none px-2 py-0.5 text-xs font-semibold"
          >
            NEW
          </Badge>
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
            <span className="text-2xl">🍌</span>
            <span className="font-bold text-xl text-foreground">Nano Banana</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/generator"
              className={`transition-colors ${pathname === "/generator" ? "text-banana-dark font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.generator}
            </Link>
            <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.features}
            </Link>
            <Link href="/#showcase" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.showcase}
            </Link>
            <Link
              href="/pricing"
              className={`transition-colors ${pathname === "/pricing" ? "text-banana-dark font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.pricing}
            </Link>
            <Link href="/#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.faq}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className={`hidden sm:inline-flex text-sm font-medium transition-colors ${
                pathname === "/pricing" ? "text-banana-dark" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.pricing}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs uppercase">{locale}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocale("en")} className={locale === "en" ? "bg-muted" : ""}>
                  <span className="mr-2">🇺🇸</span> English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale("zh")} className={locale === "zh" ? "bg-muted" : ""}>
                  <span className="mr-2">🇨🇳</span> 中文
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-banana flex items-center justify-center">
                      <User className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <span className="hidden sm:inline">{user.name}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      {user.credits} credits
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/generator">Generator</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing">{t.pricing}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                  <Link href="/login">{t.login}</Link>
                </Button>
                <Button className="bg-banana text-accent-foreground hover:bg-banana-dark" asChild>
                  <Link href="/login">
                    <span className="mr-1">🍌</span>
                    {t.tryFree}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
