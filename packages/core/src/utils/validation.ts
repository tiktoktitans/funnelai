import { z } from 'zod';

export class ValidationUtils {
  static email = z.string().email('Invalid email address');

  static url = z.string().url('Invalid URL');

  static uuid = z.string().uuid('Invalid UUID');

  static hexColor = z.string().regex(
    /^#[0-9A-F]{6}$/i,
    'Invalid hex color (e.g., #FF6B00)'
  );

  static phoneNumber = z.string().regex(
    /^\+?[1-9]\d{1,14}$/,
    'Invalid phone number'
  );

  static slug = z.string().regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Invalid slug (lowercase letters, numbers, and hyphens only)'
  );

  static password = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, and special character'
    );

  static apiKey = z.string().regex(
    /^fai_[a-f0-9]{64}$/,
    'Invalid API key format'
  );

  static sanitizeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static isValidDomain(domain: string): boolean {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(domain);
  }

  static validateFileType(
    filename: string,
    allowedTypes: string[]
  ): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }

  static validateFileSize(
    sizeInBytes: number,
    maxSizeInMB: number
  ): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return sizeInBytes <= maxSizeInBytes;
  }

  static validateJSON(jsonString: string): {
    valid: boolean;
    data?: any;
    error?: string;
  } {
    try {
      const data = JSON.parse(jsonString);
      return { valid: true, data };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  static paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  });

  static filterXSS(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>/gi, '');
  }

  static isStrongPassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}