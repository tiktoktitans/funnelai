import { EmailProvider, SendResult } from '../types';
import * as postmark from 'postmark';
import { prisma } from '@funnelai/database/src';

export class PostmarkEmailProvider implements EmailProvider {
  private client: postmark.ServerClient;

  constructor(config: { serverToken: string }) {
    this.client = new postmark.ServerClient(config.serverToken);
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

      // Add unsubscribe link to HTML
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?c=${contact?.id}&w=${args.workspaceId}`;
      const htmlWithUnsub = args.html
        ? `${args.html}<br><br><hr><p style="font-size: 12px; color: #666;">
           <a href="${unsubscribeUrl}">Unsubscribe</a> |
           Powered by InfoOS CRM</p>`
        : undefined;

      const textWithUnsub = args.text
        ? `${args.text}\n\n---\nUnsubscribe: ${unsubscribeUrl}`
        : undefined;

      // Send email
      const result = await this.client.sendEmail({
        From: args.from,
        To: args.to,
        Subject: args.subject,
        HtmlBody: htmlWithUnsub,
        TextBody: textWithUnsub,
        ReplyTo: args.replyTo || args.from,
        MessageStream: 'outbound',
        Metadata: {
          eventId: args.eventId,
          workspaceId: args.workspaceId,
        },
        TrackOpens: true,
        TrackLinks: 'HtmlAndText',
      });

      return {
        providerId: result.MessageID,
        status: 'sent',
        meta: {
          submittedAt: result.SubmittedAt,
          to: result.To,
        },
      };
    } catch (error: any) {
      console.error('[PostmarkEmailProvider] Send error:', error);

      // Handle specific Postmark errors
      if (error.code === 406) {
        return {
          providerId: '',
          status: 'failed',
          error: 'Inactive recipient (previously bounced or complained)',
        };
      }

      if (error.code === 429) {
        return {
          providerId: '',
          status: 'failed',
          error: 'Rate limit exceeded',
          meta: { retryAfter: 60 },
        };
      }

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
      email: data.Email,
      messageId: data.MessageID,
      type: data.Type === 'HardBounce' ? 'hard' : 'soft',
    };
  }

  handleOpen(data: any): {
    messageId: string;
    timestamp: Date;
  } {
    return {
      messageId: data.MessageID,
      timestamp: new Date(data.ReceivedAt),
    };
  }

  handleClick(data: any): {
    messageId: string;
    url: string;
    timestamp: Date;
  } {
    return {
      messageId: data.MessageID,
      url: data.OriginalLink,
      timestamp: new Date(data.ReceivedAt),
    };
  }

  async handleSpamComplaint(data: any, workspaceId: string): Promise<void> {
    const email = data.Email;

    // Mark contact as non-consentEmail
    await prisma.contact.updateMany({
      where: {
        workspaceId,
        email,
      },
      data: {
        consentEmail: false,
      },
    });

    // Log activity
    const contact = await prisma.contact.findFirst({
      where: {
        workspaceId,
        email,
      },
    });

    if (contact) {
      await prisma.activity.create({
        data: {
          workspaceId,
          contactId: contact.id,
          type: 'system',
          subject: 'Email Spam Complaint',
          body: {
            action: 'spam_complaint',
            messageId: data.MessageID,
          },
          occurredAt: new Date(),
        },
      });
    }
  }

  async verifyDomain(domain: string): Promise<{
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
    instructions?: string[];
  }> {
    try {
      // In production, you'd use Postmark's domain verification API
      // For now, return mock data
      return {
        spf: false,
        dkim: false,
        dmarc: false,
        instructions: [
          `Add TXT record: v=spf1 include:spf.postmarkapp.com ~all`,
          `Add CNAME record: pm._domainkey.${domain} -> pm.mtasv.net`,
          `Add TXT record: _dmarc.${domain} -> v=DMARC1; p=none;`,
        ],
      };
    } catch (error: any) {
      console.error('[PostmarkEmailProvider] Domain verify error:', error);
      throw new Error(`Failed to verify domain: ${error.message}`);
    }
  }

  async handleInboundEmail(data: any): Promise<{
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
    messageId: string;
  }> {
    return {
      from: data.FromFull.Email,
      to: data.ToFull[0].Email,
      subject: data.Subject,
      text: data.TextBody,
      html: data.HtmlBody,
      messageId: data.MessageID,
    };
  }
}