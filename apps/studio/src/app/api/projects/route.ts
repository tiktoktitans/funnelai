import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@funnelai/database';
import { WizardInputSchema } from '@funnelai/types';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedInput = WizardInputSchema.parse(body);

    const slug = slugify(validatedInput.brandName) + '-' + Date.now();

    const project = await prisma.project.create({
      data: {
        name: validatedInput.brandName,
        slug,
        status: 'DRAFT',
        brandColors: validatedInput.brandColors,
        user: {
          connectOrCreate: {
            where: {
              email: 'demo@funnelai.com'
            },
            create: {
              email: 'demo@funnelai.com',
              name: 'Demo User'
            }
          }
        },
        specs: {
          create: {
            type: 'LANDING',
            input: validatedInput as any,
            content: {},
            structure: {},
          }
        }
      }
    });

    return NextResponse.json({
      id: project.id,
      slug: project.slug
    });
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        user: {
          email: 'demo@funnelai.com'
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        builds: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}