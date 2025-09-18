import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '@funnelai/database';
import { BuildConfig, DeploymentResult } from '@funnelai/types';
import { CodegenService } from '../services/codegen';
import { DeploymentService } from '../services/deployment';

const connection = new Redis(process.env.UPSTASH_REDIS_URL || 'redis://localhost:6379');

export class BuildQueue {
  private queue: Queue;
  private worker?: Worker;

  constructor() {
    this.queue = new Queue('builds', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
  }

  async addBuildJob(config: BuildConfig) {
    return this.queue.add('build', config);
  }

  startWorker() {
    this.worker = new Worker(
      'builds',
      async (job: Job) => {
        const config = job.data as BuildConfig;
        const logs: string[] = [];

        const log = (message: string) => {
          const timestamp = new Date().toISOString();
          const logEntry = `[${timestamp}] ${message}`;
          logs.push(logEntry);
          console.log(logEntry);

          // Update build with latest logs periodically
          if (logs.length % 5 === 0) {
            this.updateBuildLogs(config.buildId!, logs).catch(console.error);
          }
        };

        try {
          log('Build started');
          await this.updateBuildStatus(config.buildId!, 'RUNNING', undefined, logs);

          log('Initializing services');
          const codegen = new CodegenService();
          const deploymentService = new DeploymentService();

          log('Generating site from template');
          await job.updateProgress(20);
          const codegenResult = await codegen.generateSite(config);

          if (!codegenResult.success) {
            throw new Error(codegenResult.error);
          }
          log('Site generation complete');

          log('Starting deployment process');
          await job.updateProgress(60);
          const deployResult = await deploymentService.deploy(config);

          if (!deployResult.success) {
            throw new Error(deployResult.error);
          }

          // Merge deployment logs
          if (deployResult.logs) {
            logs.push(...deployResult.logs);
          }
          log(`Deployment successful: ${deployResult.url}`);

          await job.updateProgress(90);
          await this.updateBuildStatus(
            config.buildId!,
            'SUCCESS',
            deployResult.url,
            logs,
            undefined,
            deployResult.commitSha
          );

          await prisma.project.update({
            where: { id: config.projectId },
            data: {
              status: 'DEPLOYED',
              vercelUrl: deployResult.url,
            },
          });

          log('Build completed successfully');
          await job.updateProgress(100);
          return deployResult;
        } catch (error: any) {
          log(`Build failed: ${error.message}`);
          await this.updateBuildStatus(
            config.buildId!,
            'FAILED',
            undefined,
            logs,
            error.message
          );

          await prisma.project.update({
            where: { id: config.projectId },
            data: {
              status: 'FAILED',
            },
          });

          throw error;
        }
      },
      {
        connection,
        concurrency: 3,
      }
    );

    this.worker.on('completed', (job) => {
      console.log(`Build ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Build ${job?.id} failed:`, err);
    });

    return this.worker;
  }

  private async updateBuildStatus(
    buildId: string,
    status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED',
    vercelDeployUrl?: string,
    logs?: string[],
    error?: string,
    commitSha?: string
  ) {
    await prisma.build.update({
      where: { id: buildId },
      data: {
        status,
        vercelDeployUrl,
        commitSha,
        logs: logs?.join('\n'),
        error,
        finishedAt: status === 'SUCCESS' || status === 'FAILED' ? new Date() : undefined,
      },
    });
  }

  private async updateBuildLogs(buildId: string, logs: string[]) {
    await prisma.build.update({
      where: { id: buildId },
      data: {
        logs: logs.join('\n'),
      },
    });
  }

  async stop() {
    if (this.worker) {
      await this.worker.close();
    }
    await this.queue.close();
  }
}