import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = uuidv4();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: Array<{ field?: string; message: string; code: string }> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'object' && exResponse !== null) {
        const resp = exResponse as Record<string, unknown>;
        message = (resp.message as string) || exception.message;

        if (Array.isArray(resp.message)) {
          details = (resp.message as Array<{ field?: string; message: string; code: string }>);
          message = 'Validation failed';
        }

        code = (resp.error as string) || HttpStatus[status];
      } else {
        message = typeof exResponse === 'string' ? exResponse : exception.message;
        code = HttpStatus[status];
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled: ${exception.message}`,
        exception.stack,
        `[${correlationId}] ${request.method} ${request.url}`,
      );
    }

    if (process.env.SENTRY_DSN && status >= 500) {
      try {
        const Sentry = require('@sentry/node');
        Sentry.captureException(exception, {
          extra: { correlationId, method: request.method, url: request.url },
          user: (request as any).user ? { id: (request as any).user.id, email: (request as any).user.email } : undefined,
        });
      } catch {}
    }

    response.status(status).json({
      error: {
        code,
        message,
        status_code: status,
        details,
        correlation_id: correlationId,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}

