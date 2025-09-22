import { prisma, Prisma } from '@funnelai/database/src';

export class ConversationService {
  async createOrGetConversation(params: {
    workspaceId: string;
    contactId: string;
    channel: 'sms' | 'email' | 'whatsapp';
    subject?: string;
  }) {
    // Check if conversation exists
    const existing = await prisma.conversation.findFirst({
      where: {
        workspaceId: params.workspaceId,
        contactId: params.contactId,
        channel: params.channel,
        status: { not: 'closed' },
      },
    });

    if (existing) {
      return existing;
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        workspaceId: params.workspaceId,
        contactId: params.contactId,
        channel: params.channel,
        subject: params.subject,
        status: 'open',
        unread: false,
      },
    });

    return conversation;
  }

  async sendMessage(params: {
    workspaceId: string;
    contactId: string;
    channel: 'sms' | 'email' | 'whatsapp';
    subject?: string;
    text?: string;
    html?: string;
    userId?: string;
  }) {
    // Get or create conversation
    const conversation = await this.createOrGetConversation({
      workspaceId: params.workspaceId,
      contactId: params.contactId,
      channel: params.channel,
      subject: params.subject,
    });

    // Create message record
    const message = await prisma.message.create({
      data: {
        workspaceId: params.workspaceId,
        conversationId: conversation.id,
        contactId: params.contactId,
        channel: params.channel,
        direction: 'outbound',
        subject: params.subject,
        text: params.text,
        html: params.html,
        status: 'queued',
        eventId: this.generateEventId(),
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        unread: false,
      },
    });

    // Update contact last contacted
    await prisma.contact.update({
      where: { id: params.contactId },
      data: { lastContactedAt: new Date() },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        workspaceId: params.workspaceId,
        contactId: params.contactId,
        userId: params.userId,
        type: params.channel,
        subject: params.subject || 'Message Sent',
        body: {
          action: 'message_sent',
          channel: params.channel,
          messageId: message.id,
        },
      },
    });

    // Queue for actual sending (handled by worker)
    await this.queueMessage(message);

    return message;
  }

  async receiveMessage(params: {
    workspaceId: string;
    contactId: string;
    channel: 'sms' | 'email' | 'whatsapp';
    subject?: string;
    text?: string;
    html?: string;
    providerId?: string;
  }) {
    // Get or create conversation
    const conversation = await this.createOrGetConversation({
      workspaceId: params.workspaceId,
      contactId: params.contactId,
      channel: params.channel,
      subject: params.subject,
    });

    // Create message record
    const message = await prisma.message.create({
      data: {
        workspaceId: params.workspaceId,
        conversationId: conversation.id,
        contactId: params.contactId,
        channel: params.channel,
        direction: 'inbound',
        subject: params.subject,
        text: params.text,
        html: params.html,
        providerId: params.providerId,
        status: 'delivered',
        deliveredAt: new Date(),
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        unread: true,
        status: 'open',
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        workspaceId: params.workspaceId,
        contactId: params.contactId,
        type: params.channel,
        subject: params.subject || 'Message Received',
        body: {
          action: 'message_received',
          channel: params.channel,
          messageId: message.id,
        },
      },
    });

    // Check for auto-responses (STOP, HELP)
    if (params.channel === 'sms' && params.text) {
      await this.checkAutoResponse(params.text, params.contactId, params.workspaceId);
    }

    return message;
  }

  private async checkAutoResponse(text: string, contactId: string, workspaceId: string) {
    const normalized = text.trim().toUpperCase();

    if (['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'].includes(normalized)) {
      // Opt-out
      await prisma.contact.update({
        where: { id: contactId },
        data: { consentSms: false },
      });

      await prisma.activity.create({
        data: {
          workspaceId,
          contactId,
          type: 'system',
          subject: 'SMS Opt-Out',
          body: { action: 'sms_opt_out', keyword: normalized },
        },
      });

      // Send confirmation
      await this.sendMessage({
        workspaceId,
        contactId,
        channel: 'sms',
        text: 'You have been unsubscribed from SMS messages. Reply START to resubscribe.',
      });
    } else if (['START', 'SUBSCRIBE', 'YES'].includes(normalized)) {
      // Opt-in
      await prisma.contact.update({
        where: { id: contactId },
        data: { consentSms: true },
      });

      await prisma.activity.create({
        data: {
          workspaceId,
          contactId,
          type: 'system',
          subject: 'SMS Opt-In',
          body: { action: 'sms_opt_in', keyword: normalized },
        },
      });

      // Send confirmation
      await this.sendMessage({
        workspaceId,
        contactId,
        channel: 'sms',
        text: 'Welcome back! You have been subscribed to SMS messages. Reply STOP to unsubscribe.',
      });
    } else if (normalized === 'HELP') {
      // Send help message
      await this.sendMessage({
        workspaceId,
        contactId,
        channel: 'sms',
        text: 'Reply STOP to unsubscribe from messages. Reply START to subscribe. Message and data rates may apply.',
      });
    }
  }

  async getConversations(params: {
    workspaceId: string;
    channel?: 'sms' | 'email' | 'whatsapp';
    status?: 'open' | 'closed' | 'snoozed';
    unread?: boolean;
    assignedTo?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.ConversationWhereInput = {
      workspaceId: params.workspaceId,
    };

    if (params.channel) {
      where.channel = params.channel;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.unread !== undefined) {
      where.unread = params.unread;
    }

    if (params.assignedTo) {
      where.assignedTo = params.assignedTo;
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneE164: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          assignee: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: params.limit || 50,
        skip: params.offset || 0,
        orderBy: { lastMessageAt: 'desc' },
      }),
      prisma.conversation.count({ where }),
    ]);

    return { conversations, total };
  }

  async getConversationThread(conversationId: string, limit = 100, offset = 0) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return messages.reverse(); // Return in chronological order
  }

  async markAsRead(conversationId: string) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { unread: false },
    });
  }

  async assignConversation(conversationId: string, userId: string | null) {
    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { assignedTo: userId },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        workspaceId: conversation.workspaceId,
        contactId: conversation.contactId,
        userId,
        type: 'system',
        subject: userId ? 'Conversation Assigned' : 'Conversation Unassigned',
        body: {
          action: userId ? 'conversation_assigned' : 'conversation_unassigned',
          conversationId,
        },
      },
    });

    return conversation;
  }

  async closeConversation(conversationId: string) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'closed' },
    });
  }

  async snoozeConversation(conversationId: string, until: Date) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status: 'snoozed',
        // Store snooze until time in metadata
      },
    });
  }

  private generateEventId(): string {
    // Generate a unique event ID (UUIDv7 or similar)
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async queueMessage(message: any) {
    // In production, add to BullMQ queue for processing
    // For now, just log
    console.log('[ConversationService] Message queued for sending:', message.id);
  }

  async getThreadSummary(conversationId: string) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        direction: true,
        channel: true,
        text: true,
        subject: true,
        createdAt: true,
      },
    });

    return messages.reverse();
  }
}