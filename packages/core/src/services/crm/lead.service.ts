import { prisma, Prisma } from '@funnelai/database/src';

export class LeadService {
  async createLead(data: {
    workspaceId: string;
    email?: string;
    phoneE164?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    source?: string;
    medium?: string;
    campaign?: string;
    tags?: string[];
    utmData?: any;
    ownerId?: string;
  }) {
    // Check for duplicates
    const existing = await this.findDuplicate(data.workspaceId, data.email, data.phoneE164);

    if (existing) {
      // Update existing lead
      return this.updateLead(existing.id, data);
    }

    // Apply assignment rules if no owner specified
    if (!data.ownerId) {
      data.ownerId = await this.applyAssignmentRules(data.workspaceId, data);
    }

    const lead = await prisma.lead.create({
      data: {
        ...data,
        tags: data.tags || [],
        score: this.calculateInitialScore(data),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        workspaceId: data.workspaceId,
        leadId: lead.id,
        userId: data.ownerId,
        type: 'system',
        subject: 'Lead Created',
        body: {
          action: 'lead_created',
          source: data.source,
          medium: data.medium,
        },
      },
    });

    // Check SLA if applicable
    await this.checkSLA(lead.id);

    return lead;
  }

  async updateLead(id: string, data: Partial<{
    email?: string;
    phoneE164?: string;
    firstName?: string;
    lastName?: string;
    status?: string;
    tags?: string[];
    score?: number;
    ownerId?: string;
  }>) {
    const before = await prisma.lead.findUnique({ where: { id } });

    if (!before) throw new Error('Lead not found');

    const lead = await prisma.lead.update({
      where: { id },
      data,
    });

    // Log status changes
    if (before.status !== lead.status) {
      await prisma.activity.create({
        data: {
          workspaceId: lead.workspaceId,
          leadId: lead.id,
          type: 'system',
          subject: 'Lead Status Changed',
          body: {
            action: 'status_changed',
            from: before.status,
            to: lead.status,
          },
        },
      });
    }

    return lead;
  }

  async qualifyLead(leadId: string, userId?: string) {
    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'qualified' },
    });

    await prisma.activity.create({
      data: {
        workspaceId: lead.workspaceId,
        leadId: lead.id,
        userId,
        type: 'system',
        subject: 'Lead Qualified',
        body: { action: 'lead_qualified' },
      },
    });

    return lead;
  }

  async disqualifyLead(leadId: string, reason: string, userId?: string) {
    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'disqualified' },
    });

    await prisma.activity.create({
      data: {
        workspaceId: lead.workspaceId,
        leadId: lead.id,
        userId,
        type: 'system',
        subject: 'Lead Disqualified',
        body: {
          action: 'lead_disqualified',
          reason,
        },
      },
    });

    return lead;
  }

  private async findDuplicate(workspaceId: string, email?: string, phoneE164?: string) {
    if (!email && !phoneE164) return null;

    const conditions: Prisma.LeadWhereInput[] = [];

    if (email) {
      conditions.push({ workspaceId, email, status: { not: 'converted' } });
    }

    if (phoneE164) {
      conditions.push({ workspaceId, phoneE164, status: { not: 'converted' } });
    }

    return prisma.lead.findFirst({
      where: { OR: conditions },
    });
  }

  private calculateInitialScore(data: any): number {
    let score = 0;

    // Has both email and phone = higher score
    if (data.email && data.phoneE164) score += 20;
    else if (data.email || data.phoneE164) score += 10;

    // Has name information
    if (data.firstName && data.lastName) score += 15;
    else if (data.firstName || data.lastName) score += 5;

    // Has company
    if (data.company) score += 10;

    // From high-value sources
    const highValueSources = ['webinar', 'demo', 'trial'];
    if (data.source && highValueSources.includes(data.source.toLowerCase())) {
      score += 25;
    }

    // From paid campaigns
    if (data.medium === 'cpc' || data.medium === 'paid') score += 15;

    return Math.min(score, 100); // Cap at 100
  }

  private async applyAssignmentRules(workspaceId: string, leadData: any): Promise<string | undefined> {
    const rules = await prisma.assignmentRule.findMany({
      where: {
        workspaceId,
        active: true,
      },
      orderBy: { priority: 'desc' },
    });

    for (const rule of rules) {
      if (this.matchesConditions(leadData, rule.conditions as any)) {
        if (rule.type === 'round_robin') {
          return this.getNextRoundRobinUser(rule.userIds);
        } else if (rule.type === 'load_balanced') {
          return this.getLeastLoadedUser(workspaceId, rule.userIds);
        }
      }
    }

    // Default: assign to first available user
    const defaultUsers = await prisma.userWorkspace.findMany({
      where: { workspaceId },
      select: { userId: true },
      take: 1,
    });

    return defaultUsers[0]?.userId;
  }

  private matchesConditions(leadData: any, conditions: any): boolean {
    if (!conditions) return true;

    for (const [key, value] of Object.entries(conditions)) {
      if (leadData[key] !== value) return false;
    }

    return true;
  }

  private async getNextRoundRobinUser(userIds: string[]): Promise<string> {
    // Simple round-robin: rotate through users
    // In production, you'd track last assigned index
    const index = Math.floor(Math.random() * userIds.length);
    return userIds[index];
  }

  private async getLeastLoadedUser(workspaceId: string, userIds: string[]): Promise<string> {
    // Get lead counts per user
    const leadCounts = await prisma.lead.groupBy({
      by: ['ownerId'],
      where: {
        workspaceId,
        ownerId: { in: userIds },
        status: { in: ['new', 'working'] },
      },
      _count: true,
    });

    // Find user with least leads
    let minCount = Infinity;
    let selectedUser = userIds[0];

    for (const userId of userIds) {
      const count = leadCounts.find(c => c.ownerId === userId)?._count || 0;
      if (count < minCount) {
        minCount = count;
        selectedUser = userId;
      }
    }

    return selectedUser;
  }

  private async checkSLA(leadId: string) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { workspace: { include: { slas: { where: { active: true } } } } },
    });

    if (!lead) return;

    // Check applicable SLAs
    for (const sla of lead.workspace.slas) {
      if (this.matchesConditions(lead, sla.conditions as any)) {
        if (sla.firstResponseMinutes) {
          // Schedule SLA check
          const checkTime = new Date(Date.now() + sla.firstResponseMinutes * 60 * 1000);

          // In production, schedule a job to check if lead has been contacted
          console.log(`SLA scheduled for lead ${leadId} at ${checkTime}`);
        }
      }
    }
  }

  async searchLeads(params: {
    workspaceId: string;
    query?: string;
    status?: string;
    tags?: string[];
    source?: string;
    ownerId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.LeadWhereInput = {
      workspaceId: params.workspaceId,
    };

    if (params.query) {
      where.OR = [
        { email: { contains: params.query, mode: 'insensitive' } },
        { firstName: { contains: params.query, mode: 'insensitive' } },
        { lastName: { contains: params.query, mode: 'insensitive' } },
        { company: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.tags && params.tags.length > 0) {
      where.tags = { hasSome: params.tags };
    }

    if (params.source) {
      where.source = params.source;
    }

    if (params.ownerId) {
      where.ownerId = params.ownerId;
    }

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) where.createdAt.gte = params.dateFrom;
      if (params.dateTo) where.createdAt.lte = params.dateTo;
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
        take: params.limit || 50,
        skip: params.offset || 0,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.count({ where }),
    ]);

    return { leads, total };
  }
}