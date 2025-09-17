import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@funnelai/database';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const SubmissionSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  honeypot: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const body = await request.json();

    if (body.honeypot) {
      return NextResponse.json({ success: true });
    }

    const validatedData = SubmissionSchema.parse(body);

    const form = await prisma.form.findUnique({
      where: { id: params.formId },
      include: {
        project: true,
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        formId: params.formId,
        projectId: form.projectId,
        data: validatedData as any,
        source: request.headers.get('referer') || 'direct',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    await sendNotificationEmail(form, validatedData);

    if (form.kind === 'OPTIN') {
      await sendConfirmationEmail(validatedData.email, form.project.name);
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
    });
  } catch (error: any) {
    console.error('Form submission error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}

async function sendNotificationEmail(form: any, data: any) {
  try {
    const destination = form.destination || { email: 'demo@funnelai.com' };

    await resend.emails.send({
      from: 'FunnelAI <notifications@funnelai.com>',
      to: destination.email,
      subject: `New ${form.kind} submission - ${form.project.name}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Form Submission</h2>
          <p><strong>Project:</strong> ${form.project.name}</p>
          <p><strong>Form Type:</strong> ${form.kind}</p>
          <hr />
          <h3>Submission Details:</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
          ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
          <hr />
          <p style="color: #666; font-size: 12px;">
            Submission received at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send notification email:', error);
  }
}

async function sendConfirmationEmail(email: string, projectName: string) {
  try {
    await resend.emails.send({
      from: 'FunnelAI <noreply@funnelai.com>',
      to: email,
      subject: `You're registered! - ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">You're In! 🎉</h1>
          </div>

          <div style="padding: 40px 20px;">
            <h2>Thanks for registering!</h2>
            <p>We've saved your spot for the upcoming training. Here's what happens next:</p>

            <ul style="line-height: 1.8;">
              <li>You'll receive a reminder email 24 hours before the event</li>
              <li>Another reminder 1 hour before we go live</li>
              <li>The replay will be available for 48 hours after</li>
            </ul>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="margin-top: 0;">Save the Date</h3>
              <p>Add this event to your calendar so you don't miss it!</p>
              <a href="#" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Add to Calendar
              </a>
            </div>

            <p>See you soon!</p>
            <p><strong>The ${projectName} Team</strong></p>
          </div>

          <div style="padding: 20px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>You received this email because you registered for our webinar.</p>
            <p>© 2024 FunnelAI. All rights reserved.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}