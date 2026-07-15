import type { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';
import type { ActivitiesService } from '../../modules/activities/activities.service';
import type { AuditMetadata } from '../decorators/audit.decorator';
import { AUDIT_KEY } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly activities: ActivitiesService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const audit = this.reflector.getAllAndOverride<AuditMetadata>(AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!audit) return next.handle();

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(() => {
        const resourceId = request.params?.id;
        this.activities
          .log(audit.action, audit.resource, user?.id || 'system', resourceId)
          .catch(() => {});
      }),
    );
  }
}
