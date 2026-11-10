import { SetMetadata } from '@nestjs/common';

export const RAW_RESPONSE_KEY = 'raw_response';

/**
 * Skip the global response envelope for a handler or controller.
 * Use for file downloads, redirects, and streaming responses.
 */
export const Raw = () => SetMetadata(RAW_RESPONSE_KEY, true);
