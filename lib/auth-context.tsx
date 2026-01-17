"use client"

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
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
  // Use useMemo to ensure supabase client instance is stable
  const supabase = useMemo(() => createClient(), [])

  // Define the structure of data fetched from the 'profiles' table
  interface UserProfileData {
    credits: number;
    // Add any other custom fields you store in 'profiles' here
  }

  // Function to fetch user profile data (including credits) from the 'profiles' table
  // If profile doesn't exist, create it with 10 initial credits for new users
  // V4: COMPLETELY REWRITTEN - Only queries 'credits' column, NO is_pro
  const fetchUserProfileData = useCallback(async (supabaseUser: SupabaseUser): Promise<UserProfileData | null> => {
    // Early return if user ID is not available
    if (!supabaseUser?.id) {
      console.warn('⚠️ 用户 ID 不存在，跳过获取 profile');
      return null;
    }

    console.log('🔍 [V4-FIXED] 正在获取用户 profile 数据，用户 ID:', supabaseUser.id);
    
    // CRITICAL: Query ONLY 'credits' - 'is_pro' column DOES NOT EXIST in database
    // This is a fresh implementation to bypass any caching issues
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', supabaseUser.id)
      .single();

    // If profile exists and was fetched successfully
    if (profile && !error) {
      console.log('✅ 成功获取 profile，积分:', profile.credits);
      return profile;
    }

    // If profile doesn't exist (error code PGRST116 or message indicates no rows), create it
    const isProfileNotFound = error && (
      error.code === 'PGRST116' || 
      error.message?.includes('No rows') ||
      error.message?.includes('not found') ||
      error.code === '42P01' // relation does not exist (shouldn't happen but just in case)
    );

    if (isProfileNotFound) {
      console.log('📝 新用户首次登录，正在创建 profile 并赠送 10 积分...');
      
      // Create new profile with 10 initial credits
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          credits: 10, // 新用户赠送 10 积分
        })
        .select('credits')
        .single();

      if (createError) {
        console.error('❌ 创建 profile 失败:', createError);
        // If it's a duplicate key error, try to fetch again (race condition)
        if (createError.code === '23505' || createError.message?.includes('duplicate')) {
          console.log('⚠️ Profile 可能已被其他请求创建，重新获取...');
          const { data: retryProfile, error: retryError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', supabaseUser.id)
            .single();
          
          if (retryError) {
            console.error('❌ 重新获取 profile 也失败:', retryError);
            return null;
          }
          
          console.log('✅ 重新获取 profile 成功，积分:', retryProfile?.credits);
          return retryProfile;
        }
        return null;
      }

      console.log('✅ 新用户 profile 创建成功，初始积分:', newProfile?.credits);
      return newProfile;
    }

    // If there's another error, log it and try one more time
    if (error) {
      console.error('❌ 获取 profile 数据时出错:', error);
      console.log('🔄 尝试重新获取 profile...');
      
      // Retry once
      const { data: retryProfile, error: retryError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', supabaseUser.id)
        .single();
      
      if (retryError) {
        console.error('❌ 重试获取 profile 也失败:', retryError);
        return null;
      }
      
      if (retryProfile) {
        console.log('✅ 重试成功，获取到积分:', retryProfile.credits);
        return retryProfile;
      }
      
      return null;
    }

    console.warn('⚠️ 未获取到 profile 数据，返回 null');
    return null;
  }, [supabase]);

  // Function to fetch and set the full user object (Supabase user + custom profile)
  const fetchAndSetUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // If there's a session error or no session, clear user and return early
      if (sessionError || !session) {
        console.log('👤 用户未登录，清除用户数据');
        setUser(null);
        setIsLoading(false);
        return;
      }

      const supabaseUser = session.user;
      
      // Only fetch profile if user is authenticated
      if (!supabaseUser?.id) {
        console.log('⚠️ 用户 ID 不存在，清除用户数据');
        setUser(null);
        setIsLoading(false);
        return;
      }

      const profileData = await fetchUserProfileData(supabaseUser);

      const credits = profileData?.credits ?? 0;
      console.log('💰 设置用户积分:', credits, 'profileData:', profileData);

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
        avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
        isPro: false, // isPro is not stored in profiles table, default to false
        credits: credits, // Use fetched credits, default to 0
      });
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, 'Session:', session?.user?.id);
      
      // When auth state changes (login, logout, token refresh), re-fetch user data
      if (event === 'SIGNED_IN' && session) {
        // For sign in events, wait a bit to ensure database operations complete
        setTimeout(() => {
          console.log('⏰ 登录后延迟刷新用户数据...');
          fetchAndSetUser();
        }, 500);
      } else {
        // For other events (logout, token refresh), refresh immediately
        fetchAndSetUser();
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchAndSetUser]); // Dependency on fetchAndSetUser

  // Separate effect for real-time subscription to profiles table
  useEffect(() => {
    if (!user?.id) return;

    // Set up real-time subscription to profiles table to listen for credit changes
    const channel = supabase
      .channel(`profile-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('📊 Profile updated (credits may have changed):', payload);
          // When profile is updated (e.g., credits changed), refresh user data
          fetchAndSetUser();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchAndSetUser]);

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