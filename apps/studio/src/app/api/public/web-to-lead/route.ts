import { NextRequest, NextResponse } from 'next/server';
import { LeadService } from '@funnelai/core/src/services/crm/lead.service';
import { z } from 'zod';
import { prisma } from '@funnelai/database/src';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const WebToLeadSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),

  // UTM parameters
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),

  // Custom fields
  customFields: z.record(z.any()).optional(),

  // Workspace identifier (could be a form ID or workspace slug)
  workspaceId: z.string(),

  // Honeypot field (should be empty)
  website: z.string().optional(),
});

const leadService = new LeadService();

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Rate limiting check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check
    if (body.website && body.website.length > 0) {
      console.log(`[WebToLead] Honeypot triggered from IP: ${ip}`);
      // Return success to not reveal we detected the bot
      return NextResponse.json({ success: true, id: 'bot-trap' });
    }

    const validated = WebToLeadSchema.parse(body);

    // Normalize phone number
    let phoneE164 = undefined;
    if (validated.phone) {
      phoneE164 = normalizePhoneNumber(validated.phone);
    }

    // Get workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        OR: [
          { id: validated.workspaceId },
          { slug: validated.workspaceId },
        ],
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Invalid workspace' },
        { status: 400 }
      );
    }

    // Create lead
    const lead = await leadService.createLead({
      workspaceId: workspace.id,
      email: validated.email,
      phoneE164,
      firstName: validated.firstName,
      lastName: validated.lastName,
      company: validated.company,
      source: validated.utm_source || 'web',
      medium: validated.utm_medium,
      campaign: validated.utm_campaign,
      utmData: {
        utm_source: validated.utm_source,
        utm_medium: validated.utm_medium,
        utm_campaign: validated.utm_campaign,
        utm_term: validated.utm_term,
        utm_content: validated.utm_content,
      },
      tags: ['web-to-lead'],
    });

    // Log activity with IP and user agent
    await prisma.activity.create({
      data: {
        workspaceId: workspace.id,
        leadId: lead.id,
        type: 'system',
        subject: 'Web Form Submission',
        body: {
          action: 'web_form_submission',
          ip,
          userAgent: request.headers.get('user-agent'),
          referer: request.headers.get('referer'),
        },
      },
    });

    // Return success (don't expose internal IDs)
    return NextResponse.json({
      success: true,
      message: 'Thank you for your submission',
    });
  } catch (error: any) {
    console.error('[WebToLead API] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}

// Simple in-memory rate limiting (use Redis in production)
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || limit.resetTime < now) {
    // Reset or initialize
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + 60000, // 1 minute window
    });
    return true;
  }

  if (limit.count >= 5) {
    // Max 5 requests per minute
    return false;
  }

  limit.count++;
  return true;
}

function normalizePhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Add US country code if needed
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // Return as-is if already has country code
  if (phone.startsWith('+')) {
    return phone;
  }

  return `+${digits}`;
}

// OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}