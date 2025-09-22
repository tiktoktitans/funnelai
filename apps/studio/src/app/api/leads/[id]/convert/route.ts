import { NextRequest, NextResponse } from 'next/server';
import { ContactService } from '@funnelai/core/src/services/crm/contact.service';

const contactService = new ContactService();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get workspaceId and userId from session/auth
    const userId = request.headers.get('x-user-id') || undefined;

    const result = await contactService.convertLeadToContact(params.id, userId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Lead Convert API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to convert lead' },
      { status: 500 }
    );
  }
}