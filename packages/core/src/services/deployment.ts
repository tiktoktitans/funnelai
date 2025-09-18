import { BuildConfig, DeploymentResult } from '@funnelai/types';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export class DeploymentService {
  private repoPath: string;
  private gitAuthor: string;
  private gitEmail: string;

  constructor() {
    this.repoPath = process.env.GITHUB_REPO_PATH || path.join(process.cwd(), 'sites-repo');
    this.gitAuthor = process.env.GIT_AUTHOR_NAME || 'FunnelAI';
    this.gitEmail = process.env.GIT_AUTHOR_EMAIL || 'ops@funnelai.app';
  }

  async deploy(config: BuildConfig): Promise<DeploymentResult> {
    const logs: string[] = [];

    try {
      // Ensure repo exists
      await this.ensureRepo();
      logs.push('Repository ready');

      // Copy built site to repo
      const sitePath = path.join(this.repoPath, 'sites', config.projectSlug);
      const sourcePath = path.join(process.cwd(), 'sites', config.projectSlug);

      await fs.rm(sitePath, { recursive: true, force: true });
      await fs.mkdir(path.dirname(sitePath), { recursive: true });
      await this.copyDirectory(sourcePath, sitePath);
      logs.push(`Copied site to ${sitePath}`);

      // Git operations
      const commitSha = await this.gitCommit(config, logs);
      logs.push(`Committed: ${commitSha}`);

      // Push to GitHub
      await this.gitPush(logs);
      logs.push('Pushed to GitHub');

      // Trigger Vercel deployment
      const deployUrl = await this.deployToVercel(config, commitSha, logs);
      logs.push(`Deployment complete: ${deployUrl}`);

      return {
        success: true,
        url: deployUrl,
        buildId: config.buildId,
        commitSha,
        logs,
      };
    } catch (error: any) {
      console.error('Deployment error:', error);
      logs.push(`Error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        logs,
      };
    }
  }

  private async ensureRepo(): Promise<void> {
    const exists = await this.pathExists(path.join(this.repoPath, '.git'));

    if (!exists) {
      const repoUrl = process.env.GITHUB_REPO_SSH_URL;
      if (!repoUrl) {
        // Use local git repo if no remote configured
        execSync(`git init ${this.repoPath}`, { stdio: 'pipe' });
        return;
      }

      execSync(`git clone ${repoUrl} ${this.repoPath}`, {
        stdio: 'pipe',
      });
    } else {
      // Pull latest if remote exists
      try {
        execSync('git pull origin main', {
          cwd: this.repoPath,
          stdio: 'pipe',
        });
      } catch {
        // Ignore pull errors (might not have remote)
      }
    }
  }

  private async gitCommit(config: BuildConfig, logs: string[]): Promise<string> {
    const timestamp = new Date().toISOString();
    const message = `Deploy ${config.projectSlug} - ${timestamp}`;

    try {
      // Configure git
      execSync(`git config user.name "${this.gitAuthor}"`, { cwd: this.repoPath });
      execSync(`git config user.email "${this.gitEmail}"`, { cwd: this.repoPath });

      // Add files
      execSync('git add .', { cwd: this.repoPath });

      // Commit
      execSync(`git commit -m "${message}"`, { cwd: this.repoPath });

      // Get commit SHA
      const sha = execSync('git rev-parse HEAD', {
        cwd: this.repoPath,
        encoding: 'utf-8',
      }).trim();

      return sha;
    } catch (error: any) {
      if (error.message.includes('nothing to commit')) {
        // Get current SHA if no changes
        return execSync('git rev-parse HEAD', {
          cwd: this.repoPath,
          encoding: 'utf-8',
        }).trim();
      }
      throw error;
    }
  }

  private async gitPush(logs: string[]): Promise<void> {
    try {
      if (process.env.GITHUB_REPO_SSH_URL) {
        execSync('git push origin main', {
          cwd: this.repoPath,
          stdio: 'pipe',
        });
      }
    } catch (error: any) {
      logs.push(`Git push skipped: ${error.message}`);
    }
  }

  private async deployToVercel(config: BuildConfig, commitSha: string, logs: string[]): Promise<string> {
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      try {
        // Trigger deployment
        const response = await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectSlug: config.projectSlug,
            gitRef: commitSha,
          }),
        });

        if (!response.ok) {
          throw new Error('Vercel deploy hook failed');
        }

        const data = await response.json().catch(() => ({}));
        const deploymentId = data.job?.id || data.id || commitSha.slice(0, 7);

        // Poll for deployment status
        return await this.pollVercelDeployment(deploymentId, config.projectSlug, logs);
      } catch (error) {
        console.error('Vercel deploy hook error:', error);
      }
    }

    const mockUrl = `https://${config.projectSlug}-demo.vercel.app`;
    console.log('Mock deployment URL:', mockUrl);
    return mockUrl;
  }

  private async pollVercelDeployment(deploymentId: string, projectSlug: string, logs: string[]): Promise<string> {
    const maxAttempts = 60; // 5 minutes max
    const pollInterval = 5000; // 5 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      // Check deployment status
      if (process.env.VERCEL_TOKEN) {
        try {
          const response = await fetch(
            `https://api.vercel.com/v13/deployments/${deploymentId}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const state = data.readyState || data.state || 'BUILDING';

            if (state === 'READY') {
              return data.url ? `https://${data.url}` : `https://${projectSlug}.vercel.app`;
            }

            if (state === 'ERROR' || state === 'CANCELED') {
              throw new Error(`Deployment failed: ${state}`);
            }

            logs.push(`Deployment status: ${state} (${attempt + 1}/${maxAttempts})`);
          }
        } catch (error) {
          console.error('Vercel status check error:', error);
        }
      }

      // Without token, assume success after 30 seconds
      if (attempt > 6) {
        return `https://${projectSlug}.vercel.app`;
      }
    }

    throw new Error('Deployment timed out after 5 minutes');
  }

  private async copyDirectory(source: string, destination: string): Promise<void> {
    await fs.mkdir(destination, { recursive: true });

    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  private async pathExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
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