// Provider type definitions for InfoOS CRM

export interface SendResult {
  providerId: string;
  status: 'sent' | 'queued' | 'failed';
  error?: string;
  meta?: Record<string, any>;
}

export interface SmsProvider {
  send(args: {
    to: string;
    from: string;
    body: string;
    eventId: string;
    workspaceId: string;
  }): Promise<SendResult>;

  handleInbound(data: any): {
    from: string;
    to: string;
    body: string;
    providerId: string;
  };

  handleStatusCallback(data: any): {
    messageId: string;
    status: 'delivered' | 'failed' | 'undelivered';
  };
}

export interface EmailProvider {
  send(args: {
    to: string;
    from: string;
    subject: string;
    html?: string;
    text?: string;
    eventId: string;
    workspaceId: string;
    replyTo?: string;
  }): Promise<SendResult>;

  handleBounce(data: any): {
    email: string;
    messageId: string;
    type: 'hard' | 'soft';
  };

  handleOpen(data: any): {
    messageId: string;
    timestamp: Date;
  };

  handleClick(data: any): {
    messageId: string;
    url: string;
    timestamp: Date;
  };

  verifyDomain(domain: string): Promise<{
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
    instructions?: string[];
  }>;
}

export interface ProviderFactory {
  createSmsProvider(config: any): SmsProvider;
  createEmailProvider(config: any): EmailProvider;
}