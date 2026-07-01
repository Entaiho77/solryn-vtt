// Generate src/systems/dnd5e/classes.generated.ts from the raw 5e-bits/5e-database SRD
// classes + levels JSON. Accurate 1–20 tables (prof bonus, features, ASI levels, class
// counters) pulled from the source, not hand-guessed. No spellcasting slots are emitted this
// phase — full-casters get their chassis (hit die, proficiencies, spellcasting ability) and
// the casting subsystem regenerates slots later.
//
//   npm run gen:classes5e
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const classesSrc = JSON.parse(readFileSync(resolve(root, 'data/srd-classes-5e.json'), 'utf8'));
const levelsSrc = JSON.parse(readFileSync(resolve(root, 'data/srd-levels-5e.json'), 'utf8'));
const outPath = resolve(root, 'src/systems/dnd5e/classes.generated.ts');

// Canonical facts the SRD JSON doesn't encode cleanly.
const PRIMARY: Record<string, string[]> = {
  barbarian: ['STR'], bard: ['CHA'], cleric: ['WIS'], druid: ['WIS'], fighter: ['STR', 'DEX'],
  monk: ['DEX', 'WIS'], paladin: ['STR', 'CHA'], ranger: ['DEX', 'WIS'], rogue: ['DEX'],
  sorcerer: ['CHA'], warlock: ['CHA'], wizard: ['INT'],
};
const PREPARED = new Set(['cleric', 'druid', 'paladin', 'wizard']); // else 'known'
const SUBCLASS_LEVEL: Record<string, number> = {
  barbarian: 3, bard: 3, cleric: 1, druid: 2, fighter: 3, monk: 3, paladin: 3, ranger: 3,
  rogue: 3, sorcerer: 1, warlock: 1, wizard: 2,
};
// Unarmored Defense: 10 + DEX + this ability's mod (when no armor is worn).
const UNARMORED_DEFENSE: Record<string, string> = { barbarian: 'CON', monk: 'WIS' };
// Thematic starting kit (weapon ids + optional armor id) — ids must exist in dnd5e equipment.
const STARTER_KIT: Record<string, { weaponIds: string[]; armorId?: string }> = {
  fighter: { weaponIds: ['longsword'], armorId: 'chain-mail' },
  barbarian: { weaponIds: ['greataxe'] }, // no armor → Unarmored Defense
  rogue: { weaponIds: ['rapier', 'shortbow'], armorId: 'leather-armor' },
  monk: { weaponIds: ['quarterstaff'] }, // no armor → Unarmored Defense
  paladin: { weaponIds: ['longsword'], armorId: 'chain-mail' },
  ranger: { weaponIds: ['shortsword', 'shortbow'], armorId: 'leather-armor' },
};
const DEFAULT_KIT = { weaponIds: ['dagger'], armorId: 'leather-armor' }; // casters (pending)

const up = (s: string) => s.toUpperCase();

function proficiencies(list: { index: string }[]) {
  const armor: string[] = [];
  const weapons: string[] = [];
  const tools: string[] = [];
  for (const p of list) {
    const i = p.index;
    if (i.startsWith('saving-throw')) continue;
    if (/armor$|^shields$/.test(i)) armor.push(i.replace(/-armor$/, '')); // light-armor → light
    else if (/tools|kit|instrument|supplies|vehicles/.test(i)) tools.push(i);
    else if (i.endsWith('-weapons')) weapons.push(i.replace(/-weapons$/, '')); // simple-weapons → simple
    else weapons.push(i); // specific weapons (longswords, rapiers, …)
  }
  return { armor, weapons, tools };
}

function skillChoices(cls: { proficiency_choices?: { choose: number; from?: { options?: { item?: { index: string } }[] } }[] }) {
  const choice = (cls.proficiency_choices ?? []).find((c) =>
    (c.from?.options ?? []).some((o) => o.item?.index?.startsWith('skill-')),
  );
  if (!choice) return { choose: 0, from: [] as string[] };
  const from = (choice.from?.options ?? [])
    .map((o) => o.item?.index)
    .filter((i): i is string => !!i && i.startsWith('skill-'))
    .map((i) => i.replace('skill-', ''));
  return { choose: choice.choose, from };
}

function counters(cs: Record<string, unknown> | undefined): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  for (const [k, v] of Object.entries(cs ?? {})) {
    if (typeof v === 'number') {
      if (v !== 0) out[k] = v;
    } else if (v && typeof v === 'object' && 'dice_count' in v) {
      const d = v as { dice_count: number; dice_value: number };
      if (d.dice_count > 0) out[k] = `${d.dice_count}d${d.dice_value}`;
    }
  }
  return out;
}

const flags: string[] = [];

const classes = classesSrc.map((c: any) => {
  const rows = levelsSrc
    .filter((l: any) => l.class?.index === c.index && !l.subclass)
    .sort((a: any, b: any) => a.level - b.level);
  if (rows.length !== 20) flags.push(`${c.index}: ${rows.length} level rows (expected 20)`);

  let prevAsi = 0;
  const levels = rows.map((r: any) => {
    const cum = r.ability_score_bonuses ?? 0;
    const isAsi = cum > prevAsi;
    prevAsi = cum;
    const ctr = counters(r.class_specific);
    // Spell slots: SRD encodes spell_slots_level_1..9. Store as number[] indexed by (slot
    // level − 1), trimmed of trailing zeros. Warlock's rows carry its Pact Magic counts.
    const sc = r.spellcasting ?? {};
    const slotArr: number[] = [];
    for (let i = 1; i <= 9; i++) slotArr.push(sc[`spell_slots_level_${i}`] ?? 0);
    while (slotArr.length && slotArr[slotArr.length - 1] === 0) slotArr.pop();
    return {
      level: r.level,
      proficiencyBonus: r.prof_bonus,
      features: (r.features ?? []).map((f: any) => f.name ?? f.index),
      ...(isAsi ? { abilityScoreImprovement: true } : {}),
      ...(slotArr.length ? { spellSlots: slotArr } : {}),
      ...(sc.cantrips_known ? { cantripsKnown: sc.cantrips_known } : {}),
      ...(sc.spells_known ? { spellsKnown: sc.spells_known } : {}),
      ...(Object.keys(ctr).length ? { counters: ctr } : {}),
    };
  });

  const cls: any = {
    id: c.index,
    name: c.name,
    hitDie: `d${c.hit_die}`,
    primaryAbilities: PRIMARY[c.index] ?? [],
    savingThrows: (c.saving_throws ?? []).map((s: any) => up(s.index)),
    proficiencies: proficiencies(c.proficiencies ?? []),
    skillChoices: skillChoices(c),
    startingEquipment: (c.starting_equipment ?? []).map(
      (e: any) => `${e.quantity > 1 ? `${e.quantity}× ` : ''}${e.equipment?.name ?? ''}`.trim(),
    ),
    levels,
    subclassLevel: SUBCLASS_LEVEL[c.index],
    subclasses: [],
    starterKit: STARTER_KIT[c.index] ?? DEFAULT_KIT,
    ...(UNARMORED_DEFENSE[c.index] ? { unarmoredDefense: { ability: UNARMORED_DEFENSE[c.index] } } : {}),
  };
  if (c.spellcasting) {
    cls.spellcasting = {
      ability: up(c.spellcasting.spellcasting_ability?.index ?? 'int'),
      // Wizard = spellbook; the SRD's other prepared casters = prepared; the rest = known.
      type: c.index === 'wizard' ? 'spellbook' : PREPARED.has(c.index) ? 'prepared' : 'known',
    };
  }
  return cls;
});

const header = `// AUTO-GENERATED — do not edit by hand.
// Produced by scripts/genDnd5eClasses.ts from data/srd-classes-5e.json + data/srd-levels-5e.json
// (5e-bits/5e-database). Accurate 1–20 tables (prof bonus, features, ASI levels, counters).
// No spell slots emitted yet — the casting subsystem regenerates those. Regenerate with:
// npm run gen:classes5e
import type { ClassDefinition } from '../../engine/schema';

export const generatedClasses: ClassDefinition[] = `;

writeFileSync(outPath, header + JSON.stringify(classes, null, 2) + ';\n');
console.log(`Wrote ${classes.length} classes -> ${outPath}`);
console.log('Flags:', flags.length ? '\n  ' + flags.join('\n  ') : 'none');
