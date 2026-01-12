import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const next = searchParams.get("next") ?? "/generator"
  
  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables are not configured")
      return NextResponse.redirect(
        `${origin}/login?error=auth_failed&details=${encodeURIComponent("Supabase configuration error")}`
      )
    }

    const supabase = await createClient()

    const {
      data: { url },
      error,
    } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      console.error("Supabase OAuth error:", error)
      return NextResponse.redirect(
        `${origin}/login?error=auth_failed&details=${encodeURIComponent(error.message)}`
      )
    }

    if (!url) {
      console.error("No OAuth URL returned from Supabase")
      return NextResponse.redirect(
        `${origin}/login?error=auth_failed&details=${encodeURIComponent("Failed to generate OAuth URL")}`
      )
    }

    // 直接重定向到 Google OAuth URL
    return NextResponse.redirect(url)
  } catch (error: any) {
    console.error("Unexpected error in Google OAuth:", error)
    return NextResponse.redirect(
      `${origin}/login?error=auth_failed&details=${encodeURIComponent(error.message || "An unexpected error occurred")}`
    )
  }
}

export async function POST(request: Request) {
  try {
    const { origin, searchParams } = new URL(request.url)
    const next = searchParams.get("next") ?? "/generator"
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables are not configured")
      return NextResponse.json(
        { 
          error: "Supabase configuration error",
          details: "Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set"
        },
        { status: 500 }
      )
    }

    const supabase = await createClient()

    const {
      data: { url },
      error,
    } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      console.error("Supabase OAuth error:", error)
      return NextResponse.json(
        { 
          error: error.message,
          details: error.status ? `Status: ${error.status}` : undefined,
          hint: error.message.includes("provider") 
            ? "Please ensure Google provider is enabled in Supabase Authentication > Providers"
            : undefined
        },
        { status: 400 }
      )
    }

    if (!url) {
      console.error("No OAuth URL returned from Supabase")
      return NextResponse.json(
        { 
          error: "Failed to generate OAuth URL",
          details: "Please check your Supabase Google provider configuration"
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error("Unexpected error in Google OAuth:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message || "An unexpected error occurred"
      },
      { status: 500 }
    )
  }
}