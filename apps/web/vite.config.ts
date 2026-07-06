/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Resolve a package's src dir to an absolute path (monorepo lives two levels up from apps/web).
const pkg = (name: string) =>
  fileURLToPath(new URL(`../../packages/${name}/src`, import.meta.url));

// Shared packages are consumed as TypeScript SOURCE (no build step). These aliases resolve
// @solryn/* — bare package + any subpath — to the package src, and serve BOTH Vite and Vitest.
const solrynAlias = [
  { find: /^@solryn\/shared-types$/, replacement: `${pkg('shared-types')}/index.ts` },
  { find: /^@solryn\/shared-types\//, replacement: `${pkg('shared-types')}/` },
  { find: /^@solryn\/engine$/, replacement: `${pkg('engine')}/index.ts` },
  { find: /^@solryn\/engine\//, replacement: `${pkg('engine')}/` },
  { find: /^@solryn\/systems$/, replacement: `${pkg('systems')}/index.ts` },
  { find: /^@solryn\/systems\//, replacement: `${pkg('systems')}/` },
];

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { alias: solrynAlias },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Tests live in this app AND in the shared packages; discover both.
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      '../../packages/*/src/**/*.{test,spec}.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      include: ['../../packages/engine/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/__tests__/**'],
    },
  },
});
