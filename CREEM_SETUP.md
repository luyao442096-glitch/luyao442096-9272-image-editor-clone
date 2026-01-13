# Creem Payment Integration Setup Guide

This guide will help you set up Creem payment integration for the pricing page.

## Prerequisites

1. Create a Creem account at [creem.io](https://www.creem.io/)
2. Obtain your API credentials from the Creem dashboard

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Creem API Configuration
CREEM_API_KEY=ck_test_your_api_key_here
CREEM_WEBHOOK_SECRET=your_webhook_secret_here

# Creem Product IDs (create products in Creem dashboard first)
CREEM_PRODUCT_BASIC_MONTHLY=prod_basic_monthly_id
CREEM_PRODUCT_BASIC_YEARLY=prod_basic_yearly_id
CREEM_PRODUCT_PRO_MONTHLY=prod_pro_monthly_id
CREEM_PRODUCT_PRO_YEARLY=prod_pro_yearly_id
CREEM_PRODUCT_MAX_MONTHLY=prod_max_monthly_id
CREEM_PRODUCT_MAX_YEARLY=prod_max_yearly_id

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 1: Create Products in Creem Dashboard

1. Log in to your Creem dashboard
2. Navigate to **Products** section
3. Create 6 products corresponding to your subscription plans:

   **Basic Plan:**
   - Basic Monthly: $12/month (Subscription, monthly billing)
   - Basic Yearly: $144/year (Subscription, yearly billing)

   **Pro Plan:**
   - Pro Monthly: $19.50/month (Subscription, monthly billing)
   - Pro Yearly: $234/year (Subscription, yearly billing)

   **Max Plan:**
   - Max Monthly: $80/month (Subscription, monthly billing)
   - Max Yearly: $960/year (Subscription, yearly billing)

4. Copy the Product IDs for each product and add them to your `.env.local` file

## Step 2: Configure Webhooks

1. In the Creem dashboard, go to **Developers** > **Webhooks**
2. Create a new webhook with the following URL:
   ```
   https://your-domain.com/api/creem/webhook
   ```
   For local development, you can use a service like [ngrok](https://ngrok.com/) to expose your local server:
   ```
   https://your-ngrok-url.ngrok.io/api/creem/webhook
   ```
3. Select the following events to listen for:
   - `checkout.completed`
   - `subscription.active`
   - `subscription.canceled`
   - `subscription.updated`
   - `payment.succeeded`
   - `payment.failed`
4. Copy the webhook secret and add it to your `.env.local` file as `CREEM_WEBHOOK_SECRET`

## Step 3: Database Setup (Optional but Recommended)

Create a `user_subscriptions` table in your Supabase database to track subscriptions:

```sql
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
  subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  credits INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_subscription_id ON user_subscriptions(subscription_id);
```

## Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/pricing` page
3. Click on a subscription plan
4. You'll be redirected to Creem checkout (test mode)
5. Complete a test payment using Creem's test card numbers
6. Verify the webhook is received and processed correctly

## API Routes

The integration includes the following API routes:

- **POST `/api/creem/checkout`**: Creates a checkout session
  - Body: `{ planId: string, billingPeriod: 'monthly' | 'yearly' }`
  - Returns: `{ checkoutUrl: string, sessionId: string }`

- **POST `/api/creem/webhook`**: Handles Creem webhook events
  - Verifies webhook signature
  - Processes payment and subscription events
  - Updates user subscription status in database

- **GET `/api/creem/verify-session`**: Verifies a checkout session
  - Query: `?session_id=xxx`
  - Returns: `{ verified: boolean, session: object }`

## Troubleshooting

### Webhook not receiving events

1. Check that your webhook URL is publicly accessible
2. Verify the webhook secret matches in both Creem dashboard and `.env.local`
3. Check server logs for webhook errors
4. Ensure your webhook endpoint returns a 200 status code

### Checkout session creation fails

1. Verify `CREEM_API_KEY` is set correctly
2. Check that product IDs match the ones in Creem dashboard
3. Ensure user is authenticated before creating checkout session
4. Check API response in browser console

### Payment succeeds but subscription not updated

1. Check webhook logs in Creem dashboard
2. Verify webhook is receiving events
3. Check database connection and table structure
4. Review server logs for errors

## Production Checklist

Before going to production:

- [ ] Switch from test API key to production API key
- [ ] Update `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Update webhook URL to production domain
- [ ] Test all subscription plans end-to-end
- [ ] Set up monitoring for webhook events
- [ ] Configure error alerting
- [ ] Review and test cancellation flow
- [ ] Set up database backups

## Additional Resources

- [Creem Documentation](https://docs.creem.io/)
- [Creem API Reference](https://docs.creem.io/api-reference/introduction)
- [Creem Webhook Guide](https://docs.creem.io/webhooks)
