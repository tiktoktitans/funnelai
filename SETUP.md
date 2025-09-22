# InfoOS CRM Setup Guide

## Quick Start

The application is now deployed but requires configuration to enable all features.

### 1. Clerk Authentication Setup (Required for Login)

1. **Create a Clerk Account**
   - Go to https://clerk.com and sign up
   - Create a new application

2. **Get Your API Keys**
   - In Clerk Dashboard, go to API Keys
   - Copy the following:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`

3. **Add to Vercel**
   - Go to https://vercel.com/tiktok-titans-projects/funnelai/settings/environment-variables
   - Add these environment variables:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```

4. **Redeploy**
   - After adding environment variables, redeploy from Vercel dashboard

### 2. Database Setup (Required for Data Storage)

1. **Supabase (Recommended)**
   - Go to https://supabase.com and create a project
   - Copy the connection string from Settings > Database
   - Add to Vercel:
   ```
   DATABASE_URL=postgresql://...
   ```

### 3. Twilio Setup (For SMS)

1. **Create Twilio Account**
   - Go to https://www.twilio.com/try-twilio
   - Get a phone number

2. **Configure in Settings**
   - Go to /settings in the app
   - Enter your Twilio credentials
   - Test the connection

### 4. Postmark Setup (For Email)

1. **Create Postmark Account**
   - Go to https://postmarkapp.com
   - Create a server and verify sender signature

2. **Configure in Settings**
   - Go to /settings in the app
   - Enter your Postmark API key
   - Test the connection

## Current Application URLs

- Production: https://funnelai-cisnxueo4-tiktok-titans-projects.vercel.app
- Main Domain: https://funnelai-steel.vercel.app

## Features Available

✅ **Without Configuration:**
- Browse all pages
- View UI and layout
- See demo data

⚠️ **Requires Clerk:**
- User authentication
- Protected routes
- User profiles

⚠️ **Requires Database:**
- Save contacts/leads
- Store conversations
- Pipeline data

⚠️ **Requires Twilio/Postmark:**
- Send SMS/Email
- Receive messages
- Automated campaigns

## Troubleshooting

**500 Error on Homepage:**
- The middleware is set to bypass authentication if Clerk is not configured
- Once you add Clerk keys and redeploy, authentication will be enabled

**Cannot Save Data:**
- Database connection is required
- Add DATABASE_URL to Vercel environment variables

**Cannot Send Messages:**
- Configure Twilio/Postmark in Settings page
- Test connections before use

## Next Steps

1. Add Clerk environment variables (most important)
2. Connect database
3. Configure messaging providers
4. Start adding contacts and sending messages!