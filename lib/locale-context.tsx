"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Locale } from "./i18n"
import { getTranslation } from "./i18n"

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: ReturnType<typeof getTranslation>
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en")
  const [t, setT] = useState(getTranslation("en"))

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale
    if (saved && (saved === "en" || saved === "zh")) {
      setLocale(saved)
      setT(getTranslation(saved))
    }
  }, [])

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    setT(getTranslation(newLocale))
    localStorage.setItem("locale", newLocale)
  }

  return <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider")
  }
  return context
}
