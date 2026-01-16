"use client"

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  isPro: boolean
  credits: number // This will now be fetched from the database
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  signInWithGoogle: () => Promise<void>
  refreshUser: () => Promise<void>; // Added to allow manual refresh of user data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to map Supabase user to app user
// This helper is no longer needed as the logic is integrated into AuthProvider

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Define the structure of data fetched from the 'profiles' table
  interface UserProfileData {
    credits: number;
    is_pro: boolean; // Assuming 'is_pro' is also stored in your profiles table
    // Add any other custom fields you store in 'profiles' here
  }

  // Function to fetch user profile data (including credits) from the 'profiles' table
  const fetchUserProfileData = useCallback(async (supabaseUser: SupabaseUser): Promise<UserProfileData | null> => {
    const { data: profile, error } = await supabase
      .from('profiles') // Assuming your custom user data is in a 'profiles' table
      .select('credits, is_pro') // Select credits and any other relevant fields like is_pro
      .eq('id', supabaseUser.id)
      .single();

    if (error) {
      console.error('Error fetching user profile data:', error);
      return null;
    }
    return profile;
  }, [supabase]);

  // Function to fetch and set the full user object (Supabase user + custom profile)
  const fetchAndSetUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const supabaseUser = session.user;
        const profileData = await fetchUserProfileData(supabaseUser);

        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
          avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
          isPro: profileData?.is_pro || false, // Use fetched is_pro, default to false
          credits: profileData?.credits || 0, // Use fetched credits, default to 0
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error in fetchAndSetUser:", error);
      setUser(null); // Ensure user is null on error
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchUserProfileData]);

  // Function to manually refresh user data
  const refreshUser = useCallback(async () => {
    await fetchAndSetUser();
  }, [fetchAndSetUser]);

  useEffect(() => {
    // Initial load of user data
    fetchAndSetUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // When auth state changes (login, logout, token refresh), re-fetch user data
      fetchAndSetUser();
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchAndSetUser]); // Dependency on fetchAndSetUser

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

  return <AuthContext.Provider value={{ user, isLoading, login, logout, signup, signInWithGoogle, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
