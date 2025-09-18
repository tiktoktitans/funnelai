#!/bin/bash

# Set environment variables for Vercel deployment
echo "Setting up Vercel environment variables..."

# Database (Supabase placeholders)
vercel env add DATABASE_URL production <<< "postgres://user:pass@localhost:5432/db?pgbouncer=true"
vercel env add DIRECT_URL production <<< "postgres://user:pass@localhost:5432/db"
vercel env add SUPABASE_URL production <<< "https://placeholder.supabase.co"
vercel env add SUPABASE_ANON_KEY production <<< "placeholder-anon-key"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "placeholder-service-role-key"

# Redis
vercel env add UPSTASH_REDIS_URL production <<< "redis://localhost:6379"

# APIs (placeholders)
vercel env add ANTHROPIC_API_KEY production <<< "sk-ant-api-placeholder"
vercel env add RESEND_API_KEY production <<< "re_placeholder"

# App URL
vercel env add NEXT_PUBLIC_APP_URL production <<< "https://funnelai.vercel.app"

# Git & Deployment (placeholders)
vercel env add GITHUB_REPO_SSH_URL production <<< "git@github.com:tiktoktitans/funnel-sites.git"
vercel env add GITHUB_REPO_PATH production <<< "./sites-repo"
vercel env add GIT_AUTHOR_NAME production <<< "FunnelAI"
vercel env add GIT_AUTHOR_EMAIL production <<< "ops@funnelai.app"
vercel env add VERCEL_DEPLOY_HOOK_URL production <<< "https://api.vercel.com/v1/integrations/deploy/prj_xxx/xxx"
vercel env add VERCEL_TOKEN production <<< "placeholder-token"

echo "Environment variables configured!"