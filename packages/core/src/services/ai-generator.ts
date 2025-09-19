import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface GenerationInput {
  brandName: string;
  brandColors: {
    primary: string;
    secondary?: string;
  };
  offerName: string;
  offerPrice: string;
  offerPromise: string;
  audience: string;
  calendlyUrl?: string;
}

export interface GeneratedContent {
  landingPage: string;
  thankYouPage: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
}

const LANDING_PAGE_PROMPT = `Generate a complete Next.js 14 landing page component for a marketing funnel.

PRODUCT INFO:
- Brand: {brandName}
- Offer: {offerName}
- Price: {offerPrice}
- Promise: {offerPromise}
- Target Audience: {audience}
- Primary Color: {primaryColor}
- Secondary Color: {secondaryColor}

REQUIREMENTS:
1. Use Next.js 14 App Router with 'use client' directive
2. Use Tailwind CSS classes only (no custom CSS)
3. Use the brand colors as CSS variables
4. Include these sections:
   - Hero with headline and CTA
   - Problem/Pain points
   - Solution/Benefits
   - Social proof/Testimonials
   - Offer details
   - Urgency/Scarcity
   - Final CTA
5. Make it mobile responsive
6. Use placeholder images from picsum.photos
7. Include a form that POSTs to /api/submit

Generate ONLY the component code, no explanations:`;

const THANK_YOU_PAGE_PROMPT = `Generate a Next.js 14 thank you page component.

PRODUCT INFO:
- Brand: {brandName}
- Calendly URL: {calendlyUrl}

REQUIREMENTS:
1. Thank the user for signing up
2. Embed Calendly scheduling if URL provided
3. Provide next steps
4. Use brand colors
5. Mobile responsive

Generate ONLY the component code:`;

export class AIGenerator {
  async generateLandingPage(input: GenerationInput): Promise<GeneratedContent> {
    try {
      // Generate landing page
      const landingPrompt = LANDING_PAGE_PROMPT
        .replace('{brandName}', input.brandName)
        .replace('{offerName}', input.offerName)
        .replace('{offerPrice}', input.offerPrice)
        .replace('{offerPromise}', input.offerPromise)
        .replace('{audience}', input.audience)
        .replace('{primaryColor}', input.brandColors.primary)
        .replace('{secondaryColor}', input.brandColors.secondary || input.brandColors.primary);

      const landingResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: landingPrompt
        }]
      });

      const landingPage = landingResponse.content[0].type === 'text'
        ? landingResponse.content[0].text
        : '';

      // Generate thank you page
      const thankYouPrompt = THANK_YOU_PAGE_PROMPT
        .replace('{brandName}', input.brandName)
        .replace('{calendlyUrl}', input.calendlyUrl || 'https://calendly.com/demo');

      const thankYouResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: thankYouPrompt
        }]
      });

      const thankYouPage = thankYouResponse.content[0].type === 'text'
        ? thankYouResponse.content[0].text
        : '';

      return {
        landingPage,
        thankYouPage,
        metadata: {
          title: `${input.offerName} - ${input.brandName}`,
          description: input.offerPromise,
          keywords: [
            input.brandName.toLowerCase(),
            ...input.offerName.toLowerCase().split(' '),
            'marketing funnel',
            'landing page'
          ]
        }
      };
    } catch (error) {
      console.error('AI generation failed:', error);
      throw new Error('Failed to generate content');
    }
  }

  // Generate a complete Next.js project structure
  generateProjectFiles(content: GeneratedContent, input: GenerationInput): Map<string, string> {
    const files = new Map<string, string>();

    // Package.json
    files.set('package.json', JSON.stringify({
      name: input.brandName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        next: '14.0.4',
        react: '18.3.1',
        'react-dom': '18.3.1',
        '@types/node': '20.11.0',
        '@types/react': '18.2.47',
        '@types/react-dom': '18.2.18',
        typescript: '5.3.3',
        tailwindcss: '3.4.0',
        autoprefixer: '10.4.16',
        postcss: '8.4.32'
      }
    }, null, 2));

    // Next.config.js
    files.set('next.config.js', `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['picsum.photos', 'images.unsplash.com'],
  },
}

module.exports = nextConfig`);

    // Tailwind config
    files.set('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '${input.brandColors.primary}',
        secondary: '${input.brandColors.secondary || input.brandColors.primary}',
      },
    },
  },
  plugins: [],
}`);

    // PostCSS config
    files.set('postcss.config.js', `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`);

    // Global CSS
    files.set('app/globals.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: ${input.brandColors.primary};
  --secondary: ${input.brandColors.secondary || input.brandColors.primary};
}`);

    // Layout
    files.set('app/layout.tsx', `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${content.metadata.title}',
  description: '${content.metadata.description}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`);

    // Landing page
    files.set('app/page.tsx', content.landingPage);

    // Thank you page
    files.set('app/thank-you/page.tsx', content.thankYouPage);

    // API submit endpoint
    files.set('app/api/submit/route.ts', `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Here you would normally save to database or send email
    console.log('Form submission:', data);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}`);

    // TypeScript config
    files.set('tsconfig.json', JSON.stringify({
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: {
          '@/*': ['./*']
        }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules']
    }, null, 2));

    // .gitignore
    files.set('.gitignore', `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts`);

    return files;
  }
}