import { z } from 'zod';

export const WizardInputSchema = z.object({
  brandName: z.string().min(1).max(100),
  brandColors: z.object({
    primary: z.string().regex(/^#[0-9A-F]{6}$/i),
    secondary: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  }),
  offerName: z.string().min(1).max(200),
  offerPrice: z.string().min(1).max(50),
  offerPromise: z.string().min(1).max(500),
  audience: z.string().min(1).max(500),
  calendlyUrl: z.string().url().optional(),
  ctaLink: z.string().url().optional(),
});

export type WizardInput = z.infer<typeof WizardInputSchema>;

export const HeroPropsSchema = z.object({
  eyebrow: z.string().optional(),
  headline: z.string(),
  subheadline: z.string(),
  cta: z.object({
    label: z.string(),
    href: z.string(),
  }),
  proofLogos: z.array(z.string()).optional(),
});

export type HeroProps = z.infer<typeof HeroPropsSchema>;

export const TrustPropsSchema = z.object({
  logos: z.array(z.string()),
});

export type TrustProps = z.infer<typeof TrustPropsSchema>;

export const ProblemPropsSchema = z.object({
  headline: z.string(),
  bullets: z.array(z.string()),
});

export type ProblemProps = z.infer<typeof ProblemPropsSchema>;

export const SolutionPropsSchema = z.object({
  headline: z.string(),
  bullets: z.array(z.string()),
});

export type SolutionProps = z.infer<typeof SolutionPropsSchema>;

export const ProofPropsSchema = z.object({
  headline: z.string(),
  caseStudies: z.array(z.object({
    title: z.string(),
    metric: z.string(),
    line: z.string(),
  })),
});

export type ProofProps = z.infer<typeof ProofPropsSchema>;

export const CTAPropsSchema = z.object({
  headline: z.string(),
  sub: z.string(),
  primary: z.object({
    label: z.string(),
    href: z.string(),
  }),
  secondary: z.object({
    label: z.string(),
    href: z.string(),
  }).optional(),
});

export type CTAProps = z.infer<typeof CTAPropsSchema>;

export const FAQPropsSchema = z.object({
  items: z.array(z.object({
    q: z.string(),
    a: z.string(),
  })),
});

export type FAQProps = z.infer<typeof FAQPropsSchema>;

export const LandingSpecSchema = z.object({
  copy: z.object({
    hero: HeroPropsSchema,
    problem: ProblemPropsSchema,
    solution: SolutionPropsSchema,
    proof: ProofPropsSchema,
    cta: CTAPropsSchema,
    faq: FAQPropsSchema.optional(),
  }),
  structure: z.object({
    layout: z.string(),
    sections: z.array(z.object({
      type: z.string(),
      propsRef: z.string(),
    })),
  }),
});

export type LandingSpec = z.infer<typeof LandingSpecSchema>;

export const VSLSpecSchema = z.object({
  vsl: z.object({
    hook: z.string(),
    problem: z.string(),
    story: z.string(),
    proof: z.string(),
    demo: z.string(),
    offer: z.string(),
    cta: z.string(),
    lengthMinutes: z.number(),
  }),
});

export type VSLSpec = z.infer<typeof VSLSpecSchema>;

export const WebinarSpecSchema = z.object({
  webinar: z.object({
    title: z.string(),
    slides: z.array(z.object({
      h: z.string(),
      bullets: z.array(z.string()),
    })),
    pitchStack: z.array(z.object({
      h: z.string(),
      bullets: z.array(z.string()),
    })),
  }),
});

export type WebinarSpec = z.infer<typeof WebinarSpecSchema>;

export const EmailSpecSchema = z.object({
  emails: z.array(z.object({
    slug: z.string(),
    subject: z.string(),
    preview: z.string(),
    bodyMd: z.string(),
    sendOffsetHours: z.number(),
  })),
});

export type EmailSpec = z.infer<typeof EmailSpecSchema>;

export interface Section {
  type: string;
  propsRef: string;
}

export interface BuildConfig {
  buildId?: string;
  projectId: string;
  projectSlug: string;
  specs: Record<string, any>;
  integrations: Record<string, any>;
  templateKey: string;
  templateVersion: string;
  brandColors?: any;
}

export interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
  buildId?: string;
  logs?: string[];
}