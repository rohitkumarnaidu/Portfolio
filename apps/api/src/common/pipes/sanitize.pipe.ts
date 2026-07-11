import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  allowedSchemes: [],
  disallowedTagsMode: 'discard',
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: [],
  allowProtocolRelative: false,
  enforceHtmlBoundary: true,
};

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    if (typeof value === 'string') {
      return sanitizeHtml(value, SANITIZE_OPTIONS);
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.transform(item, _metadata));
    }
    if (value && typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        sanitized[key] = this.transform(val, _metadata);
      }
      return sanitized;
    }
    return value;
  }
}
