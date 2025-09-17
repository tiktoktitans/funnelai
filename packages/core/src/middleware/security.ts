import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export class SecurityMiddleware {
  private static readonly CSP_HEADER = {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-src 'self' https://calendly.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  };

  private static readonly SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };

  static applyHeaders(response: NextResponse): NextResponse {
    Object.entries({
      ...this.SECURITY_HEADERS,
      ...this.CSP_HEADER,
    }).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  static validateOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'http://localhost:3000',
      'https://vercel.app',
    ];

    if (!origin) return true;

    return allowedOrigins.some(allowed =>
      allowed && origin.startsWith(allowed)
    );
  }

  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static validateCSRFToken(token: string, sessionToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(sessionToken)
    );
  }

  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (input && typeof input === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeInput(key)] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash));
  }
}