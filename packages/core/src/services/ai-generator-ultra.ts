import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface WebinarFunnelInput {
  brandName: string;
  offerName: string;
  offerPrice: string;
  targetAudience: string;
  offerPromise: string;
  webinarDate?: string;
  webinarTime?: string;
  hostName?: string;
}

export class UltraAIGenerator {
  async generateCustomizedFunnel(input: WebinarFunnelInput) {
    const systemPrompt = `You are the world's best direct response copywriter who has generated over $100M from webinar funnels.

    Your copy follows these EXACT patterns from million-dollar funnels:

    1. HEADLINES must be ultra-specific:
       - Include exact dollar amounts or percentages
       - Specify exact timeframes (30 days, 90 days, etc.)
       - Name the exact method/system
       - Example: "How My Students Are Making $10,000-$20,000/Mo With [METHOD]"

    2. PAIN POINTS must be visceral and specific:
       - Use their exact words and frustrations
       - Reference specific failed attempts
       - Agitate the emotional cost of their problem

    3. TRANSFORMATION must be tangible:
       - Before vs After states clearly defined
       - Specific metrics they'll achieve
       - Timeline for results

    4. SOCIAL PROOF structure:
       - Student name + specific result + timeframe
       - Mix of income results and lifestyle changes
       - Variety of backgrounds to show it works for anyone

    5. URGENCY must be real:
       - Specific date/time for webinar
       - Limited seats (use realistic numbers)
       - Fast action bonuses that expire

    IMPORTANT: Generate ACTUAL customized content based on the input. Do not use placeholders.`;

    const userPrompt = `Generate a complete, customized webinar funnel for:

    Brand: ${input.brandName}
    Offer: ${input.offerName}
    Price Point: ${input.offerPrice}
    Target Audience: ${input.targetAudience}
    Main Promise: ${input.offerPromise}
    ${input.webinarDate ? `Webinar Date: ${input.webinarDate}` : 'Webinar Date: Next Thursday'}
    ${input.webinarTime ? `Webinar Time: ${input.webinarTime}` : 'Webinar Time: 7:00 PM EST'}
    ${input.hostName ? `Host: ${input.hostName}` : `Host: ${input.brandName} Founder`}

    Create SPECIFIC, CUSTOMIZED content including:

    1. HERO SECTION:
       - Main headline with specific income/result claim for THIS niche
       - Subheadline that calls out the target audience and their desire
       - Video thumbnail text overlay
       - CTA button text

    2. PROBLEM SECTION:
       - 5 specific pain points this audience faces
       - Each one should twist the knife emotionally

    3. SOLUTION SECTION:
       - The unique mechanism/method name
       - 5 transformation bullets (what they'll be able to do)
       - Why this is different from what they've tried

    4. PROOF SECTION:
       - 6 detailed testimonials with:
         * Student name (realistic first name + last initial)
         * Specific result achieved (relevant to this niche)
         * Timeframe
         * Background (to show variety)
         * Powerful quote

    5. CTA SECTION:
       - Urgency elements (countdown to webinar)
       - Scarcity (specific number of seats)
       - 3 fast action bonuses

    6. FAQ SECTION:
       - 5 common objections for THIS specific offer
       - Answers that remove friction

    Return as JSON. Be SPECIFIC to their industry. Use power words and emotional triggers.

    Example quality bar:
    - BAD: "Make money online"
    - GOOD: "Generate $5,000-$10,000/month with automated Amazon FBA stores"

    - BAD: "You're struggling with marketing"
    - GOOD: "You're posting 3 times a day on Instagram but still getting less than 100 views while watching competitors blow up overnight"`;

    try {
      const { text } = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.8,
        maxRetries: 2,
      });

      const generatedContent = JSON.parse(text);

      // Ensure we have all required sections
      return this.structureContent(generatedContent, input);
    } catch (error) {
      console.error('Error generating customized funnel:', error);
      // Fallback to industry-specific templates if AI fails
      return this.getFallbackContent(input);
    }
  }

  private structureContent(content: any, input: WebinarFunnelInput) {
    // Structure the AI-generated content into our component format
    return {
      hero: {
        headline: content.hero?.headline || this.generateHeadline(input),
        subheadline: content.hero?.subheadline || this.generateSubheadline(input),
        videoThumbnail: '/api/placeholder/1280/720',
        ctaButton: content.hero?.ctaButton || 'Yes! Reserve My Seat For The Free Training',
        urgencyBanner: content.hero?.urgencyBanner || `⚠️ Only ${Math.floor(Math.random() * 50) + 20} Seats Remaining!`,
      },

      problem: {
        headline: content.problem?.headline || "Does This Sound Familiar?",
        painPoints: content.problem?.painPoints || this.generatePainPoints(input),
      },

      solution: {
        headline: content.solution?.headline || `The ${input.offerName} Method`,
        mechanism: content.solution?.mechanism || input.offerName,
        bullets: content.solution?.bullets || this.generateSolutionBullets(input),
        differentiation: content.solution?.differentiation || "No complicated tech, no huge investment, no prior experience needed",
      },

      proof: {
        headline: content.proof?.headline || "Real People. Real Results.",
        testimonials: content.proof?.testimonials || this.generateTestimonials(input),
        statistics: {
          totalStudents: content.proof?.statistics?.totalStudents || "4,000+",
          totalRevenue: content.proof?.statistics?.totalRevenue || "$2.3M+",
          averageResult: content.proof?.statistics?.averageResult || this.getAverageResult(input),
          successRate: content.proof?.statistics?.successRate || "87%",
        }
      },

      webinarDetails: {
        date: input.webinarDate || this.getNextThursday(),
        time: input.webinarTime || "7:00 PM EST",
        spotsLeft: Math.floor(Math.random() * 50) + 20,
        totalRegistered: Math.floor(Math.random() * 2000) + 1500,
      },

      cta: {
        headline: content.cta?.headline || "Your Transformation Starts Here",
        subheadline: content.cta?.subheadline || "This free training is happening soon and seats are limited",
        urgency: `Registration closes in ${this.getTimeUntilWebinar(input.webinarDate)}`,
        primary: {
          label: "CLAIM YOUR FREE SEAT NOW",
          href: "#register"
        },
        bonuses: content.cta?.bonuses || this.generateBonuses(input),
      },

      faqs: content.faqs || this.generateFAQs(input),

      leadCapture: {
        headline: "Reserve Your Seat For The Free Training",
        subheadline: `Discover How To ${input.offerPromise}`,
        fields: [
          { name: 'firstName', label: 'First Name', required: true, type: 'text' },
          { name: 'email', label: 'Best Email Address', required: true, type: 'email' },
          { name: 'phone', label: 'Phone Number (for SMS reminders)', required: false, type: 'tel' },
        ],
        buttonText: 'YES! RESERVE MY FREE SEAT NOW →',
        disclaimer: 'Your information is 100% secure and will never be shared',
      }
    };
  }

  private generateHeadline(input: WebinarFunnelInput): string {
    // Generate industry-specific headlines
    const templates = [
      `How ${input.targetAudience} Are ${input.offerPromise} With ${input.offerName}`,
      `The Secret ${input.offerName} System That's Helping ${input.targetAudience} ${input.offerPromise}`,
      `Warning: This ${input.offerName} Training Reveals How To ${input.offerPromise}`,
      `Discover How ${input.targetAudience} Are Using ${input.offerName} To ${input.offerPromise}`,
    ];

    return templates[0]; // Use first template as default
  }

  private generateSubheadline(input: WebinarFunnelInput): string {
    return `Join thousands of ${input.targetAudience} who are transforming their results without complicated strategies or huge investments`;
  }

  private generatePainPoints(input: WebinarFunnelInput): string[] {
    // Generate industry-specific pain points based on the target audience
    const basePoints = [
      `You've been trying to ${input.offerPromise.toLowerCase()} but nothing seems to work consistently`,
      `You're watching others in your industry succeed while you're still stuck in the same place`,
      `You've invested in courses and programs before but didn't get the results you were promised`,
      `You're overwhelmed by all the conflicting information and don't know what actually works`,
      `You're working harder than ever but your income isn't reflecting your effort`,
    ];

    return basePoints;
  }

  private generateSolutionBullets(input: WebinarFunnelInput): string[] {
    return [
      `The exact step-by-step ${input.offerName} system to ${input.offerPromise}`,
      `How to get started even if you have zero experience or technical skills`,
      `The secret strategies that top performers use but never share publicly`,
      `How to automate 80% of the process so you can scale without burning out`,
      `The proven templates and scripts that convert cold leads into paying customers`,
    ];
  }

  private generateTestimonials(input: WebinarFunnelInput): any[] {
    // Generate realistic testimonials based on the offer
    const firstNames = ['Sarah', 'Mike', 'Jessica', 'David', 'Amanda', 'Chris'];
    const testimonials = [];

    for (let i = 0; i < 6; i++) {
      testimonials.push({
        name: `${firstNames[i]} ${String.fromCharCode(65 + i)}.`,
        result: this.generateRealisticResult(input, i),
        timeframe: this.getTimeframe(i),
        background: this.getBackground(i),
        quote: this.generateTestimonialQuote(input, i),
        image: '/api/placeholder/400/400',
      });
    }

    return testimonials;
  }

  private generateRealisticResult(input: WebinarFunnelInput, index: number): string {
    // Generate results specific to the offer
    if (input.offerPrice === 'FREE') {
      return `Achieved ${input.offerPromise} in ${this.getTimeframe(index)}`;
    }

    const multiplier = index === 0 ? 10 : index === 1 ? 7 : index === 2 ? 5 : 3;
    const priceNum = parseInt(input.offerPrice.replace(/[^0-9]/g, '')) || 1000;
    const result = priceNum * multiplier;

    return `Generated $${result.toLocaleString()} using ${input.offerName}`;
  }

  private getTimeframe(index: number): string {
    const timeframes = ['30 days', '60 days', '90 days', '4 months', '6 months', 'first year'];
    return timeframes[index] || '90 days';
  }

  private getBackground(index: number): string {
    const backgrounds = [
      'Complete beginner',
      'Stay-at-home parent',
      'Former corporate employee',
      'College student',
      'Small business owner',
      'Freelancer'
    ];
    return backgrounds[index] || 'Entrepreneur';
  }

  private generateTestimonialQuote(input: WebinarFunnelInput, index: number): string {
    const quotes = [
      `I was skeptical at first, but ${input.offerName} completely changed my business. The results speak for themselves!`,
      `This is exactly what I was looking for. Simple, straightforward, and it actually works.`,
      `I've tried everything else, but nothing comes close to the results I got with ${input.offerName}.`,
      `The support and community alone are worth it. But the actual system? Life-changing.`,
      `If you're on the fence, just do it. This is the real deal.`,
      `I wish I had found this sooner. Would have saved me years of trial and error.`,
    ];
    return quotes[index] || quotes[0];
  }

  private generateBonuses(input: WebinarFunnelInput): any[] {
    return [
      {
        title: `Quick Start Guide (Value: $297)`,
        description: `Get results in your first 48 hours with our proven fast-track system`,
      },
      {
        title: `Private Mastermind Access (Value: $497)`,
        description: `Connect with other successful ${input.targetAudience} implementing ${input.offerName}`,
      },
      {
        title: `Done-For-You Templates (Value: $197)`,
        description: `Copy-and-paste templates that have generated millions in revenue`,
      },
    ];
  }

  private generateFAQs(input: WebinarFunnelInput): any[] {
    return [
      {
        question: `What exactly is ${input.offerName}?`,
        answer: `${input.offerName} is a proven system that helps ${input.targetAudience} to ${input.offerPromise}. You'll get step-by-step training, templates, and support.`,
      },
      {
        question: "How much time will I need to invest?",
        answer: "Most students spend 1-2 hours per day initially, then scale back to 30 minutes daily once the system is running.",
      },
      {
        question: "Do I need any prior experience?",
        answer: `No! ${input.offerName} is designed for complete beginners. We'll walk you through everything step by step.`,
      },
      {
        question: "When will I see results?",
        answer: "While results vary, most students see their first results within 30 days of implementing the system.",
      },
      {
        question: "Is there a guarantee?",
        answer: "We offer a 30-day action-based guarantee. If you implement the system and don't see results, we'll work with you until you do.",
      },
    ];
  }

  private getNextThursday(): string {
    const today = new Date();
    const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
    const nextThursday = new Date(today);
    nextThursday.setDate(today.getDate() + daysUntilThursday);
    return nextThursday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  private getTimeUntilWebinar(webinarDate?: string): string {
    if (!webinarDate) {
      return "3 days, 14 hours";
    }

    const target = new Date(webinarDate);
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days} days, ${hours} hours`;
  }

  private getAverageResult(input: WebinarFunnelInput): string {
    // Generate realistic average result based on the offer promise
    if (input.offerPromise.includes('$')) {
      const match = input.offerPromise.match(/\$[\d,]+/);
      if (match) {
        return match[0] + '/month';
      }
    }
    return '$5,000/month';
  }

  private getFallbackContent(input: WebinarFunnelInput) {
    // Fallback content if AI generation fails
    return this.structureContent({}, input);
  }

  // Generate the actual component files with the customized content
  generateComponentFiles(content: any, input: WebinarFunnelInput): Map<string, string> {
    const files = new Map<string, string>();

    // Generate all component files with the ACTUAL customized content
    files.set('components/Hero.tsx', this.generateHeroComponent(content));
    files.set('components/ProblemSection.tsx', this.generateProblemComponent(content));
    files.set('components/SolutionSection.tsx', this.generateSolutionComponent(content));
    files.set('components/ProofSection.tsx', this.generateProofComponent(content));
    files.set('components/CTASection.tsx', this.generateCTAComponent(content));
    files.set('components/FAQSection.tsx', this.generateFAQComponent(content));
    files.set('components/LeadCapturePopup.tsx', this.generateLeadCaptureComponent(content));
    files.set('components/CountdownTimer.tsx', this.generateCountdownComponent(content));
    files.set('app/page.tsx', this.generateMainPage(content, input));
    files.set('app/thank-you/page.tsx', this.generateThankYouPage(content, input));

    return files;
  }

  // Component generation methods (similar to before but with ACTUAL content)
  private generateHeroComponent(content: any): string {
    return `'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import LeadCapturePopup from './LeadCapturePopup';
import CountdownTimer from './CountdownTimer';

const heroContent = ${JSON.stringify(content.hero, null, 2)};
const webinarDetails = ${JSON.stringify(content.webinarDetails, null, 2)};

export default function Hero() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <section className="relative overflow-hidden bg-black py-20">
      {webinarDetails && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white py-2 text-center z-10">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold">
            <span>⚠️ LIVE TRAINING: {webinarDetails.date} at {webinarDetails.time}</span>
            <span className="hidden sm:inline">• Only {webinarDetails.spotsLeft} Seats Left!</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            <span className="text-white block">${content.hero.headline.split('|')[0] || content.hero.headline}</span>
            ${content.hero.headline.includes('|') ? `
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 block mt-2">
              ${content.hero.headline.split('|')[1]}
            </span>` : ''}
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {heroContent.subheadline}
          </p>

          <div
            onClick={() => setShowPopup(true)}
            className="relative max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl cursor-pointer group mb-8"
          >
            <img
              src="/api/placeholder/1280/720"
              alt="Training Video"
              className="w-full"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center"
              >
                <div className="w-0 h-0 border-l-[24px] border-l-black border-y-[16px] border-y-transparent ml-2" />
              </motion.div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPopup(true)}
            className="px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-full shadow-2xl hover:shadow-orange-500/25"
          >
            {heroContent.ctaButton} →
          </motion.button>
        </motion.div>
      </div>

      {showPopup && <LeadCapturePopup onClose={() => setShowPopup(false)} />}
    </section>
  );
}`;
  }

  private generateProblemComponent(content: any): string {
    return `'use client';

import { motion } from 'framer-motion';

const problemContent = ${JSON.stringify(content.problem, null, 2)};

export default function ProblemSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            {problemContent.headline}
          </h2>

          <div className="space-y-4">
            {problemContent.painPoints.map((point: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 bg-gray-800/50 rounded-lg border border-red-500/20"
              >
                <span className="text-red-500 text-2xl">✗</span>
                <p className="text-gray-300 text-lg">{point}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}`;
  }

  private generateSolutionComponent(content: any): string {
    return `'use client';

import { motion } from 'framer-motion';

const solutionContent = ${JSON.stringify(content.solution, null, 2)};

export default function SolutionSection() {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Introducing: {solutionContent.headline}
          </h2>

          <div className="space-y-4 mb-12">
            {solutionContent.bullets.map((bullet: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg border border-green-500/20"
              >
                <span className="text-green-500 text-2xl">✓</span>
                <p className="text-gray-300 text-lg">{bullet}</p>
              </motion.div>
            ))}
          </div>

          <div className="p-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl text-white text-center">
            <p className="text-2xl font-bold">
              This is different because: {solutionContent.differentiation}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}`;
  }

  private generateProofComponent(content: any): string {
    return `'use client';

import { motion } from 'framer-motion';

const proofContent = ${JSON.stringify(content.proof, null, 2)};

export default function ProofSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-white mb-12">
          {proofContent.headline}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {proofContent.testimonials.map((testimonial: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-2xl font-bold text-green-500 mb-2">
                {testimonial.result}
              </p>
              <p className="text-sm text-gray-400 mb-4">in {testimonial.timeframe}</p>
              <p className="text-gray-300 italic mb-4">"{testimonial.quote}"</p>
              <div className="border-t pt-4">
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-gray-400">{testimonial.background}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">{proofContent.statistics.totalStudents}</div>
            <div className="text-gray-400">Students Helped</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">{proofContent.statistics.totalRevenue}</div>
            <div className="text-gray-400">Total Generated</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">{proofContent.statistics.averageResult}</div>
            <div className="text-gray-400">Average Result</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">{proofContent.statistics.successRate}</div>
            <div className="text-gray-400">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}`;
  }

  private generateCTAComponent(content: any): string {
    return `'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import LeadCapturePopup from './LeadCapturePopup';

const ctaContent = ${JSON.stringify(content.cta, null, 2)};

export default function CTASection() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {ctaContent.headline}
          </h2>

          <p className="text-xl text-gray-300 mb-8">
            {ctaContent.subheadline}
          </p>

          <div className="mb-8 p-4 bg-red-600/20 border border-red-600 rounded-lg">
            <p className="text-red-400 font-semibold animate-pulse">
              ⚠️ {ctaContent.urgency}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {ctaContent.bonuses.map((bonus: any, index: number) => (
              <div key={index} className="p-4 bg-gray-800 rounded-lg text-left">
                <h4 className="font-bold text-white">🎁 Bonus #{index + 1}: {bonus.title}</h4>
                <p className="text-gray-400">{bonus.description}</p>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPopup(true)}
            className="px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-full shadow-2xl"
          >
            {ctaContent.primary.label} →
          </motion.button>
        </div>
      </div>

      {showPopup && <LeadCapturePopup onClose={() => setShowPopup(false)} />}
    </section>
  );
}`;
  }

  private generateFAQComponent(content: any): string {
    return `'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const faqContent = ${JSON.stringify(content.faqs, null, 2)};

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqContent.map((faq: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700 transition"
                >
                  <span className="text-white font-semibold">{faq.question}</span>
                  <span className="text-gray-400">{openIndex === index ? '−' : '+'}</span>
                </button>

                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}`;
  }

  private generateLeadCaptureComponent(content: any): string {
    return `'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const leadCaptureContent = ${JSON.stringify(content.leadCapture, null, 2)};

export default function LeadCapturePopup({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/webhook/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      router.push('/thank-you');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-12">
          <h2 className="text-3xl font-bold text-center">
            {leadCaptureContent.headline}
          </h2>
          <p className="text-center mt-2">
            {leadCaptureContent.subheadline}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {leadCaptureContent.fields.map((field: any) => (
            <input
              key={field.name}
              type={field.type}
              name={field.name}
              placeholder={field.label}
              required={field.required}
              value={formData[field.name as keyof typeof formData]}
              onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
              className="w-full px-4 py-4 border rounded-lg text-lg focus:outline-none focus:border-orange-500"
            />
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-xl rounded-lg shadow-2xl hover:shadow-orange-500/25 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : leadCaptureContent.buttonText}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            {leadCaptureContent.disclaimer}
          </p>
        </form>
      </motion.div>
    </div>
  );
}`;
  }

  private generateCountdownComponent(content: any): string {
    return `'use client';

import { useEffect, useState } from 'react';

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-4 justify-center">
      <div className="text-center">
        <div className="text-3xl font-bold text-white">{String(timeLeft.days).padStart(2, '0')}</div>
        <div className="text-xs text-gray-400">DAYS</div>
      </div>
      <div className="text-3xl font-bold text-white">:</div>
      <div className="text-center">
        <div className="text-3xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="text-xs text-gray-400">HOURS</div>
      </div>
      <div className="text-3xl font-bold text-white">:</div>
      <div className="text-center">
        <div className="text-3xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="text-xs text-gray-400">MINS</div>
      </div>
      <div className="text-3xl font-bold text-white">:</div>
      <div className="text-center">
        <div className="text-3xl font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="text-xs text-gray-400">SECS</div>
      </div>
    </div>
  );
}`;
  }

  private generateMainPage(content: any, input: WebinarFunnelInput): string {
    return `'use client';

import Hero from '@/components/Hero';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import ProofSection from '@/components/ProofSection';
import CTASection from '@/components/CTASection';
import FAQSection from '@/components/FAQSection';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <ProofSection />
      <CTASection />
      <FAQSection />

      {/* Income Disclaimer */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <p className="text-xs text-gray-500 text-center max-w-4xl mx-auto">
            Income Disclaimer: The results stated above are extraordinary and not typical. We make no guarantee that you will achieve similar results. Your results will depend on many factors including your background, experience, and work ethic. All business entails risk as well as consistent effort and action.
          </p>
        </div>
      </section>
    </main>
  );
}`;
  }

  private generateThankYouPage(content: any, input: WebinarFunnelInput): string {
    return `'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 max-w-2xl"
      >
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />

        <h1 className="text-5xl font-bold text-white mb-4">
          You're All Set!
        </h1>

        <p className="text-2xl text-gray-300 mb-8">
          Check your email for your exclusive training access link
        </p>

        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">What Happens Next:</h2>
          <ol className="text-left space-y-3">
            <li className="flex items-start gap-3">
              <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
              <span className="text-gray-300">Check your email inbox for your training access link</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
              <span className="text-gray-300">Mark your calendar for the live training</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
              <span className="text-gray-300">Join us live to get your questions answered</span>
            </li>
          </ol>
        </div>

        <p className="text-gray-400">
          See you on the training! 🎉
        </p>
      </motion.div>
    </main>
  );
}`;
  }
}