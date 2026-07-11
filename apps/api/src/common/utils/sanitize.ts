import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  allowedSchemes: [],
  disallowedTagsMode: 'discard',
  enforceHtmlBoundary: true,
};

export function sanitizeStrings<T>(obj: T): T {
  if (typeof obj === 'string') return sanitizeHtml(obj, SANITIZE_OPTIONS) as unknown as T;
  if (Array.isArray(obj)) return obj.map((item) => sanitizeStrings(item)) as unknown as T;
  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      sanitized[key] = sanitizeStrings(val);
    }
    return sanitized as T;
  }
  return obj;
}
