import { SetMetadata } from '@nestjs/common';
import type { AuditAction, AuditResource } from './audit.enums';

export const AUDIT_KEY = 'audit';
export interface AuditMetadata {
  action: AuditAction | string;
  resource: AuditResource | string;
}
export const Audit = (metadata: AuditMetadata) => SetMetadata(AUDIT_KEY, metadata);
