import { Logger } from '@nestjs/common';

export function SentryTrace(name?: string) {
  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const logger = new Logger('SentryTrace');
    const spanName = name || `${_target.constructor?.name || ''}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      try {
        const Sentry = require('@sentry/node');
        if (Sentry.getCurrentHub) {
          const scope = Sentry.getCurrentHub().getScope();
          const transaction = scope?.getTransaction();
          if (transaction) {
            const span = transaction.startChild({ op: 'service', description: spanName });
            try {
              const result = await originalMethod.apply(this, args);
              span.setStatus('ok');
              return result;
            } catch (err) {
              span.setStatus('internal_error');
              Sentry.captureException(err);
              throw err;
            } finally {
              span.finish();
            }
          }
        }
      } catch {
        logger.warn(`Sentry not available for tracing: ${spanName}`);
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
