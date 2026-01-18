"use client"

import Link from "next/link"
import { BananaDecoration } from "@/components/banana-decoration"
import { useLocale } from "@/lib/locale-context"

export function Footer() {
  const { t } = useLocale()

  return (
    <footer className="bg-foreground text-background py-16 relative overflow-hidden">
      {/* Decorative bananas */}
      <BananaDecoration className="absolute top-8 right-16 w-20 h-20 rotate-[15deg] opacity-10" />
      <BananaDecoration className="absolute bottom-8 left-12 w-16 h-16 rotate-[-20deg] opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍌</span>
              <span className="font-bold text-xl text-background">Zlseren AI</span>
            </Link>
            <p className="text-background/70 text-sm max-w-md leading-relaxed">{t.footerDescription}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-background mb-4">{t.product}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/generator" className="text-background/70 hover:text-banana transition-colors text-sm">
                  {t.editor}
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-background/70 hover:text-banana transition-colors text-sm">
                  {t.features}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-background/70 hover:text-banana transition-colors text-sm">
                  {t.pricing}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-background/70 hover:text-banana transition-colors text-sm">
                  {t.api}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">{t.company}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-background/70 hover:text-banana transition-colors text-sm">
                  {t.about}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-background/70 hover:text-banana transition-colors text-sm">
                  {t.blog}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-background/70 hover:text-banana transition-colors text-sm">
                  {t.careers}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-background/70 hover:text-banana transition-colors text-sm">
                  {t.contact}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-background/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">© 2026 Zlseren AI. {t.allRights}</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-background/50 hover:text-banana transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-background/50 hover:text-banana transition-colors text-sm">
              Terms of Service
            </Link>
            <Link href="#" className="text-background/50 hover:text-banana transition-colors text-sm">
              {t.cookies}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
