# 🎉 FunnelAI Successfully Deployed to Vercel!

## Live Production URLs

### Main Application
🚀 **Production URL**: https://funnelai-j7hyknalx-tiktok-titans-projects.vercel.app

### Deployment Details
- **Status**: ✅ Ready
- **Environment**: Production
- **Build Time**: 45 seconds
- **Deployment ID**: DfYwQZYrkpFovq4JErAdWsgXUVSQ
- **Inspect URL**: https://vercel.com/tiktok-titans-projects/funnelai/DfYwQZYrkpFovq4JErAdWsgXUVSQ

## GitHub Repository
📦 **Source Code**: https://github.com/tiktoktitans/funnelai

## Local Development
🔧 **Local URL**: http://localhost:3002

## Project Configuration

### Environment Variables Needed
To fully enable all features, add these environment variables in Vercel Dashboard:

```env
# Database (Supabase)
DATABASE_URL=your_supabase_connection_string
DIRECT_URL=your_supabase_direct_connection
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Redis (for queue system)
UPSTASH_REDIS_URL=your_redis_url

# AI (Claude)
ANTHROPIC_API_KEY=your_claude_api_key

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# App URL
NEXT_PUBLIC_APP_URL=https://funnelai-j7hyknalx-tiktok-titans-projects.vercel.app
```

## Getting Deploy Hook URL

1. Go to [Vercel Dashboard](https://vercel.com/tiktok-titans-projects/funnelai)
2. Navigate to **Settings** → **Git**
3. Find **Deploy Hooks** section
4. Create a new deploy hook with name "FunnelAI Builder"
5. Copy the hook URL
6. Update your local `.env.local`:
   ```
   VERCEL_DEPLOY_HOOK_URL=<your-hook-url>
   ```

## Features Ready to Test

### MVP Complete ✅
- **Wizard → Claude JSON specs** - AI-powered funnel generation
- **Editor with Live Preview** - Real-time preview without rebuilds
- **Build & Deploy Pipeline** - GitHub commits + Vercel deployments
- **Form Submissions** - With honeypot spam protection
- **Build Logging** - Detailed logs for debugging
- **Idempotency** - Prevents duplicate builds

### System Architecture
- **Frontend**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: BullMQ with Redis
- **AI**: Claude API integration
- **Deployment**: Git + Vercel Deploy Hooks

## Next Steps

1. **Configure Real Environment Variables**
   - Set up Supabase database
   - Add Claude API key
   - Configure email service

2. **Test the Full Flow**
   - Create a new project
   - Generate content with AI
   - Edit and customize
   - Build & Deploy
   - Check live site

3. **Custom Domain** (Optional)
   - Add a custom domain in Vercel Dashboard
   - Update NEXT_PUBLIC_APP_URL accordingly

## Commands

### Local Development
```bash
pnpm dev          # Start dev server on port 3002
pnpm build        # Build for production
pnpm lint         # Run linting
pnpm typecheck    # Type checking
```

### Deployment
```bash
git push          # Auto-deploys via GitHub integration
vercel --prod     # Manual deployment to production
```

## Support & Documentation

- **GitHub Issues**: https://github.com/tiktoktitans/funnelai/issues
- **Vercel Dashboard**: https://vercel.com/tiktok-titans-projects/funnelai
- **Local Dev**: http://localhost:3002

---

**Deployment Status**: ✅ Successfully deployed and running!
**Last Updated**: 2025-09-18