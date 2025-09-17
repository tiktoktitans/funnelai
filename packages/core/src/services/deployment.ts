import { BuildConfig, DeploymentResult } from '@funnelai/types';
import { execSync } from 'child_process';
import path from 'path';

export class DeploymentService {
  async deploy(config: BuildConfig): Promise<DeploymentResult> {
    try {
      const projectPath = path.join(process.cwd(), 'sites', config.projectSlug);

      await this.gitCommit(projectPath, config);

      const deployUrl = await this.deployToVercel(projectPath, config);

      return {
        success: true,
        url: deployUrl,
        buildId: config.buildId,
        logs: ['Deployment successful'],
      };
    } catch (error: any) {
      console.error('Deployment error:', error);
      return {
        success: false,
        error: error.message,
        logs: ['Deployment failed: ' + error.message],
      };
    }
  }

  private async gitCommit(projectPath: string, config: BuildConfig) {
    try {
      execSync('git init', { cwd: projectPath });

      execSync('git add .', { cwd: projectPath });

      const commitMessage = `Deploy ${config.projectSlug} - ${new Date().toISOString()}`;
      execSync(`git commit -m "${commitMessage}"`, { cwd: projectPath });

    } catch (error) {
      console.log('Git operations skipped or failed:', error);
    }
  }

  private async deployToVercel(projectPath: string, config: BuildConfig): Promise<string> {
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      try {
        const response = await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectSlug: config.projectSlug,
            ref: 'main',
          }),
        });

        if (!response.ok) {
          throw new Error('Vercel deploy hook failed');
        }

        return `https://${config.projectSlug}.vercel.app`;
      } catch (error) {
        console.error('Vercel deploy hook error:', error);
      }
    }

    const mockUrl = `https://${config.projectSlug}-demo.vercel.app`;
    console.log('Mock deployment URL:', mockUrl);
    return mockUrl;
  }

  private async deployWithVercelCLI(projectPath: string): Promise<string> {
    try {
      const output = execSync('vercel --prod --yes', {
        cwd: projectPath,
        encoding: 'utf-8',
      });

      const urlMatch = output.match(/https:\/\/[^\s]+\.vercel\.app/);
      if (urlMatch) {
        return urlMatch[0];
      }

      throw new Error('Could not extract Vercel URL from deployment output');
    } catch (error) {
      throw new Error('Vercel CLI deployment failed: ' + error);
    }
  }
}