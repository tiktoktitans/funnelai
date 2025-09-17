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

        try {
          await this.updateBuildStatus(config.buildId!, 'RUNNING');

          const codegen = new CodegenService();
          const deploymentService = new DeploymentService();

          await job.updateProgress(20);
          const codegenResult = await codegen.generateSite(config);

          if (!codegenResult.success) {
            throw new Error(codegenResult.error);
          }

          await job.updateProgress(60);
          const deployResult = await deploymentService.deploy(config);

          if (!deployResult.success) {
            throw new Error(deployResult.error);
          }

          await job.updateProgress(90);
          await this.updateBuildStatus(
            config.buildId!,
            'SUCCESS',
            deployResult.url,
            deployResult.logs
          );

          await prisma.project.update({
            where: { id: config.projectId },
            data: {
              status: 'DEPLOYED',
              vercelUrl: deployResult.url,
            },
          });

          await job.updateProgress(100);
          return deployResult;
        } catch (error: any) {
          await this.updateBuildStatus(
            config.buildId!,
            'FAILED',
            undefined,
            undefined,
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
    error?: string
  ) {
    await prisma.build.update({
      where: { id: buildId },
      data: {
        status,
        vercelDeployUrl,
        logs: logs?.join('\n'),
        error,
        finishedAt: status === 'SUCCESS' || status === 'FAILED' ? new Date() : undefined,
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