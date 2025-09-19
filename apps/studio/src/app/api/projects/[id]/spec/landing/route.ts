import { NextRequest, NextResponse } from 'next/server';
import { db, supabase } from '@funnelai/database/src/supabase-client';
import { AIGenerator } from '@funnelai/core/src/services/ai-generator';

// Force Node.js runtime for Anthropic API compatibility
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout for AI generation

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get project with spec
    const { data: project, error: projectError } = await supabase
      .from('Project')
      .select(`
        *,
        specs:Spec(*)
      `)
      .eq('id', params.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get the landing spec
    const landingSpec = project.specs?.find((s: any) => s.type === 'LANDING');

    if (!landingSpec || !landingSpec.input) {
      return NextResponse.json(
        { error: 'No landing spec found for this project' },
        { status: 400 }
      );
    }

    // Generate content with AI
    console.log('Generating landing page content...');
    const generator = new AIGenerator();
    const content = await generator.generateLandingPage(landingSpec.input);

    // Update spec with generated content
    const { data: updatedSpec, error: updateError } = await supabase
      .from('Spec')
      .update({
        content: {
          landingPage: content.landingPage,
          thankYouPage: content.thankYouPage,
          metadata: content.metadata
        },
        updatedAt: new Date().toISOString()
      })
      .eq('id', landingSpec.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      spec: updatedSpec
    });
  } catch (error) {
    console.error('Landing spec generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate landing page content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve the landing spec
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: spec, error } = await supabase
      .from('Spec')
      .select('*')
      .eq('projectId', params.id)
      .eq('type', 'LANDING')
      .single();

    if (error || !spec) {
      return NextResponse.json(
        { error: 'Landing spec not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(spec);
  } catch (error) {
    console.error('Get landing spec error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing spec' },
      { status: 500 }
    );
  }
}