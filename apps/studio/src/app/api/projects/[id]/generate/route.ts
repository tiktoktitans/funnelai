import { NextRequest, NextResponse } from 'next/server';
import { db } from '@funnelai/database/src/supabase-client';
import { AdvancedAIGenerator } from '@funnelai/core/src/services/ai-generator-advanced';
import { DeploymentService } from '@funnelai/core/src/services/deployment';

// Force Node.js runtime for AI compatibility
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get project with spec
    const project = await db.getProjectBySlug(params.id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get the landing spec
    const landingSpec = project.specs?.find((s: any) => s.type === 'LANDING');

    if (!landingSpec || !landingSpec.input) {
      return NextResponse.json(
        { error: 'No input data found for generation' },
        { status: 400 }
      );
    }

    // Create build record
    const build = await db.createBuild({
      projectId: project.id,
      status: 'RUNNING',
      branch: 'main',
      metadata: {
        startedAt: new Date().toISOString()
      }
    });

    try {
      // Generate content with advanced AI
      console.log('Starting advanced AI generation...');
      const generator = new AdvancedAIGenerator();
      const specs = await generator.generateWebinarContent(landingSpec.input);

      // Generate complete project files with templates
      console.log('Generating multi-file project structure...');
      const files = generator.generateProjectFiles(specs, landingSpec.input);

      // Deploy to GitHub and Vercel
      console.log('Starting deployment...');
      const deploymentService = new DeploymentService();
      const deploymentResult = await deploymentService.deploy({
        projectSlug: project.slug,
        files,
        vercelToken: process.env.VERCEL_TOKEN
      });

      if (!deploymentResult.success) {
        throw new Error(deploymentResult.error || 'Deployment failed');
      }

      // Update project with URLs
      await db.supabase
        .from('Project')
        .update({
          status: 'DEPLOYED',
          repoUrl: deploymentResult.repoUrl,
          vercelUrl: deploymentResult.vercelUrl
        })
        .eq('id', project.id);

      // Update build record
      await db.updateBuild(build.id, {
        status: 'SUCCESS',
        vercelDeployUrl: deploymentResult.vercelUrl,
        finishedAt: new Date(),
        metadata: {
          ...build.metadata,
          completedAt: new Date().toISOString(),
          deploymentUrl: deploymentResult.vercelUrl
        }
      });

      return NextResponse.json({
        success: true,
        buildId: build.id,
        vercelUrl: deploymentResult.vercelUrl,
        repoUrl: deploymentResult.repoUrl
      });
    } catch (error) {
      // Update build as failed
      await db.updateBuild(build.id, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        finishedAt: new Date()
      });

      throw error;
    }
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}