#!/bin/bash

# Script to update Vercel environment variables with correct database credentials
echo "Updating Vercel environment variables..."

# Note: You need to have Vercel CLI installed and be logged in
# vercel login

# Update environment variables
vercel env rm DATABASE_URL production --yes 2>/dev/null
vercel env add DATABASE_URL production <<< "postgresql://postgres.eqbinweqqfnobxepkuyp:Mingming2018!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

vercel env rm DIRECT_URL production --yes 2>/dev/null
vercel env add DIRECT_URL production <<< "postgresql://postgres.eqbinweqqfnobxepkuyp:Mingming2018!@db.eqbinweqqfnobxepkuyp.supabase.co:5432/postgres"

# These remain unchanged (already correct)
vercel env rm SUPABASE_URL production --yes 2>/dev/null
vercel env add SUPABASE_URL production <<< "https://eqbinweqqfnobxepkuyp.supabase.co"

vercel env rm SUPABASE_ANON_KEY production --yes 2>/dev/null
vercel env add SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNzQ4NjIsImV4cCI6MjA3MzY1MDg2Mn0.D3PajL8KnfZdZFwGsvCOtUVuIKPjkT7r4RKctRn3ZqA"

vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes 2>/dev/null
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYmlud2VxcWZub2J4ZXBrdXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA3NDg2MiwiZXhwIjoyMDczNjUwODYyfQ.CfQiaQUVziTms7aQKyZ47Hqi-tTNZyTVWckGBfbivnc"

# Redis URL (placeholder)
vercel env rm UPSTASH_REDIS_URL production --yes 2>/dev/null
vercel env add UPSTASH_REDIS_URL production <<< "redis://localhost:6379"

# API Keys (placeholders - update with real keys)
vercel env rm ANTHROPIC_API_KEY production --yes 2>/dev/null
vercel env add ANTHROPIC_API_KEY production <<< "sk-ant-api03-placeholder"

vercel env rm RESEND_API_KEY production --yes 2>/dev/null
vercel env add RESEND_API_KEY production <<< "re_placeholder"

# App URL
vercel env rm NEXT_PUBLIC_APP_URL production --yes 2>/dev/null
vercel env add NEXT_PUBLIC_APP_URL production <<< "https://funnelai-steel.vercel.app"

echo "Environment variables updated!"
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel: vercel --prod"
echo "2. Or trigger a redeploy from the Vercel dashboard"
echo ""
echo "Note: You still need to add real API keys for:"
echo "  - ANTHROPIC_API_KEY (for AI generation)"
echo "  - RESEND_API_KEY (for emails)"
echo "  - UPSTASH_REDIS_URL (or use a Redis service)"