import { EmailProvider, SendResult } from '../types';
import { Resend } from 'resend';
import { prisma } from '@funnelai/database/src';

export class ResendEmailProvider implements EmailProvider {
  private client: Resend;

  constructor(config: { apiKey: string }) {
    this.client = new Resend(config.apiKey);
  }

  async send(args: {
    to: string;
    from: string;
    subject: string;
    html?: string;
    text?: string;
    eventId: string;
    workspaceId: string;
    replyTo?: string;
  }): Promise<SendResult> {
    try {
      // Check email consent
      const contact = await prisma.contact.findFirst({
        where: {
          workspaceId: args.workspaceId,
          email: args.to,
        },
      });

      if (contact && !contact.consentEmail) {
        return {
          providerId: '',
          status: 'failed',
          error: 'Contact has opted out of email',
        };
      }

      // Add unsubscribe link
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?c=${contact?.id}&w=${args.workspaceId}`;
      const htmlWithUnsub = args.html
        ? `${args.html}<br><br><hr><p style="font-size: 12px; color: #666;">
           <a href="${unsubscribeUrl}">Unsubscribe</a> |
           Powered by InfoOS CRM</p>`
        : undefined;

      // Send email
      const result = await this.client.emails.send({
        from: args.from,
        to: args.to,
        subject: args.subject,
        html: htmlWithUnsub || '',
        text: args.text,
        reply_to: args.replyTo || args.from,
        headers: {
          'X-Event-ID': args.eventId,
          'X-Workspace-ID': args.workspaceId,
        },
      });

      return {
        providerId: result.id || '',
        status: 'sent',
      };
    } catch (error: any) {
      console.error('[ResendEmailProvider] Send error:', error);
      return {
        providerId: '',
        status: 'failed',
        error: error.message || 'Failed to send email',
      };
    }
  }

  handleBounce(data: any): {
    email: string;
    messageId: string;
    type: 'hard' | 'soft';
  } {
    return {
      email: data.email,
      messageId: data.email_id,
      type: data.bounce_type === 'hard' ? 'hard' : 'soft',
    };
  }

  handleOpen(data: any): {
    messageId: string;
    timestamp: Date;
  } {
    return {
      messageId: data.email_id,
      timestamp: new Date(data.created_at),
    };
  }

  handleClick(data: any): {
    messageId: string;
    url: string;
    timestamp: Date;
  } {
    return {
      messageId: data.email_id,
      url: data.link,
      timestamp: new Date(data.created_at),
    };
  }

  async verifyDomain(domain: string): Promise<{
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
    instructions?: string[];
  }> {
    // Resend handles domain verification differently
    return {
      spf: false,
      dkim: false,
      dmarc: false,
      instructions: [
        `Add domain ${domain} to Resend dashboard`,
        `Resend will provide DNS records to add`,
      ],
    };
  }
}