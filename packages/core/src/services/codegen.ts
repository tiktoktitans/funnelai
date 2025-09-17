import { BuildConfig } from '@funnelai/types';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

export class CodegenService {
  private templatesDir = path.join(process.cwd(), 'packages', 'templates');
  private outputDir = path.join(process.cwd(), 'sites');

  async generateSite(config: BuildConfig): Promise<{ success: boolean; error?: string; outputPath?: string }> {
    try {
      const templatePath = path.join(this.templatesDir, config.templateKey);
      const outputPath = path.join(this.outputDir, config.projectSlug);

      await fs.mkdir(this.outputDir, { recursive: true });

      await this.copyTemplate(templatePath, outputPath);

      await this.injectContent(outputPath, config);

      await this.createEnvFile(outputPath, config);

      await this.buildProject(outputPath);

      return { success: true, outputPath };
    } catch (error: any) {
      console.error('Codegen error:', error);
      return { success: false, error: error.message };
    }
  }

  private async copyTemplate(source: string, destination: string) {
    await fs.rm(destination, { recursive: true, force: true });
    await fs.mkdir(destination, { recursive: true });

    const copyRecursive = async (src: string, dest: string) => {
      const stat = await fs.stat(src);

      if (stat.isDirectory()) {
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src);

        for (const entry of entries) {
          if (entry === 'node_modules' || entry === '.next') continue;
          await copyRecursive(
            path.join(src, entry),
            path.join(dest, entry)
          );
        }
      } else {
        await fs.copyFile(src, dest);
      }
    };

    await copyRecursive(source, destination);
  }

  private async injectContent(outputPath: string, config: BuildConfig) {
    const specPath = path.join(outputPath, 'public', 'spec.json');
    await fs.mkdir(path.join(outputPath, 'public'), { recursive: true });

    await fs.writeFile(
      specPath,
      JSON.stringify({
        specs: config.specs,
        brandColors: config.brandColors,
        templateKey: config.templateKey,
        templateVersion: config.templateVersion,
      }, null, 2)
    );

    const pagesDir = path.join(outputPath, 'src', 'pages');
    const indexPath = path.join(pagesDir, 'index.tsx');

    if (await this.fileExists(indexPath)) {
      let content = await fs.readFile(indexPath, 'utf-8');

      content = content.replace(
        /const spec = \{\};/g,
        `const spec = ${JSON.stringify(config.specs.landing || {})};`
      );

      await fs.writeFile(indexPath, content);
    }
  }

  private async createEnvFile(outputPath: string, config: BuildConfig) {
    const envContent = [
      `NEXT_PUBLIC_PROJECT_ID=${config.projectId}`,
      `NEXT_PUBLIC_PROJECT_SLUG=${config.projectSlug}`,
    ];

    if (config.integrations.calendly) {
      envContent.push(`NEXT_PUBLIC_CALENDLY_URL=${config.integrations.calendly.url}`);
    }

    if (config.integrations.pixels) {
      if (config.integrations.pixels.facebook) {
        envContent.push(`NEXT_PUBLIC_FB_PIXEL_ID=${config.integrations.pixels.facebook}`);
      }
      if (config.integrations.pixels.google) {
        envContent.push(`NEXT_PUBLIC_GA_ID=${config.integrations.pixels.google}`);
      }
    }

    await fs.writeFile(
      path.join(outputPath, '.env.local'),
      envContent.join('\n')
    );
  }

  private async buildProject(outputPath: string) {
    try {
      execSync('pnpm install', {
        cwd: outputPath,
        stdio: 'inherit',
      });

      execSync('pnpm build', {
        cwd: outputPath,
        stdio: 'inherit',
      });
    } catch (error) {
      throw new Error('Failed to build project: ' + error);
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}