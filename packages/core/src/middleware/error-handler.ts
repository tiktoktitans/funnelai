import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class ErrorHandler {
  static handle(error: unknown): NextResponse {
    console.error('Error:', error);

    if (error instanceof ZodError) {
      return this.handleValidationError(error);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(error);
    }

    if (error instanceof Error) {
      return this.handleGenericError(error);
    }

    return this.handleUnknownError();
  }

  private static handleValidationError(error: ZodError): NextResponse {
    const errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return NextResponse.json(
      {
        error: 'Validation failed',
        message: 'The provided data is invalid',
        errors,
      },
      { status: 400 }
    );
  }

  private static handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError
  ): NextResponse {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: 'Duplicate entry',
            message: 'A record with this value already exists',
            field: error.meta?.target,
          },
          { status: 409 }
        );

      case 'P2025':
        return NextResponse.json(
          {
            error: 'Record not found',
            message: 'The requested record does not exist',
          },
          { status: 404 }
        );

      case 'P2003':
        return NextResponse.json(
          {
            error: 'Foreign key constraint',
            message: 'Referenced record does not exist',
            field: error.meta?.field_name,
          },
          { status: 400 }
        );

      default:
        return NextResponse.json(
          {
            error: 'Database error',
            message: 'A database error occurred',
            code: error.code,
          },
          { status: 500 }
        );
    }
  }

  private static handleGenericError(error: Error): NextResponse {
    const statusCode = this.getStatusCode(error);

    return NextResponse.json(
      {
        error: error.name || 'Error',
        message: error.message || 'An error occurred',
      },
      { status: statusCode }
    );
  }

  private static handleUnknownError(): NextResponse {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }

  private static getStatusCode(error: Error): number {
    if (error.message.includes('not found')) return 404;
    if (error.message.includes('unauthorized')) return 401;
    if (error.message.includes('forbidden')) return 403;
    if (error.message.includes('bad request')) return 400;
    if (error.message.includes('conflict')) return 409;
    return 500;
  }

  static async withErrorHandling<T>(
    fn: () => Promise<T>
  ): Promise<T | NextResponse> {
    try {
      return await fn();
    } catch (error) {
      return this.handle(error);
    }
  }

  static createAPIHandler<T extends Record<string, any>>(
    handler: (
      request: Request,
      context?: T
    ) => Promise<NextResponse>
  ) {
    return async (request: Request, context?: T) => {
      try {
        return await handler(request, context);
      } catch (error) {
        return this.handle(error);
      }
    };
  }
}