import { NextRequest, NextResponse } from 'next/server';
import { ContactService } from '@funnelai/core/src/services/crm/contact.service';
import { z } from 'zod';

const CreateContactSchema = z.object({
  email: z.string().email().optional(),
  phoneE164: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organizationId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
});

const contactService = new ContactService();

export async function GET(request: NextRequest) {
  try {
    // TODO: Get workspaceId from session/auth
    const workspaceId = request.headers.get('x-workspace-id') || 'demo';

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || undefined;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const status = searchParams.get('status') || undefined;
    const hasEmail = searchParams.get('hasEmail') === 'true' ? true :
                     searchParams.get('hasEmail') === 'false' ? false : undefined;
    const hasPhone = searchParams.get('hasPhone') === 'true' ? true :
                     searchParams.get('hasPhone') === 'false' ? false : undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await contactService.searchContacts({
      workspaceId,
      query,
      tags,
      status,
      hasEmail,
      hasPhone,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Contacts API] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateContactSchema.parse(body);

    // TODO: Get workspaceId and userId from session/auth
    const workspaceId = request.headers.get('x-workspace-id') || 'demo';
    const userId = request.headers.get('x-user-id');

    const contact = await contactService.createContact({
      workspaceId,
      ...validated,
      ownerId: userId || undefined,
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    console.error('[Contacts API] POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create contact' },
      { status: 500 }
    );
  }
}