// Generate src/systems/dnd5e/spells.generated.ts from the raw 5e-bits/5e-database SRD spells
// JSON. All 319 SRD spells, every level including cantrips (level 0), with per-spell school,
// components, duration, concentration/ritual flags, save/attack type, damage + scaling, and the
// class spell lists. No slot tracking or casting logic — that's G2–G4.
//
//   npm run gen:spells5e
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const src = JSON.parse(readFileSync(resolve(root, 'data/srd-spells-5e.json'), 'utf8'));
const outPath = resolve(root, 'src/systems/dnd5e/spells.generated.ts');

/** Normalize SRD dice strings ("3d4 + 3" → "3d4+3") so the roller can parse them later. */
const dice = (d: string) => d.replace(/\s+/g, '');

const flags: string[] = [];

const spells = src.map((sp: any) => {
  const comps: string[] = sp.components ?? [];
  const slotMap = sp.damage?.damage_at_slot_level as Record<string, string> | undefined;
  const charMap = sp.damage?.damage_at_character_level as Record<string, string> | undefined;

  // Base dice = the entry at this spell's own level (slot spells) or level 1 (cantrips).
  const baseFromSlot = slotMap?.[String(sp.level)];
  const baseFromChar = charMap?.['1'];
  const baseDice = baseFromSlot ?? baseFromChar ?? null;
  if (sp.damage && !slotMap && !charMap) flags.push(`${sp.index}: damage block with no scaling map`);
  if (sp.level < 0 || sp.level > 9) flags.push(`${sp.index}: unexpected level ${sp.level}`);

  const scaling: Record<string, Record<string, string>> = {};
  if (slotMap) scaling.bySlotLevel = Object.fromEntries(Object.entries(slotMap).map(([k, v]) => [k, dice(v)]));
  if (charMap) scaling.byCharacterLevel = Object.fromEntries(Object.entries(charMap).map(([k, v]) => [k, dice(v)]));

  const higher = (sp.higher_level ?? []).join('\n');
  const damageType = sp.damage?.damage_type?.name;

  return {
    id: sp.index,
    name: sp.name,
    // Inherited Spell fields (5e values): offensive if it deals damage or is an attack.
    type: sp.damage || sp.attack_type ? 'offensive' : 'utility',
    damageDice: baseDice ? dice(baseDice) : null,
    ...(damageType ? { damageType } : {}),
    cost: 0,
    range: sp.range,
    duration: sp.duration,
    // 5e fields.
    level: sp.level,
    school: sp.school?.name ?? '',
    castingTime: sp.casting_time,
    components: { v: comps.includes('V'), s: comps.includes('S'), m: comps.includes('M') },
    ...(sp.material ? { material: sp.material } : {}),
    concentration: !!sp.concentration,
    ritual: !!sp.ritual,
    classes: (sp.classes ?? []).map((c: any) => c.index),
    description: (sp.desc ?? []).join('\n'),
    ...(higher ? { higherLevel: higher } : {}),
    ...(sp.dc?.dc_type?.name ? { save: sp.dc.dc_type.name } : {}),
    ...(sp.dc?.dc_success ? { saveSuccess: sp.dc.dc_success } : {}),
    ...(sp.attack_type ? { attackType: sp.attack_type } : {}),
    ...(Object.keys(scaling).length ? { scaling } : {}),
  };
});

const header = `// AUTO-GENERATED — do not edit by hand.
// Produced by scripts/genDnd5eSpells.ts from data/srd-spells-5e.json (5e-bits/5e-database).
// All ${spells.length} SRD spells (levels 0–9), with school, components, duration, concentration/
// ritual, save/attack type, damage + scaling, and class spell lists. Regenerate with:
// npm run gen:spells5e
import type { Dnd5eSpell } from '../../engine/schema';

export const generatedSpells: Dnd5eSpell[] = `;

writeFileSync(outPath, header + JSON.stringify(spells, null, 2) + ';\n');
console.log(`Wrote ${spells.length} spells -> ${outPath}`);
console.log('Flags:', flags.length ? '\n  ' + flags.join('\n  ') : 'none');
