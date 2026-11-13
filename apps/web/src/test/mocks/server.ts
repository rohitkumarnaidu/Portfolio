import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for the Node/jsdom test environment.
 *
 * Lifecycle is wired into `src/test/setup.tsx` (listen / resetHandlers / close).
 */
export const server = setupServer(...handlers);
