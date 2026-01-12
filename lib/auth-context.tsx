"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  isPro: boolean
  credits: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to map Supabase user to app user
function mapSupabaseUserToAppUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
    avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
    isPro: false, // You can extend this based on your business logic
    credits: 10, // You can fetch this from your database
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(mapSupabaseUserToAppUser(session?.user ?? null))
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUserToAppUser(session?.user ?? null))
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name,
          },
        },
      })

      if (error) {
        console.error("Signup error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || "Failed to initiate Google sign in"
        const errorDetails = data.details || ""
        const errorHint = data.hint || ""
        
        console.error("Google sign in API error:", {
          status: response.status,
          error: errorMessage,
          details: errorDetails,
          hint: errorHint,
        })
        
        throw new Error(
          errorHint 
            ? `${errorMessage}\n\n${errorHint}${errorDetails ? `\n${errorDetails}` : ""}`
            : errorMessage
        )
      }

      const { url } = data
      if (!url) {
        throw new Error("No redirect URL received from server")
      }

      window.location.href = url
    } catch (error: any) {
      console.error("Google sign in error:", error)
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Logout error:", error)
      }
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, signup, signInWithGoogle }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
