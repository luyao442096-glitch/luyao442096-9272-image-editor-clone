import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("CREEM_WEBHOOK_SECRET not configured")
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      )
    }

    // Get the raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get("x-creem-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      )
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex")

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature")
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    // Parse webhook payload
    const event = JSON.parse(body)
    const { type, data } = event

    console.log("Creem webhook event:", type, data)

    // Handle different event types
    switch (type) {
      case "checkout.completed":
        await handleCheckoutCompleted(data)
        break
      case "subscription.active":
        await handleSubscriptionActive(data)
        break
      case "subscription.canceled":
        await handleSubscriptionCanceled(data)
        break
      case "subscription.updated":
        await handleSubscriptionUpdated(data)
        break
      case "payment.succeeded":
        await handlePaymentSucceeded(data)
        break
      case "payment.failed":
        await handlePaymentFailed(data)
        break
      default:
        console.log(`Unhandled event type: ${type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(data: any) {
  const { customer_id, metadata, subscription_id } = data

  if (!customer_id || !metadata) {
    console.error("Missing customer_id or metadata in checkout.completed")
    return
  }

  const { user_id, plan_id, billing_period } = metadata

  // Use service role key for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL not configured")
    return
  }

  // Create admin client for database operations
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js")
  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // Calculate credits based on plan
  const creditsMap: Record<string, { monthly: number; yearly: number }> = {
    basic: { monthly: 200, yearly: 2400 },
    pro: { monthly: 800, yearly: 9600 },
    max: { monthly: 3600, yearly: 43200 },
  }

  const credits = creditsMap[plan_id]?.[billing_period as "monthly" | "yearly"] || 0

  // Update user subscription (you may need to create a subscriptions table)
  // For now, we'll update user metadata
  // FIX: 使用结构赋值获取 error，而不是使用 .catch
  const { error: upsertError } = await supabase
    .from("user_subscriptions")
    .upsert({
      user_id: user_id || customer_id,
      plan_id,
      billing_period,
      subscription_id,
      status: "active",
      credits,
      credits_used: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  
  // 单独处理错误
  if (upsertError) {
      console.error("Error updating subscription:", upsertError)
  }

  console.log(`Checkout completed for user ${user_id || customer_id}, plan: ${plan_id}`)
}

async function handleSubscriptionActive(data: any) {
  const { customer_id, subscription_id } = data
  console.log(`Subscription active: ${subscription_id} for customer ${customer_id}`)
  // Update subscription status in database
}

async function handleSubscriptionCanceled(data: any) {
  const { customer_id, subscription_id } = data
  console.log(`Subscription canceled: ${subscription_id} for customer ${customer_id}`)
  
  // Update subscription status in database
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL not configured")
    return
  }

  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js")
  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // FIX: 同样修复这里的 .catch 写法
  const { error: updateError } = await supabase
    .from("user_subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("subscription_id", subscription_id)

  if (updateError) {
    console.error("Error updating canceled subscription:", updateError)
  }
}

async function handleSubscriptionUpdated(data: any) {
  const { customer_id, subscription_id } = data
  console.log(`Subscription updated: ${subscription_id} for customer ${customer_id}`)
  // Update subscription details in database
}

async function handlePaymentSucceeded(data: any) {
  const { customer_id, amount, currency } = data
  console.log(`Payment succeeded: ${amount} ${currency} for customer ${customer_id}`)
  // Handle successful payment
}

async function handlePaymentFailed(data: any) {
  const { customer_id, amount, currency } = data
  console.log(`Payment failed: ${amount} ${currency} for customer ${customer_id}`)
  // Handle failed payment
}