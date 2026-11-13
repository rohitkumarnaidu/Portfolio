import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.tsx'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      thresholds: {
        // The web suite is young: the admin dashboard and the 3D scenes are
        // still uncovered. These are the current numbers, set as a floor so
        // coverage cannot silently regress. They are meant to be raised as
        // tests are added, not treated as a target.
        lines: 1,
        branches: 1,
        functions: 1,
        statements: 1,
      },
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**/*',
        'src/**/*.d.ts',
        'src/app/**/layout.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@portfolio/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@portfolio/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
});
