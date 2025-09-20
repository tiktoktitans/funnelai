import { NextRequest, NextResponse } from 'next/server';
import { db } from '@funnelai/database/src/supabase-client';
import { WizardInputSchema } from '@funnelai/types';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Clean up empty strings before validation
    if (body.calendlyUrl === '') {
      delete body.calendlyUrl;
    }
    if (body.ctaLink === '') {
      delete body.ctaLink;
    }

    const validatedInput = WizardInputSchema.parse(body);

    const slug = slugify(validatedInput.brandName) + '-' + Date.now();

    // Get or create user
    let user = await db.getUser('demo@funnelai.com');
    if (!user) {
      user = await db.createUser('demo@funnelai.com', 'Demo User');
    }

    // Create project
    const project = await db.createProject({
      userId: user.id,
      name: validatedInput.brandName,
      slug,
      status: 'DRAFT',
      brandColors: validatedInput.brandColors,
      templateKey: 'webinar',
      templateVersion: '1.0.0'
    });

    // Create initial spec
    await db.createSpec({
      projectId: project.id,
      type: 'LANDING',
      input: validatedInput,
      content: {},
      structure: {},
      version: '1.0.0'
    });

    return NextResponse.json({
      id: project.id,
      slug: project.slug
    });
  } catch (error: any) {
    console.error('Project creation error:', error);

    // Handle Zod validation errors
    if (error?.issues) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    // Get demo user
    const user = await db.getUser('demo@funnelai.com');
    if (!user) {
      // Create demo user if doesn't exist
      const newUser = await db.createUser('demo@funnelai.com', 'Demo User');
      return NextResponse.json([]);
    }

    const projects = await db.getProjects(user.id);

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}