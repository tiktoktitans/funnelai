# Deploy FunnelAI to Vercel

## Quick Deploy

1. **Link to Vercel Project** (if not already linked):
```bash
vercel link
```

2. **Deploy to Production**:
```bash
vercel --prod
```

## Manual Setup via Vercel Dashboard

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import the GitHub repository: `tiktoktitans/funnelai`
3. Configure the following:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/studio`
   - **Build Command**: `pnpm turbo build --filter=@funnelai/studio`
   - **Install Command**: `pnpm install`

4. Add Environment Variables:
   - `DATABASE_URL` - PostgreSQL connection string from Supabase
   - `DIRECT_URL` - Direct connection string from Supabase
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
   - `UPSTASH_REDIS_URL` - Redis URL (or use local Redis)
   - `ANTHROPIC_API_KEY` - Claude API key
   - `RESEND_API_KEY` - Email service API key
   - `NEXT_PUBLIC_APP_URL` - Production URL (e.g., https://funnelai.vercel.app)

## Getting Deploy Hook URL

After deployment, get your deploy hook:
1. Go to Project Settings → Git
2. Find "Deploy Hooks" section
3. Create a new deploy hook
4. Copy the URL and update `.env.local`:
   ```
   VERCEL_DEPLOY_HOOK_URL=<your-hook-url>
   ```

## Testing the Deployment Pipeline

Once deployed, you can test the full pipeline:

1. Create a new project in FunnelAI Studio
2. Generate content with AI
3. Edit and customize
4. Click "Build & Deploy"
5. Monitor build logs
6. Get your live Vercel URL!

## GitHub Repository

Your code is now at: https://github.com/tiktoktitans/funnelai

## Local Development

Continue developing locally on port 3002:
```bash
pnpm dev
```

Visit: http://localhost:3002