import { prisma, Prisma } from '@funnelai/database/src';

export class ContactService {
  async createContact(data: {
    workspaceId: string;
    email?: string;
    phoneE164?: string;
    firstName?: string;
    lastName?: string;
    organizationId?: string;
    tags?: string[];
    customFields?: any;
    ownerId?: string;
  }) {
    // Check for duplicates
    const existing = await this.findDuplicate(data.workspaceId, data.email, data.phoneE164);
    if (existing) {
      // Update existing contact instead
      return this.updateContact(existing.id, data);
    }

    const contact = await prisma.contact.create({
      data: {
        ...data,
        tags: data.tags || [],
        customFields: data.customFields || {},
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        workspaceId: data.workspaceId,
        contactId: contact.id,
        userId: data.ownerId,
        type: 'system',
        subject: 'Contact Created',
        body: { action: 'contact_created', source: 'manual' },
      },
    });

    return contact;
  }

  async updateContact(id: string, data: Partial<{
    email?: string;
    phoneE164?: string;
    firstName?: string;
    lastName?: string;
    tags?: string[];
    customFields?: any;
    ownerId?: string;
  }>) {
    const before = await prisma.contact.findUnique({ where: { id } });

    const contact = await prisma.contact.update({
      where: { id },
      data,
    });

    // Log significant changes
    if (before && (before.email !== contact.email || before.phoneE164 !== contact.phoneE164)) {
      await prisma.activity.create({
        data: {
          workspaceId: contact.workspaceId,
          contactId: contact.id,
          type: 'system',
          subject: 'Contact Updated',
          body: {
            action: 'contact_updated',
            changes: {
              email: { from: before.email, to: contact.email },
              phone: { from: before.phoneE164, to: contact.phoneE164 },
            },
          },
        },
      });
    }

    return contact;
  }

  async convertLeadToContact(leadId: string, userId?: string): Promise<{
    contact: any;
    deal?: any;
  }> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Create or update contact
    const contactData = {
      workspaceId: lead.workspaceId,
      leadId: lead.id,
      email: lead.email,
      phoneE164: lead.phoneE164,
      firstName: lead.firstName,
      lastName: lead.lastName,
      tags: lead.tags,
      ownerId: lead.ownerId,
      registeredAt: new Date(),
    };

    const existing = await this.findDuplicate(lead.workspaceId, lead.email, lead.phoneE164);

    const contact = existing
      ? await this.updateContact(existing.id, contactData)
      : await prisma.contact.create({ data: contactData });

    // Update lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'converted' },
    });

    // Create deal if pipeline exists
    const defaultPipeline = await prisma.pipeline.findFirst({
      where: { workspaceId: lead.workspaceId, isDefault: true },
      include: { stages: { orderBy: { order: 'asc' } } },
    });

    let deal = null;
    if (defaultPipeline && defaultPipeline.stages.length > 0) {
      deal = await prisma.deal.create({
        data: {
          workspaceId: lead.workspaceId,
          contactId: contact.id,
          pipelineId: defaultPipeline.id,
          stageId: defaultPipeline.stages[0].id,
          name: `Deal for ${contact.firstName} ${contact.lastName}`.trim(),
          source: lead.source,
          ownerId: lead.ownerId,
        },
      });
    }

    // Log conversion activity
    await prisma.activity.create({
      data: {
        workspaceId: lead.workspaceId,
        leadId: lead.id,
        contactId: contact.id,
        dealId: deal?.id,
        userId,
        type: 'convert',
        subject: 'Lead Converted',
        body: {
          action: 'lead_converted',
          leadId: lead.id,
          contactId: contact.id,
          dealId: deal?.id,
        },
      },
    });

    return { contact, deal };
  }

  async findDuplicate(workspaceId: string, email?: string, phoneE164?: string) {
    if (!email && !phoneE164) return null;

    const conditions: Prisma.ContactWhereInput[] = [];

    if (email) {
      conditions.push({ workspaceId, email });
    }

    if (phoneE164) {
      conditions.push({ workspaceId, phoneE164 });
    }

    return prisma.contact.findFirst({
      where: {
        OR: conditions,
      },
    });
  }

  async searchContacts(params: {
    workspaceId: string;
    query?: string;
    tags?: string[];
    status?: string;
    hasEmail?: boolean;
    hasPhone?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.ContactWhereInput = {
      workspaceId: params.workspaceId,
    };

    if (params.query) {
      where.OR = [
        { email: { contains: params.query, mode: 'insensitive' } },
        { firstName: { contains: params.query, mode: 'insensitive' } },
        { lastName: { contains: params.query, mode: 'insensitive' } },
        { phoneE164: { contains: params.query } },
      ];
    }

    if (params.tags && params.tags.length > 0) {
      where.tags = { hasSome: params.tags };
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.hasEmail !== undefined) {
      where.email = params.hasEmail ? { not: null } : null;
    }

    if (params.hasPhone !== undefined) {
      where.phoneE164 = params.hasPhone ? { not: null } : null;
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          organization: true,
          owner: { select: { id: true, name: true, email: true } },
        },
        take: params.limit || 50,
        skip: params.offset || 0,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where }),
    ]);

    return { contacts, total };
  }

  async addTags(contactId: string, tags: string[]) {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) throw new Error('Contact not found');

    const updatedTags = Array.from(new Set([...(contact.tags || []), ...tags]));

    const updated = await prisma.contact.update({
      where: { id: contactId },
      data: { tags: updatedTags },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        workspaceId: contact.workspaceId,
        contactId: contact.id,
        type: 'tag',
        subject: 'Tags Added',
        body: { action: 'tags_added', tags },
      },
    });

    return updated;
  }

  async removeTags(contactId: string, tags: string[]) {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) throw new Error('Contact not found');

    const updatedTags = (contact.tags || []).filter((t) => !tags.includes(t));

    const updated = await prisma.contact.update({
      where: { id: contactId },
      data: { tags: updatedTags },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        workspaceId: contact.workspaceId,
        contactId: contact.id,
        type: 'tag',
        subject: 'Tags Removed',
        body: { action: 'tags_removed', tags },
      },
    });

    return updated;
  }

  async importContacts(
    workspaceId: string,
    contacts: Array<{
      email?: string;
      phoneE164?: string;
      firstName?: string;
      lastName?: string;
      tags?: string[];
      customFields?: any;
    }>,
    ownerId?: string
  ) {
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const contactData of contacts) {
      try {
        const existing = await this.findDuplicate(
          workspaceId,
          contactData.email,
          contactData.phoneE164
        );

        if (existing) {
          await this.updateContact(existing.id, contactData);
          results.updated++;
        } else {
          await this.createContact({
            workspaceId,
            ...contactData,
            ownerId,
          });
          results.created++;
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(
          `Failed to import ${contactData.email || contactData.phoneE164}: ${error.message}`
        );
      }
    }

    // Log import activity
    await prisma.activity.create({
      data: {
        workspaceId,
        userId: ownerId,
        type: 'system',
        subject: 'Contacts Imported',
        body: {
          action: 'contacts_imported',
          stats: results,
        },
      },
    });

    return results;
  }
}