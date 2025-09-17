import { NextRequest, NextResponse } from 'next/server';
import { prisma, SpecType } from '@funnelai/database';
import { ClaudeClient } from '@funnelai/core/src/llm/claude-client';
import { WizardInput } from '@funnelai/types';

const SPEC_TYPE_MAP: Record<string, SpecType> = {
  'landing': 'LANDING',
  'webinar': 'WEBINAR',
  'vsl': 'VSL',
  'emails': 'EMAILS',
  'thankyou': 'THANKYOU',
  'application': 'APPLICATION',
};

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string; type: string } }
) {
  try {
    const { id: projectId, type } = params;
    const specType = SPEC_TYPE_MAP[type];

    if (!specType) {
      return NextResponse.json(
        { error: 'Invalid spec type' },
        { status: 400 }
      );
    }

    const existingSpec = await prisma.spec.findUnique({
      where: {
        projectId_type: {
          projectId,
          type: specType,
        },
      },
    });

    if (!existingSpec) {
      return NextResponse.json(
        { error: 'Spec not found' },
        { status: 404 }
      );
    }

    const claudeClient = new ClaudeClient(
      process.env.ANTHROPIC_API_KEY!
    );

    const input = existingSpec.input as WizardInput;
    let content;

    switch (specType) {
      case 'LANDING':
        content = await claudeClient.generateLandingSpec(input);
        break;
      case 'VSL':
        content = await claudeClient.generateVSLSpec(input);
        break;
      case 'WEBINAR':
        content = await claudeClient.generateWebinarSpec(input);
        break;
      case 'EMAILS':
        content = await claudeClient.generateEmailSpec(input);
        break;
      default:
        return NextResponse.json(
          { error: 'Spec generation not implemented for this type' },
          { status: 400 }
        );
    }

    const updatedSpec = await prisma.spec.update({
      where: {
        projectId_type: {
          projectId,
          type: specType,
        },
      },
      data: {
        content,
        structure: (content as any).structure || {},
      },
    });

    return NextResponse.json(updatedSpec);
  } catch (error) {
    console.error('Spec generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate spec' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; type: string } }
) {
  try {
    const { id: projectId, type } = params;
    const specType = SPEC_TYPE_MAP[type];
    const body = await request.json();

    if (!specType) {
      return NextResponse.json(
        { error: 'Invalid spec type' },
        { status: 400 }
      );
    }

    const updatedSpec = await prisma.spec.upsert({
      where: {
        projectId_type: {
          projectId,
          type: specType,
        },
      },
      update: {
        content: body.content,
        structure: body.structure || {},
      },
      create: {
        projectId,
        type: specType,
        input: body.input || {},
        content: body.content,
        structure: body.structure || {},
      },
    });

    return NextResponse.json(updatedSpec);
  } catch (error) {
    console.error('Spec update error:', error);
    return NextResponse.json(
      { error: 'Failed to update spec' },
      { status: 500 }
    );
  }
}