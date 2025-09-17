import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@funnelai/database';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    const formKind = url.searchParams.get('kind');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    const where: any = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (formKind) {
      where.form = {
        kind: formKind,
      };
    }

    const submissions = await prisma.submission.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        form: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Submissions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}