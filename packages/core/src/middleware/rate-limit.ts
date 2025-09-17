import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

const redis = new Redis(process.env.UPSTASH_REDIS_URL || 'redis://localhost:6379');

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: 60000,
      maxRequests: 60,
      keyPrefix: 'rate_limit',
      ...config,
    };
  }

  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const window = Math.floor(now / this.config.windowMs);
    const windowKey = `${key}:${window}`;

    const pipeline = redis.pipeline();
    pipeline.incr(windowKey);
    pipeline.expire(windowKey, Math.ceil(this.config.windowMs / 1000));

    const results = await pipeline.exec();
    const count = results?.[0]?.[1] as number || 1;

    const allowed = count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - count);
    const resetAt = new Date((window + 1) * this.config.windowMs);

    return { allowed, remaining, resetAt };
  }

  async middleware(
    request: NextRequest
  ): Promise<NextResponse | undefined> {
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const { allowed, remaining, resetAt } = await this.checkLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          resetAt: resetAt.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': this.config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetAt.toISOString(),
            'Retry-After': Math.ceil(
              (resetAt.getTime() - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    return undefined;
  }

  static createAPILimiter() {
    return new RateLimiter({
      windowMs: 60000,
      maxRequests: 100,
      keyPrefix: 'api',
    });
  }

  static createAuthLimiter() {
    return new RateLimiter({
      windowMs: 900000,
      maxRequests: 5,
      keyPrefix: 'auth',
    });
  }

  static createBuildLimiter() {
    return new RateLimiter({
      windowMs: 3600000,
      maxRequests: 10,
      keyPrefix: 'build',
    });
  }
}