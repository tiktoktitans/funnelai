import { SmsProvider, SendResult } from '../types';
import twilio from 'twilio';
import { prisma } from '@funnelai/database/src';

export class TwilioSmsProvider implements SmsProvider {
  private client: twilio.Twilio;
  private accountSid: string;

  constructor(config: {
    accountSid: string;
    authToken: string;
    messagingServiceSid?: string;
  }) {
    this.accountSid = config.accountSid;
    this.client = twilio(config.accountSid, config.authToken);
  }

  async send(args: {
    to: string;
    from: string;
    body: string;
    eventId: string;
    workspaceId: string;
  }): Promise<SendResult> {
    try {
      // Check for STOP/HELP compliance
      const contact = await prisma.contact.findFirst({
        where: {
          workspaceId: args.workspaceId,
          phoneE164: args.to,
        },
      });

      if (contact && !contact.consentSms) {
        return {
          providerId: '',
          status: 'failed',
          error: 'Contact has opted out of SMS',
        };
      }

      // Check quiet hours if applicable
      const workspace = await prisma.workspace.findUnique({
        where: { id: args.workspaceId },
      });

      if (workspace && this.isInQuietHours(workspace, contact?.tz)) {
        // Should reschedule, but for now we'll just skip
        return {
          providerId: '',
          status: 'failed',
          error: 'Message blocked due to quiet hours',
        };
      }

      // Send the message
      const message = await this.client.messages.create({
        to: args.to,
        from: args.from,
        body: args.body,
        statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/status`,
      });

      return {
        providerId: message.sid,
        status: 'sent',
        meta: {
          accountSid: message.accountSid,
          dateCreated: message.dateCreated,
        },
      };
    } catch (error: any) {
      console.error('[TwilioSmsProvider] Send error:', error);

      // Handle rate limiting
      if (error.code === 20429) {
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
        error: error.message || 'Failed to send SMS',
      };
    }
  }

  handleInbound(data: any): {
    from: string;
    to: string;
    body: string;
    providerId: string;
  } {
    return {
      from: data.From,
      to: data.To,
      body: data.Body,
      providerId: data.MessageSid,
    };
  }

  async handleStatusCallback(data: any): Promise<{
    messageId: string;
    status: 'delivered' | 'failed' | 'undelivered';
  }> {
    const statusMap: Record<string, 'delivered' | 'failed' | 'undelivered'> = {
      delivered: 'delivered',
      failed: 'failed',
      undelivered: 'undelivered',
    };

    return {
      messageId: data.MessageSid,
      status: statusMap[data.MessageStatus] || 'failed',
    };
  }

  async handleStopKeyword(from: string, workspaceId: string): Promise<void> {
    // Handle STOP/UNSUBSCRIBE
    await prisma.contact.updateMany({
      where: {
        workspaceId,
        phoneE164: from,
      },
      data: {
        consentSms: false,
      },
    });

    // Log activity
    const contact = await prisma.contact.findFirst({
      where: {
        workspaceId,
        phoneE164: from,
      },
    });

    if (contact) {
      await prisma.activity.create({
        data: {
          workspaceId,
          contactId: contact.id,
          type: 'system',
          subject: 'SMS Opt-out',
          body: { action: 'opt_out', method: 'stop_keyword' },
          occurredAt: new Date(),
        },
      });
    }
  }

  private isInQuietHours(
    workspace: { quietHoursStart?: number | null; quietHoursEnd?: number | null; timezone?: string },
    contactTz?: string | null
  ): boolean {
    if (!workspace.quietHoursStart || !workspace.quietHoursEnd) {
      return false;
    }

    const tz = contactTz || workspace.timezone || 'America/New_York';
    const now = new Date();
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    const hour = localTime.getHours();

    // Handle quiet hours that span midnight
    if (workspace.quietHoursStart > workspace.quietHoursEnd) {
      return hour >= workspace.quietHoursStart || hour < workspace.quietHoursEnd;
    }

    return hour >= workspace.quietHoursStart && hour < workspace.quietHoursEnd;
  }

  async provisionNumber(areaCode: string): Promise<{ phoneNumber: string; sid: string }> {
    try {
      const availableNumbers = await this.client
        .availablePhoneNumbers('US')
        .local.list({ areaCode, limit: 1 });

      if (availableNumbers.length === 0) {
        throw new Error(`No available numbers in area code ${areaCode}`);
      }

      const purchased = await this.client.incomingPhoneNumbers.create({
        phoneNumber: availableNumbers[0].phoneNumber,
        smsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/inbound`,
        smsMethod: 'POST',
      });

      return {
        phoneNumber: purchased.phoneNumber,
        sid: purchased.sid,
      };
    } catch (error: any) {
      console.error('[TwilioSmsProvider] Number provision error:', error);
      throw new Error(`Failed to provision number: ${error.message}`);
    }
  }
}