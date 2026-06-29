import type { SystemDefinition } from '../engine/schema';
import { solrynSystem } from './solryn';

/**
 * The system registry — the app's menu of available presets. Today it holds only Solryn.
 * Adding a system = registering another SystemDefinition here; "Custom" (the deferred
 * builder) will eventually register a user-built definition the same way. The create-game
 * picker, header badge, and rules reference all read from here, never from Solryn directly.
 */
const systems: Record<string, SystemDefinition> = {
  [solrynSystem.id]: solrynSystem,
};

export interface SystemSummary {
  id: string;
  name: string;
  glyph: string;
  color: string;
  tagline?: string;
}

/** Resolve a full system definition by id (used once a game's systemId is known). */
export function getSystem(systemId: string): SystemDefinition | undefined {
  return systems[systemId];
}

/** Like getSystem, but throws — for call sites that require a valid system. */
export function requireSystem(systemId: string): SystemDefinition {
  const system = systems[systemId];
  if (!system) throw new Error(`Unknown system: ${systemId}`);
  return system;
}

/** Lightweight list for the create-game picker and lobby badges. */
export function listSystems(): SystemSummary[] {
  return Object.values(systems).map(({ id, name, glyph, color, tagline }) => ({
    id,
    name,
    glyph,
    color,
    tagline,
  }));
}

export const DEFAULT_SYSTEM_ID = solrynSystem.id;
