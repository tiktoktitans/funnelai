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

export class ProAIGenerator {
  async generateHighConvertingFunnel(input: WebinarFunnelInput) {
    const systemPrompt = `You are an expert direct response copywriter and conversion specialist who has generated over $50M in revenue from webinar funnels.

    You follow these proven patterns:
    1. Headlines MUST include specific numbers/results (e.g., "$10,000/month", "47% increase", "30 days")
    2. Use the Problem-Agitation-Solution framework
    3. Include urgency and scarcity elements
    4. Layer multiple forms of social proof
    5. Address the top 3-5 objections
    6. Use power words that trigger emotion
    7. Follow the "One Big Idea" principle - focus on ONE transformation

    Your copy should be:
    - Specific and tangible (numbers, timeframes, exact methods)
    - Emotionally compelling (tap into desires and pain points)
    - Credible (include proof elements, disclaimers)
    - Action-oriented (clear next steps)`;

    const userPrompt = `Create a high-converting webinar funnel for:
    Brand: ${input.brandName}
    Offer: ${input.offerName}
    Price: ${input.offerPrice}
    Target Audience: ${input.targetAudience}
    Main Promise: ${input.offerPromise}
    ${input.webinarDate ? `Webinar Date: ${input.webinarDate}` : ''}
    ${input.webinarTime ? `Webinar Time: ${input.webinarTime}` : ''}
    ${input.hostName ? `Host: ${input.hostName}` : ''}

    Generate a complete funnel with:
    1. Landing page copy (hero, problem, solution, proof, CTA)
    2. Thank you page copy
    3. Email sequences (registration, reminder, replay)

    Make it specific to their industry and audience. Include:
    - Specific income/result claims appropriate for their niche
    - 3 major pain points their audience faces
    - 5 transformation bullets
    - 3 testimonial templates
    - Urgency triggers
    - Risk reversal/guarantee

    Format as JSON with clear sections.`;

    try {
      const { text } = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
        maxRetries: 2,
      });

      const specs = JSON.parse(text);

      // Enhance with proven templates
      return this.enhanceWithTemplates(specs, input);
    } catch (error) {
      console.error('Error generating pro funnel:', error);
      throw error;
    }
  }

  private enhanceWithTemplates(specs: any, input: WebinarFunnelInput) {
    // Add proven headline formulas
    const headlineTemplates = [
      `How ${input.targetAudience} Are Making $X-$Y/Month With ${input.offerName}`,
      `The Secret ${input.offerName} System That's Generated $X For Regular People`,
      `WARNING: This ${input.offerName} Training Reveals How To [Result] In Just [Timeframe]`,
      `Discover The $X ${input.offerName} Method [Number] ${input.targetAudience} Are Using To [Result]`,
    ];

    // Add countdown timer data
    specs.urgencyElements = {
      countdown: {
        enabled: true,
        targetDate: input.webinarDate || this.getDefaultWebinarDate(),
        message: 'Training starts in:',
      },
      seatsLeft: {
        enabled: true,
        count: Math.floor(Math.random() * 50) + 20,
        message: 'Only {count} seats remaining!',
      },
      fastActionBonus: {
        enabled: true,
        deadline: '24 hours',
        bonus: 'Fast Action Bonus Bundle',
      },
    };

    // Add video testimonial structure
    specs.socialProof = {
      videoTestimonials: [
        {
          name: 'Success Student 1',
          result: '$10,000 in first 30 days',
          videoUrl: 'placeholder',
          thumbnail: 'placeholder',
        },
        {
          name: 'Success Student 2',
          result: 'Quit their job after 3 months',
          videoUrl: 'placeholder',
          thumbnail: 'placeholder',
        },
      ],
      screenshotGallery: {
        title: 'Real Results From Real Students',
        images: [], // Will be populated with actual screenshots
      },
      statistics: {
        studentsHelped: '4,000+',
        totalRevenue: '$1.2M+',
        averageResult: '$5,000/month',
        successRate: '87%',
      },
    };

    // Add FAQ structure
    specs.faqs = [
      {
        question: `What exactly is ${input.offerName}?`,
        answer: 'Detailed explanation...',
      },
      {
        question: 'How much time do I need to invest?',
        answer: 'Time commitment details...',
      },
      {
        question: 'Do I need any prior experience?',
        answer: 'Experience requirements...',
      },
      {
        question: "What if it doesn't work for me?",
        answer: 'Guarantee and support details...',
      },
    ];

    // Add multi-step form fields
    specs.leadCapture = {
      headline: 'Reserve Your Seat For The Free Training',
      subheadline: "Enter your best email to get instant access",
      fields: [
        { name: 'firstName', label: 'First Name', required: true },
        { name: 'email', label: 'Email Address', required: true },
        { name: 'phone', label: 'Phone Number (for SMS reminders)', required: false },
      ],
      buttonText: 'YES! RESERVE MY SEAT NOW →',
      disclaimer: 'We respect your privacy. Your information is 100% secure.',
    };

    return specs;
  }

  private getDefaultWebinarDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 4); // 4 days from now
    return date.toISOString();
  }

  // Generate the actual component files
  generateComponentFiles(specs: any, input: WebinarFunnelInput): Map<string, string> {
    const files = new Map<string, string>();

    // Enhanced Hero Component with Video
    files.set('components/Hero.tsx', this.generateHeroComponent(specs));

    // Problem/Agitation Component
    files.set('components/ProblemSection.tsx', this.generateProblemComponent(specs));

    // Solution Component with Benefits
    files.set('components/SolutionSection.tsx', this.generateSolutionComponent(specs));

    // Video Testimonials Component
    files.set('components/VideoTestimonials.tsx', this.generateVideoTestimonialsComponent(specs));

    // Screenshot Gallery Component
    files.set('components/ProofGallery.tsx', this.generateProofGalleryComponent(specs));

    // Countdown Timer Component
    files.set('components/CountdownTimer.tsx', this.generateCountdownComponent(specs));

    // Lead Capture Popup Component
    files.set('components/LeadCapturePopup.tsx', this.generateLeadCaptureComponent(specs));

    // FAQ Component with Videos
    files.set('components/FAQSection.tsx', this.generateFAQComponent(specs));

    // Main Landing Page
    files.set('app/page.tsx', this.generateMainPage(specs, input));

    // Thank You Page
    files.set('app/thank-you/page.tsx', this.generateThankYouPage(specs, input));

    return files;
  }

  private generateHeroComponent(specs: any): string {
    return `'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import LeadCapturePopup from './LeadCapturePopup';
import CountdownTimer from './CountdownTimer';

export default function Hero({ content }: any) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-black py-20">
      <CountdownTimer targetDate={content.urgencyElements?.countdown?.targetDate} />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          {content.urgencyElements?.seatsLeft?.enabled && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-block mb-6 px-6 py-2 bg-red-600 text-white rounded-full"
            >
              <span className="font-bold">⚠️ {content.urgencyElements.seatsLeft.message.replace('{count}', content.urgencyElements.seatsLeft.count)}</span>
            </motion.div>
          )}

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">{content.headline.split('|')[0]}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 mt-2">
              {content.headline.split('|')[1]}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {content.subheadline}
          </p>

          {/* Video Thumbnail */}
          <div
            onClick={() => setShowPopup(true)}
            className="relative max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl cursor-pointer group mb-8"
          >
            <img
              src={content.videoThumbnail || '/api/placeholder/1280/720'}
              alt="Training Video"
              className="w-full transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center"
              >
                <div className="w-0 h-0 border-l-[30px] border-l-black border-y-[20px] border-y-transparent ml-2" />
              </motion.div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPopup(true)}
            className="px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all"
          >
            {content.ctaButton} →
          </motion.button>
        </motion.div>
      </div>

      {showPopup && <LeadCapturePopup onClose={() => setShowPopup(false)} content={content.leadCapture} />}
    </section>
  );
}`;
  }

  private generateProblemComponent(specs: any): string {
    return `'use client';

import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

export default function ProblemSection({ content }: any) {
  return (
    <section className="py-20 bg-gradient-to-b from-red-950/20 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-12">
            {content.problemHeadline || "Does This Sound Like You?"}
          </h2>

          <div className="space-y-4">
            {content.painPoints?.map((point: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 bg-gray-900/50 rounded-lg border border-red-500/30"
              >
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <p className="text-gray-300 text-lg">{point}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center text-xl text-orange-500 font-semibold mt-12"
          >
            If any of this resonates, you're in the right place...
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}`;
  }

  private generateSolutionComponent(specs: any): string {
    return `'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';

export default function SolutionSection({ content }: any) {
  return (
    <section className="py-20 bg-gradient-to-b from-green-950/20 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-green-500" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-12">
            {content.solutionHeadline || "The Breakthrough Method That Changes Everything"}
          </h2>

          <div className="space-y-4">
            {content.transformationBullets?.map((bullet: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 bg-gray-900/50 rounded-lg border border-green-500/30"
              >
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-gray-300 text-lg">{bullet}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 p-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl text-white text-center shadow-2xl"
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
    </section>
  );
}`;
  }

  private generateVideoTestimonialsComponent(specs: any): string {
    return `'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useState } from 'react';

export default function VideoTestimonials({ content }: any) {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-12">
            Hear It Straight From Our Students' Mouths
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {content.videoTestimonials?.map((testimonial: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gray-900 rounded-xl overflow-hidden"
              >
                <div className="relative aspect-video bg-gray-800 cursor-pointer group"
                     onClick={() => setPlayingVideo(testimonial.videoUrl)}>
                  {playingVideo === testimonial.videoUrl ? (
                    <iframe
                      src={testimonial.videoUrl}
                      className="w-full h-full"
                      allow="autoplay; fullscreen"
                    />
                  ) : (
                    <>
                      <img
                        src={testimonial.thumbnail || '/api/placeholder/640/360'}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center"
                        >
                          <Play className="w-8 h-8 text-black ml-1" />
                        </motion.div>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-white text-lg">{testimonial.name}</h4>
                  <p className="text-orange-500">{testimonial.result}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">{content.statistics?.studentsHelped}</div>
              <div className="text-gray-400 mt-2">Students Helped</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">{content.statistics?.totalRevenue}</div>
              <div className="text-gray-400 mt-2">Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">{content.statistics?.averageResult}</div>
              <div className="text-gray-400 mt-2">Average Result</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">{content.statistics?.successRate}</div>
              <div className="text-gray-400 mt-2">Success Rate</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}`;
  }

  private generateProofGalleryComponent(specs: any): string {
    return `'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ProofGallery({ content }: any) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-12">
            {content.title || "Real Results From Real People"}
          </h2>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
            {content.screenshots?.map((image: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="break-inside-avoid mb-4"
              >
                <img
                  src={image}
                  alt={\`Proof \${index + 1}\`}
                  className="w-full rounded-lg shadow-2xl cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedImage(image)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Proof"
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
    </section>
  );
}`;
  }

  private generateCountdownComponent(specs: any): string {
    return `'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  targetDate: string;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-0 left-0 right-0 bg-red-600 py-3"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 text-white">
          <span className="font-bold">⏰ TRAINING STARTS IN:</span>
          <div className="flex gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
              <div className="text-xs">DAYS</div>
            </div>
            <div className="text-2xl font-bold">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs">HOURS</div>
            </div>
            <div className="text-2xl font-bold">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-xs">MINS</div>
            </div>
            <div className="text-2xl font-bold">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs">SECS</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}`;
  }

  private generateLeadCaptureComponent(specs: any): string {
    return `'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LeadCapturePopupProps {
  onClose: () => void;
  content: any;
}

export default function LeadCapturePopup({ onClose, content }: LeadCapturePopupProps) {
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
      // Send to webhook
      await fetch('/api/webhook/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Redirect to thank you page
      router.push('/thank-you');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
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
            {content.headline}
          </h2>
          <p className="text-center mt-2 opacity-90">
            {content.subheadline}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {content.fields?.map((field: any) => (
            <div key={field.name}>
              <input
                type={field.type || 'text'}
                name={field.name}
                placeholder={field.label}
                required={field.required}
                value={formData[field.name as keyof typeof formData]}
                onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:border-orange-500"
              />
            </div>
          ))}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-xl rounded-lg shadow-2xl hover:shadow-orange-500/25 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : content.buttonText}
          </motion.button>

          <p className="text-xs text-gray-500 text-center mt-4">
            {content.disclaimer}
          </p>
        </form>
      </motion.div>
    </div>
  );
}`;
  }

  private generateFAQComponent(specs: any): string {
    return `'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function FAQSection({ content }: any) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {content.faqs?.map((faq: any, index: number) => (
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
                  <ChevronDown
                    className={\`w-5 h-5 text-gray-400 transition-transform \${
                      openIndex === index ? 'rotate-180' : ''
                    }\`}
                  />
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}`;
  }

  private generateMainPage(specs: any, input: WebinarFunnelInput): string {
    return `'use client';

import Hero from '@/components/Hero';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import VideoTestimonials from '@/components/VideoTestimonials';
import ProofGallery from '@/components/ProofGallery';
import FAQSection from '@/components/FAQSection';
import { motion } from 'framer-motion';

const pageContent = ${JSON.stringify(specs, null, 2)};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black">
      <Hero content={pageContent} />
      <ProblemSection content={pageContent} />
      <SolutionSection content={pageContent} />
      <VideoTestimonials content={pageContent.socialProof} />
      <ProofGallery content={pageContent.socialProof.screenshotGallery} />
      <FAQSection content={pageContent} />

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready To Transform Your Life?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              This free training won't be available forever. Reserve your spot now before it's too late.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all"
            >
              CLAIM YOUR SPOT NOW →
            </motion.button>
          </motion.div>
        </div>
      </section>

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

  private generateThankYouPage(specs: any, input: WebinarFunnelInput): string {
    return `'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, Users } from 'lucide-react';
import { useEffect } from 'react';

export default function ThankYouPage() {
  useEffect(() => {
    // Track conversion
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'CompleteRegistration');
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950/20 to-black">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />

          <h1 className="text-5xl font-bold text-white mb-4">
            You're Registered!
          </h1>

          <p className="text-2xl text-gray-300 mb-12">
            Check your email for your access details
          </p>

          <div className="bg-gray-900 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Here's What Happens Next:
            </h2>

            <div className="space-y-4 text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-4"
              >
                <span className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </span>
                <div>
                  <h3 className="text-white font-semibold">Check Your Email</h3>
                  <p className="text-gray-400">We've sent your exclusive access link and calendar invite</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4"
              >
                <span className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </span>
                <div>
                  <h3 className="text-white font-semibold">Save The Date</h3>
                  <p className="text-gray-400">Add the training to your calendar so you don't miss it</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-4"
              >
                <span className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </span>
                <div>
                  <h3 className="text-white font-semibold">Show Up Live</h3>
                  <p className="text-gray-400">Attend the training live to get your questions answered</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Webinar Details */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Training Details</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Thursday, Nov 28</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                <span>7:00 PM EST</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                <span>Live on Zoom</span>
              </div>
            </div>
          </div>

          {/* Bonus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 p-8 bg-gray-900 rounded-2xl border border-orange-500/30"
          >
            <h3 className="text-2xl font-bold text-orange-500 mb-4">
              🎁 Your Fast Action Bonus
            </h3>
            <p className="text-gray-300 mb-4">
              Because you registered today, you'll also receive our Quick Start Guide absolutely FREE (normally $97)
            </p>
            <button className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
              Download Quick Start Guide →
            </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}`;
  }
}