# FunnelAI - AI-Powered Funnel Builder

A web app that lets users generate and deploy complete marketing funnels (VSL pages, webinar stacks, thank-you pages, application/booking, email/SMS sequences) from a short wizard—using Claude to draft the content—and ship them live to Vercel/GitHub with one click.

## 🚀 Features

- **AI-Powered Content Generation**: Claude API generates all funnel content
- **Complete Funnel Stack**: Landing pages, VSL scripts, webinar outlines, email sequences
- **One-Click Deploy**: Push to GitHub and deploy to Vercel instantly
- **Form Management**: Built-in form submissions with email notifications
- **Template System**: Locked, optimized templates for high conversion
- **Live Preview**: Edit content with real-time preview before publishing

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components**: shadcn/ui, Radix UI, Framer Motion
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Queue/Jobs**: BullMQ + Redis (Upstash)
- **Emails**: Resend
- **LLM**: Claude API (Anthropic)
- **Deployment**: Vercel
- **Architecture**: Monorepo with pnpm workspaces

## 📦 Project Structure

\`\`\`
funnelai/
├── apps/
│   └── studio/              # Main Next.js application
│       ├── src/
│       │   ├── app/        # App router pages
│       │   ├── components/ # React components
│       │   ├── lib/        # Utilities
│       │   └── styles/     # Global styles
├── packages/
│   ├── database/           # Prisma schema & client
│   ├── ui/                 # Shared UI components
│   ├── core/               # Business logic & services
│   ├── types/              # TypeScript types & schemas
│   └── templates/          # Funnel templates
└── sites/                  # Generated funnel sites
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL database
- Redis instance
- Anthropic API key
- Resend API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/funnelai.git
cd funnelai
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your credentials
\`\`\`

4. Set up the database:
\`\`\`bash
pnpm db:push
pnpm db:seed # Optional: seed with sample data
\`\`\`

5. Run the development server:
\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🏗 Development

### Available Scripts

- \`pnpm dev\` - Start development servers
- \`pnpm build\` - Build all packages
- \`pnpm lint\` - Run ESLint
- \`pnpm typecheck\` - Run TypeScript type checking
- \`pnpm db:generate\` - Generate Prisma client
- \`pnpm db:push\` - Push schema to database
- \`pnpm db:studio\` - Open Prisma Studio

### Creating a New Package

1. Create a new folder in \`packages/\`
2. Add a \`package.json\` with proper name and exports
3. Add to workspace dependencies where needed

## 🗺 Roadmap

### Phase 1 (MVP) ✅
- [x] Project wizard
- [x] Claude content generation
- [x] Basic editor
- [x] Template system
- [x] Deploy to Vercel
- [x] Form submissions
- [x] Email sequences

### Phase 2
- [ ] User authentication
- [ ] Stripe billing
- [ ] Vercel/GitHub OAuth
- [ ] SMS automation (Twilio)
- [ ] Multiple templates
- [ ] A/B testing
- [ ] Analytics dashboard

### Phase 3
- [ ] Custom domains
- [ ] White-label options
- [ ] Team collaboration
- [ ] Advanced analytics
- [ ] Marketplace for templates

## 🔒 Security

- All sensitive data encrypted at rest
- API keys stored securely
- Input validation with Zod schemas
- SQL injection prevention via Prisma
- XSS protection built-in to React
- CSRF tokens for forms
- Rate limiting on API endpoints

## 📝 API Documentation

### Projects API

#### Create Project
\`\`\`
POST /api/projects
Body: WizardInput
Response: { id: string, slug: string }
\`\`\`

#### Generate Spec
\`\`\`
POST /api/projects/:id/spec/:type
Response: Generated content spec
\`\`\`

#### Build & Deploy
\`\`\`
POST /api/projects/:id/build
Response: { buildId: string, status: string }
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Vercel](https://vercel.com/) for deployment platform
- [Anthropic](https://www.anthropic.com/) for Claude API
- [Supabase](https://supabase.com/) for database hosting