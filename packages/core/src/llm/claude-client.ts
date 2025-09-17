import Anthropic from '@anthropic-ai/sdk';
import {
  WizardInput,
  LandingSpec,
  VSLSpec,
  WebinarSpec,
  EmailSpec,
  LandingSpecSchema,
  VSLSpecSchema,
  WebinarSpecSchema,
  EmailSpecSchema
} from '@funnelai/types';

export class ClaudeClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
    });
  }

  async generateLandingSpec(input: WizardInput): Promise<LandingSpec> {
    const prompt = `You are a world-class copywriter specializing in high-converting sales funnels.

Generate compelling copy for a landing page based on this information:
- Brand: ${input.brandName}
- Offer: ${input.offerName} (${input.offerPrice})
- Promise: ${input.offerPromise}
- Audience: ${input.audience}
- CTA Link: ${input.calendlyUrl || input.ctaLink || 'https://calendly.com/demo'}

Create a JSON response with this exact structure:
{
  "copy": {
    "hero": {
      "eyebrow": "WEBINAR" or similar,
      "headline": "Compelling headline that captures attention",
      "subheadline": "Supporting text that expands on the promise",
      "cta": {"label": "Reserve Your Spot", "href": "[calendly_url]"},
      "proofLogos": ["logo1.svg", "logo2.svg"]
    },
    "problem": {
      "headline": "The Real Problem...",
      "bullets": ["Pain point 1", "Pain point 2", "Pain point 3"]
    },
    "solution": {
      "headline": "Here's What You'll Discover",
      "bullets": ["Benefit 1", "Benefit 2", "Benefit 3"]
    },
    "proof": {
      "headline": "Real Results From Real People",
      "caseStudies": [
        {"title": "Client Name", "metric": "$X Revenue", "line": "in Y days"},
        {"title": "Client Name", "metric": "X% Increase", "line": "in Y timeframe"}
      ]
    },
    "cta": {
      "headline": "Ready to Transform Your [Result]?",
      "sub": "Limited spots available",
      "primary": {"label": "Get Instant Access", "href": "[calendly_url]"}
    }
  },
  "structure": {
    "layout": "WebinarLanding",
    "sections": [
      {"type": "Hero", "propsRef": "copy.hero"},
      {"type": "Problem", "propsRef": "copy.problem"},
      {"type": "Solution", "propsRef": "copy.solution"},
      {"type": "Proof", "propsRef": "copy.proof"},
      {"type": "CTA", "propsRef": "copy.cta"}
    ]
  }
}

Make the copy persuasive, benefit-focused, and specific to the target audience.`;

    const response = await this.client.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: 'You are a expert copywriter. Respond only with valid JSON, no markdown or explanations.',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }

    const json = JSON.parse(content.text);
    return LandingSpecSchema.parse(json);
  }

  async generateVSLSpec(input: WizardInput): Promise<VSLSpec> {
    const prompt = `Generate a VSL (Video Sales Letter) script for:
- Offer: ${input.offerName} (${input.offerPrice})
- Promise: ${input.offerPromise}
- Audience: ${input.audience}

Create a 7-9 minute VSL script with this structure:
{
  "vsl": {
    "hook": "Attention-grabbing opening that calls out the audience",
    "problem": "Agitate the pain points they're experiencing",
    "story": "Your discovery story or transformation",
    "proof": "Results and testimonials",
    "demo": "Show how the solution works",
    "offer": "Present the offer and value stack",
    "cta": "Strong call to action with urgency",
    "lengthMinutes": 8
  }
}`;

    const response = await this.client.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: 'You are a VSL script expert. Respond only with valid JSON.',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }

    const json = JSON.parse(content.text);
    return VSLSpecSchema.parse(json);
  }

  async generateWebinarSpec(input: WizardInput): Promise<WebinarSpec> {
    const prompt = `Create a webinar presentation outline for:
- Topic: ${input.offerName}
- Promise: ${input.offerPromise}
- Audience: ${input.audience}

Generate a 45-60 minute webinar structure:
{
  "webinar": {
    "title": "Webinar title",
    "slides": [
      {"h": "Welcome & Introduction", "bullets": ["Who I am", "What we'll cover"]},
      {"h": "The Problem", "bullets": ["Current struggles", "Why it matters"]},
      {"h": "The Solution", "bullets": ["Method overview", "Key principles"]},
      {"h": "Case Study #1", "bullets": ["Background", "Implementation", "Results"]},
      {"h": "Implementation Steps", "bullets": ["Step 1", "Step 2", "Step 3"]},
      {"h": "Q&A", "bullets": ["Common questions", "Clarifications"]}
    ],
    "pitchStack": [
      {"h": "Special Offer", "bullets": ["What's included", "Value breakdown"]},
      {"h": "Bonuses", "bullets": ["Bonus 1", "Bonus 2", "Bonus 3"]},
      {"h": "Guarantee", "bullets": ["Risk reversal", "Confidence in results"]},
      {"h": "Urgency", "bullets": ["Limited time", "Special pricing"]}
    ]
  }
}`;

    const response = await this.client.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: 'You are a webinar script expert. Respond only with valid JSON.',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }

    const json = JSON.parse(content.text);
    return WebinarSpecSchema.parse(json);
  }

  async generateEmailSpec(input: WizardInput): Promise<EmailSpec> {
    const prompt = `Create a 7-email sequence for:
- Offer: ${input.offerName}
- Promise: ${input.offerPromise}
- Audience: ${input.audience}

Generate emails with this structure:
{
  "emails": [
    {
      "slug": "confirm",
      "subject": "You're registered! (important details inside)",
      "preview": "Save your spot + special bonus",
      "bodyMd": "Email body in markdown...",
      "sendOffsetHours": 0
    },
    {
      "slug": "reminder-24h",
      "subject": "Tomorrow: [Event Name]",
      "preview": "Don't miss this",
      "bodyMd": "Email body...",
      "sendOffsetHours": -24
    },
    {
      "slug": "reminder-1h",
      "subject": "Starting in 1 hour",
      "preview": "Join link inside",
      "bodyMd": "Email body...",
      "sendOffsetHours": -1
    },
    {
      "slug": "replay",
      "subject": "Recording available (24 hours only)",
      "preview": "Watch the replay",
      "bodyMd": "Email body...",
      "sendOffsetHours": 2
    },
    {
      "slug": "testimonial",
      "subject": "Sarah made $10k in 30 days",
      "preview": "See how she did it",
      "bodyMd": "Email body...",
      "sendOffsetHours": 26
    },
    {
      "slug": "faq",
      "subject": "Your questions answered",
      "preview": "Plus special update",
      "bodyMd": "Email body...",
      "sendOffsetHours": 50
    },
    {
      "slug": "last-chance",
      "subject": "Final hours (closing tonight)",
      "preview": "Last chance to join",
      "bodyMd": "Email body...",
      "sendOffsetHours": 70
    }
  ]
}`;

    const response = await this.client.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 3000,
      temperature: 0.7,
      system: 'You are an email marketing expert. Respond only with valid JSON.',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }

    const json = JSON.parse(content.text);
    return EmailSpecSchema.parse(json);
  }
}