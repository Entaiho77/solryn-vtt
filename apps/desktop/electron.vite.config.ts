import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

const here = fileURLToPath(new URL('.', import.meta.url)); // apps/desktop/
const repoRoot = resolve(here, '../..'); // monorepo root
const pkg = (name: string) => resolve(repoRoot, `packages/${name}/src`);

// Same @solryn/* source aliases the web app uses — the renderer reuses apps/web verbatim, so the
// shared packages must resolve identically here.
const solrynAlias = [
  { find: /^@solryn\/shared-types$/, replacement: `${pkg('shared-types')}/index.ts` },
  { find: /^@solryn\/shared-types\//, replacement: `${pkg('shared-types')}/` },
  { find: /^@solryn\/engine$/, replacement: `${pkg('engine')}/index.ts` },
  { find: /^@solryn\/engine\//, replacement: `${pkg('engine')}/` },
  { find: /^@solryn\/systems$/, replacement: `${pkg('systems')}/index.ts` },
  { find: /^@solryn\/systems\//, replacement: `${pkg('systems')}/` },
  { find: /^@solryn\/protocol$/, replacement: `${pkg('protocol')}/index.ts` },
  { find: /^@solryn\/protocol\//, replacement: `${pkg('protocol')}/` },
];

// electron-vite drives three builds from one config: the Electron main process, the preload
// bridge, and the renderer (the reused React UI from apps/web). No UI code is duplicated.
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(here, 'out/main'),
      // Named 'index' input → out/main/index.js (matches package.json "main").
      rollupOptions: { input: { index: resolve(here, 'electron/main.ts') } },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(here, 'out/preload'),
      // Named 'index' input → out/preload/index.js (matches main.ts's preload path).
      rollupOptions: { input: { index: resolve(here, 'electron/preload.ts') } },
    },
  },
  renderer: {
    root: here,
    plugins: [react()],
    resolve: { alias: solrynAlias },
    // Allow the dev server to serve the reused apps/web sources + shared packages (outside this dir).
    server: { fs: { allow: [repoRoot] } },
    build: {
      outDir: resolve(here, 'out/renderer'),
      rollupOptions: { input: resolve(here, 'index.html') },
    },
  },
});
