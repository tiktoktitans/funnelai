import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { GenerationInput } from './ai-generator-vercel';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// High-converting webinar funnel prompt template
const WEBINAR_SPEC_PROMPT = `You are an expert direct response copywriter specializing in high-converting webinar funnels.
Create compelling copy for a webinar landing page using proven psychological triggers and conversion principles.

BRAND INFO:
- Brand: {brandName}
- Offer: {offerName}
- Price: {offerPrice}
- Promise: {offerPromise}
- Audience: {audience}
- Primary Color: {primaryColor}

Generate a JSON spec with this EXACT structure (no markdown, just JSON):

{
  "copy": {
    "hero": {
      "eyebrow": "FREE LIVE TRAINING - LIMITED SEATS",
      "headline": "[Write a compelling headline that promises a specific transformation or result in a specific timeframe]",
      "subheadline": "[Expand on the promise with urgency and specificity - mention what they'll discover]",
      "cta": {
        "label": "Reserve My Free Seat Now",
        "href": "#register"
      }
    },
    "problem": {
      "headline": "Does This Sound Like You?",
      "bullets": [
        "[Pain point 1 - be specific and emotional]",
        "[Pain point 2 - agitate a fear or frustration]",
        "[Pain point 3 - highlight what they're missing out on]",
        "[Pain point 4 - mention failed attempts]",
        "[Pain point 5 - time/money being wasted]"
      ]
    },
    "solution": {
      "headline": "The Breakthrough Method That Changes Everything",
      "bullets": [
        "[Benefit 1 - specific result they'll achieve]",
        "[Benefit 2 - time/effort saved]",
        "[Benefit 3 - competitive advantage gained]",
        "[Benefit 4 - mistakes they'll avoid]",
        "[Benefit 5 - transformation they'll experience]"
      ]
    },
    "proof": {
      "headline": "Real People. Real Results.",
      "testimonials": [
        {
          "name": "[Generate realistic name]",
          "role": "[Their profession/role]",
          "quote": "[Specific result achieved with numbers]",
          "metric": "$[X]K",
          "timeframe": "in [X] days"
        },
        {
          "name": "[Generate realistic name]",
          "role": "[Their profession/role]",
          "quote": "[Transformation story with specifics]",
          "metric": "[X]x ROI",
          "timeframe": "in [X] weeks"
        },
        {
          "name": "[Generate realistic name]",
          "role": "[Their profession/role]",
          "quote": "[How this solved their biggest problem]",
          "metric": "[X] clients",
          "timeframe": "in [X] months"
        }
      ]
    },
    "cta": {
      "headline": "Your Transformation Starts Here",
      "sub": "This free training is happening soon and seats are limited",
      "urgency": "Only 47 spots remaining",
      "primary": {
        "label": "Yes! Reserve My Seat",
        "href": "#register"
      }
    },
    "webinarDetails": {
      "date": "Tomorrow",
      "time": "2:00 PM EST",
      "duration": "60 minutes",
      "spotsLeft": 47,
      "totalRegistered": 2847
    }
  },
  "metadata": {
    "title": "{offerName} - Free Training | {brandName}",
    "description": "{offerPromise}",
    "keywords": ["webinar", "{brandName}", "{offerName}"]
  }
}

COPYWRITING RULES:
1. Use power words and emotional triggers
2. Create urgency without being fake
3. Be specific with numbers and timeframes
4. Focus on transformation, not features
5. Address objections preemptively
6. Use social proof effectively
7. Write at 8th grade reading level
8. Front-load benefits in headlines

Generate the JSON now:`;

const THANK_YOU_SPEC_PROMPT = `Generate a JSON spec for a webinar thank you page.

BRAND: {brandName}
CALENDLY: {calendlyUrl}

Create this EXACT JSON structure:

{
  "copy": {
    "headline": "You're In! Your Seat Is Reserved",
    "subheadline": "Check your email for your exclusive access link",
    "steps": [
      "Check your email inbox now",
      "Add [event@domain.com] to your contacts",
      "Mark your calendar for [date/time]",
      "Join 5 minutes early to secure your spot"
    ],
    "bonus": {
      "headline": "Your Fast Action Bonus",
      "description": "Because you registered today, you'll also receive:",
      "items": [
        "[Bonus 1 - valuable resource]",
        "[Bonus 2 - exclusive access]",
        "[Bonus 3 - time-sensitive offer]"
      ]
    },
    "calendar": {
      "headline": "Want to guarantee we can help you?",
      "description": "Book a free strategy session now while spots are available",
      "calendlyUrl": "{calendlyUrl}"
    }
  }
}

Generate the JSON:`;

export class AdvancedAIGenerator {
  async generateWebinarContent(input: GenerationInput) {
    try {
      // Generate landing page spec
      const landingPrompt = WEBINAR_SPEC_PROMPT
        .replace(/{brandName}/g, input.brandName)
        .replace(/{offerName}/g, input.offerName)
        .replace(/{offerPrice}/g, input.offerPrice)
        .replace(/{offerPromise}/g, input.offerPromise)
        .replace(/{audience}/g, input.audience)
        .replace(/{primaryColor}/g, input.brandColors.primary);

      console.log('Generating high-converting webinar copy...');

      const landingResponse = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        prompt: landingPrompt,
        maxTokens: 3000,
        temperature: 0.8, // Higher creativity for copy
      });

      // Parse the JSON response
      let landingSpec;
      try {
        // Clean the response in case it has markdown
        const cleanJson = landingResponse.text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        landingSpec = JSON.parse(cleanJson);
      } catch (e) {
        console.error('Failed to parse landing spec:', e);
        throw new Error('AI generated invalid JSON');
      }

      // Generate thank you page spec
      const thankYouPrompt = THANK_YOU_SPEC_PROMPT
        .replace(/{brandName}/g, input.brandName)
        .replace(/{calendlyUrl}/g, input.calendlyUrl || 'https://calendly.com/demo');

      const thankYouResponse = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        prompt: thankYouPrompt,
        maxTokens: 1500,
        temperature: 0.7,
      });

      let thankYouSpec;
      try {
        const cleanJson = thankYouResponse.text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        thankYouSpec = JSON.parse(cleanJson);
      } catch (e) {
        console.error('Failed to parse thank you spec:', e);
        // Use fallback
        thankYouSpec = {
          copy: {
            headline: "You're Registered!",
            subheadline: "Check your email for details"
          }
        };
      }

      return {
        landingSpec,
        thankYouSpec,
        metadata: landingSpec.metadata
      };

    } catch (error) {
      console.error('Advanced generation failed:', error);
      throw error;
    }
  }

  // Generate complete project files using templates
  generateProjectFiles(specs: any, input: GenerationInput): Map<string, string> {
    const files = new Map<string, string>();

    // Package.json with required dependencies
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
        'framer-motion': '^10.16.4',
        'lucide-react': '^0.292.0',
        '@types/node': '20.11.0',
        '@types/react': '18.2.47',
        '@types/react-dom': '18.2.18',
        typescript: '5.3.3',
        tailwindcss: '3.4.0',
        autoprefixer: '10.4.16',
        postcss: '8.4.32'
      }
    }, null, 2));

    // Copy component files from templates
    const components = ['Hero', 'Problem', 'Solution', 'Proof', 'CTA'];

    // We'll need to read these from the template directory
    // For now, I'll include them inline

    // Hero component
    files.set('components/Hero.tsx', `import { motion } from 'framer-motion';
import { Calendar, Users, Clock, AlertCircle } from 'lucide-react';

export function Hero({ eyebrow, headline, subheadline, cta, webinarDetails }: any) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="absolute top-4 left-0 right-0 bg-red-600 text-white py-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-semibold">LIVE TRAINING STARTING SOON - Only {webinarDetails?.spotsLeft || 47} Seats Left!</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          {eyebrow && (
            <span className="inline-block px-4 py-1 mb-6 text-sm font-bold text-orange-600 bg-orange-100 rounded-full animate-pulse">
              {eyebrow}
            </span>
          )}

          <h1 className="mb-6 text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
            {headline}
          </h1>

          <p className="mb-8 text-xl md:text-2xl text-gray-600">
            {subheadline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={cta.href}
              className="inline-flex items-center justify-center px-8 py-5 text-xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-lg shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1"
            >
              {cta.label}
              <span className="ml-2">→</span>
            </motion.a>
          </div>

          {webinarDetails && (
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="font-semibold">{webinarDetails.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-semibold">{webinarDetails.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                <span className="font-semibold">{webinarDetails.totalRegistered} Already Registered</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}`);

    // Problem component
    files.set('components/Problem.tsx', `import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

export function Problem({ headline, bullets }: any) {
  return (
    <section className="py-20 bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-12 text-4xl md:text-5xl font-bold text-center text-gray-900">
              {headline}
            </h2>

            <div className="space-y-4">
              {bullets?.map((bullet: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-md border-l-4 border-red-500"
                >
                  <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700 text-lg">
                    {bullet}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center text-xl font-semibold text-gray-800"
            >
              If any of this resonates, you're in the right place...
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}`);

    // Solution component
    files.set('components/Solution.tsx', `import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';

export function Solution({ headline, bullets }: any) {
  return (
    <section className="py-20 bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-8 w-8 text-green-600" />
            </div>

            <h2 className="mb-12 text-4xl md:text-5xl font-bold text-center text-gray-900">
              {headline}
            </h2>

            <div className="space-y-4">
              {bullets?.map((bullet: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4 p-5 bg-white rounded-lg shadow-lg border border-green-100 hover:shadow-xl transition-shadow"
                >
                  <CheckCircle className="h-7 w-7 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700 text-lg">
                    <strong>{bullet.split('-')[0]}</strong>
                    {bullet.includes('-') ? ' - ' + bullet.split('-').slice(1).join('-') : ''}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 p-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white text-center shadow-xl"
            >
              <p className="text-2xl font-bold">
                All of this will be revealed in the FREE training
              </p>
              <p className="mt-2 text-lg opacity-90">
                No fluff. No theory. Just proven strategies that work.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}`);

    // Proof component
    files.set('components/Proof.tsx', `import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';

export function Proof({ headline, testimonials }: any) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl"
        >
          <h2 className="mb-12 text-4xl md:text-5xl font-bold text-center text-gray-900">
            {headline}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials?.map((testimonial: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-4 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-bold text-2xl">{testimonial.metric}</span>
                  <span className="text-sm">{testimonial.timeframe}</span>
                </div>

                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>

                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center text-lg text-gray-600"
          >
            <strong>These results are not typical</strong> - but they show what's possible when you apply what you'll learn
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}`);

    // CTA component
    files.set('components/CTA.tsx', `import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

export function CTA({ headline, sub, urgency, primary }: any) {
  return (
    <section className="py-20 bg-gradient-to-b from-orange-600 to-red-600">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="mb-6 text-4xl md:text-5xl font-bold text-white">
            {headline}
          </h2>

          <p className="mb-8 text-xl text-white/90">
            {sub}
          </p>

          {urgency && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <AlertTriangle className="h-5 w-5 text-yellow-300" />
              <span className="text-yellow-300 font-bold text-lg animate-pulse">
                {urgency}
              </span>
            </div>
          )}

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={primary?.href || '#register'}
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-orange-600 bg-white rounded-lg shadow-2xl hover:bg-gray-100 transition-all transform hover:-translate-y-1"
          >
            {primary?.label || 'Reserve My Seat Now'}
            <span className="ml-2">→</span>
          </motion.a>

          <div className="mt-8 flex items-center justify-center gap-2 text-white/80">
            <Clock className="h-4 w-4" />
            <span>Registration closes when the training starts</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}`);

    // Main layout
    files.set('app/layout.tsx', `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${specs.metadata?.title || input.offerName}',
  description: '${specs.metadata?.description || input.offerPromise}',
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
    files.set('app/page.tsx', `'use client';
import { Hero } from '../components/Hero';
import { Problem } from '../components/Problem';
import { Solution } from '../components/Solution';
import { Proof } from '../components/Proof';
import { CTA } from '../components/CTA';
import spec from '../specs/landing.json';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Hero {...spec.copy.hero} webinarDetails={spec.copy.webinarDetails} />
      <Problem {...spec.copy.problem} />
      <Solution {...spec.copy.solution} />
      <Proof {...spec.copy.proof} />
      <CTA {...spec.copy.cta} />

      {/* Registration Form */}
      <section id="register" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 max-w-md">
          <h3 className="text-2xl font-bold text-center mb-8">
            Reserve Your Free Seat Now
          </h3>
          <form className="space-y-4" action="/api/register" method="POST">
            <input
              type="text"
              name="name"
              placeholder="Your Full Name"
              required
              className="w-full px-4 py-3 rounded-lg border"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Best Email"
              required
              className="w-full px-4 py-3 rounded-lg border"
            />
            <button
              type="submit"
              className="w-full px-4 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700"
            >
              Yes! Reserve My Seat →
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}`);

    // Thank you page
    files.set('app/thank-you/page.tsx', `'use client';
import { CheckCircle } from 'lucide-react';
import spec from '../specs/thankyou.json';

export default function ThankYouPage() {
  const { copy } = spec;

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-20">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />

        <h1 className="text-5xl font-bold mb-4">{copy.headline}</h1>
        <p className="text-xl text-gray-600 mb-12">{copy.subheadline}</p>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Next Steps:</h2>
          <ol className="text-left space-y-3">
            {copy.steps?.map((step: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="text-lg">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {copy.bonus && (
          <div className="bg-orange-50 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">{copy.bonus.headline}</h2>
            <p className="text-lg mb-4">{copy.bonus.description}</p>
            <ul className="space-y-2">
              {copy.bonus.items?.map((item: string, i: number) => (
                <li key={i} className="text-lg">✓ {item}</li>
              ))}
            </ul>
          </div>
        )}

        {copy.calendar?.calendlyUrl && (
          <div className="bg-gray-100 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">{copy.calendar.headline}</h2>
            <p className="text-lg mb-6">{copy.calendar.description}</p>
            <a
              href={copy.calendar.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              Schedule Your Call →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}`);

    // Store the specs as JSON files
    files.set('specs/landing.json', JSON.stringify(specs.landingSpec, null, 2));
    files.set('specs/thankyou.json', JSON.stringify(specs.thankYouSpec, null, 2));

    // Add all the config files
    files.set('tailwind.config.js', `module.exports = {
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
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}`);

    files.set('postcss.config.js', `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`);

    files.set('app/globals.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: ${input.brandColors.primary};
  --secondary: ${input.brandColors.secondary || input.brandColors.primary};
}

html {
  scroll-behavior: smooth;
}`);

    files.set('next.config.js', `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['picsum.photos', 'images.unsplash.com'],
  },
}

module.exports = nextConfig`);

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

    return files;
  }
}