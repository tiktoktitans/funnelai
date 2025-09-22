import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@funnelai/database/src';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Get user's workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        settings: true
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Return settings or defaults
    const settings = workspace.settings || {
      twilioAccountSid: '',
      twilioAuthToken: '',
      twilioPhoneNumber: '',
      twilioEnabled: false,
      postmarkApiKey: '',
      postmarkFromEmail: '',
      postmarkFromName: '',
      postmarkEnabled: false,
      workspaceName: workspace.name,
      workspaceUrl: workspace.slug,
      timezone: 'America/New_York',
      businessHours: {
        start: '09:00',
        end: '18:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      emailNotifications: true,
      smsNotifications: false,
      leadAlerts: true,
      messageAlerts: true,
    };

    // Don't send sensitive tokens to frontend
    const sanitizedSettings = {
      ...settings,
      twilioAuthToken: settings.twilioAuthToken ? '•'.repeat(32) : '',
      postmarkApiKey: settings.postmarkApiKey ? '•'.repeat(36) : '',
    };

    return NextResponse.json(sanitizedSettings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    const body = await req.json();

    // Get user's workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        members: {
          some: {
            userId: userId,
            role: { in: ['owner', 'admin'] }
          }
        }
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found or insufficient permissions' }, { status: 404 });
    }

    // Update or create workspace settings
    const settings = await prisma.workspaceSettings.upsert({
      where: {
        workspaceId: workspace.id
      },
      update: {
        twilioAccountSid: body.twilioAccountSid,
        twilioPhoneNumber: body.twilioPhoneNumber,
        twilioEnabled: body.twilioEnabled,
        postmarkFromEmail: body.postmarkFromEmail,
        postmarkFromName: body.postmarkFromName,
        postmarkEnabled: body.postmarkEnabled,
        timezone: body.timezone,
        businessHours: body.businessHours,
        emailNotifications: body.emailNotifications,
        smsNotifications: body.smsNotifications,
        leadAlerts: body.leadAlerts,
        messageAlerts: body.messageAlerts,
      },
      create: {
        workspaceId: workspace.id,
        twilioAccountSid: body.twilioAccountSid,
        twilioPhoneNumber: body.twilioPhoneNumber,
        twilioEnabled: body.twilioEnabled,
        postmarkFromEmail: body.postmarkFromEmail,
        postmarkFromName: body.postmarkFromName,
        postmarkEnabled: body.postmarkEnabled,
        timezone: body.timezone,
        businessHours: body.businessHours,
        emailNotifications: body.emailNotifications,
        smsNotifications: body.smsNotifications,
        leadAlerts: body.leadAlerts,
        messageAlerts: body.messageAlerts,
      }
    });

    // Store encrypted credentials separately if they've changed
    if (body.twilioAuthToken && !body.twilioAuthToken.includes('•')) {
      // In production, encrypt these values
      await prisma.workspaceSettings.update({
        where: { workspaceId: workspace.id },
        data: { twilioAuthToken: body.twilioAuthToken }
      });
    }

    if (body.postmarkApiKey && !body.postmarkApiKey.includes('•')) {
      // In production, encrypt these values
      await prisma.workspaceSettings.update({
        where: { workspaceId: workspace.id },
        data: { postmarkApiKey: body.postmarkApiKey }
      });
    }

    // Update workspace name if changed
    if (body.workspaceName !== workspace.name) {
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: { name: body.workspaceName }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}