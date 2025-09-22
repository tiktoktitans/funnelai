import { NextRequest, NextResponse } from 'next/server';
import { ConversationService } from '@funnelai/core/src/services/crm/conversation.service';
import { z } from 'zod';

const SendMessageSchema = z.object({
  contactId: z.string(),
  channel: z.enum(['sms', 'email', 'whatsapp']),
  subject: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),
});

const conversationService = new ConversationService();

export async function GET(request: NextRequest) {
  try {
    // TODO: Get workspaceId from session/auth
    const workspaceId = request.headers.get('x-workspace-id') || 'demo';

    const searchParams = request.nextUrl.searchParams;
    const channel = searchParams.get('channel') as 'sms' | 'email' | 'whatsapp' | undefined;
    const status = searchParams.get('status') as 'open' | 'closed' | 'snoozed' | undefined;
    const unread = searchParams.get('unread') === 'true' ? true :
                   searchParams.get('unread') === 'false' ? false : undefined;
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await conversationService.getConversations({
      workspaceId,
      channel,
      status,
      unread,
      assignedTo,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Conversations API] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = SendMessageSchema.parse(body);

    // TODO: Get workspaceId and userId from session/auth
    const workspaceId = request.headers.get('x-workspace-id') || 'demo';
    const userId = request.headers.get('x-user-id') || undefined;

    const message = await conversationService.sendMessage({
      workspaceId,
      ...validated,
      userId,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error('[Conversations API] POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}