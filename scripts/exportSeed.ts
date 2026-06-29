/**
 * Exports the system definitions to `seed/systems.json` for seeding a fresh Realtime
 * Database at `/systems`. The bundled registry is the single source of truth, so this
 * export is always in sync with the app's canonical Solryn data.
 *
 * Run: `npm run seed:export` (uses vite-node so it resolves the app's TS imports).
 * Push: `firebase database:set /systems ./seed/systems.json` (see docs/FIREBASE_SETUP.md).
 *
 * Note: the app BUNDLES the system data, so it never boots into a system-less void; this
 * DB seed is for completeness, server-side reference, and the future custom-system builder.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSystem, listSystems } from '../src/systems/registry';

const systems: Record<string, unknown> = {};
for (const summary of listSystems()) {
  systems[summary.id] = getSystem(summary.id);
}

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../seed');
mkdirSync(outDir, { recursive: true });

const outFile = resolve(outDir, 'systems.json');
writeFileSync(outFile, JSON.stringify(systems, null, 2));

console.log(
  `Wrote ${outFile}\n  systems: ${Object.keys(systems).join(', ')}`,
);
