// Generate src/systems/solryn/bestiary.generated.ts from data/bestiary-source.json.
//
// Flattens the structured source DB into the flat BestiaryEntry[] the engine
// reads. Only entries marked `provisional` (the bulk SRD + Eribor conversions)
// are emitted; the hand-authored starters in bestiary.ts are left untouched.
//
//   npm run gen:bestiary
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const srcPath = resolve(root, 'data/bestiary-source.json');
const outPath = resolve(root, 'src/systems/solryn/bestiary.generated.ts');

type Speed = { value: number; unit: string; mode: string };
type Attack = { name: string; diceExpr: string; damageType: string; note?: string };
type Ability = { name: string; description?: string };
type SourceCreature = {
  id: string;
  name: string;
  category?: string;
  threatTier: string;
  type: string;
  hp: number;
  dr: number;
  speed: Speed;
  speedSecondary?: Speed;
  speedAlt?: Speed;
  attacks: Attack[];
  abilities: Ability[];
  soulCore: { type: string; dc: number } | null;
  soulCoreNote?: string;
  harvestable?: string;
  native: string[];
  provisional?: boolean;
};

const data = JSON.parse(readFileSync(srcPath, 'utf8')) as { creatures: SourceCreature[] };

function speedStr(c: SourceCreature): string {
  let list = [c.speed, c.speedSecondary ?? c.speedAlt].filter(Boolean) as Speed[];
  // Collapse a same-mode secondary (e.g. base 30 + alt 35 walk) to the higher value.
  if (list.length === 2 && list[0].mode === list[1].mode) {
    list = [list[0].value >= list[1].value ? list[0] : list[1]];
  }
  return list
    .map((s, i) =>
      i === 0 ? (s.mode === 'walk' ? `${s.value}` : `${s.value} ${s.mode}`) : `${s.mode} ${s.value}`
    )
    .join(' / ');
}

function damageStr(attacks: Attack[]): string {
  if (!attacks?.length) return '—';
  return attacks
    .map(
      (a) =>
        `${a.name} ${a.diceExpr} ${a.damageType.toLowerCase()}${a.note ? ` (${a.note})` : ''}`
    )
    .join(' / ');
}

function soulCoreStr(c: SourceCreature): string {
  if (!c.soulCore) return 'none';
  return `${c.soulCore.type} (DC${c.soulCore.dc})${c.soulCoreNote ? ` — ${c.soulCoreNote}` : ''}`;
}

function abilityStrs(abilities: Ability[]): string[] {
  return (abilities ?? []).map((a) => (a.description ? `${a.name}: ${a.description}` : a.name));
}

// Every creature flows through here — the 10 canonical starters and the
// provisional SRD/Eribor conversions — so all runtime entries are uniform.
const entries = data.creatures.map((c) => ({
  id: c.id,
  name: c.name,
  category: c.category ?? 'creature',
  stats: {
    hp: c.hp,
    dr: c.dr,
    speed: speedStr(c),
    damage: damageStr(c.attacks),
    initiativeMod: 0,
    threatLevel: c.threatTier,
    type: c.type,
    soulCore: soulCoreStr(c),
    native: (c.native ?? []).join(', '),
  },
  abilities: [
    ...abilityStrs(c.abilities),
    ...(c.harvestable ? [`Harvestable: ${c.harvestable}`] : []),
  ],
  // Structured rollable attacks, carried through alongside the display string.
  attacks: (c.attacks ?? []).map((a) => ({
    name: a.name,
    diceExpr: a.diceExpr,
    damageType: a.damageType,
    ...(a.note ? { note: a.note } : {}),
  })),
  ...(c.provisional ? { provisional: true } : {}),
}));

const header = `// AUTO-GENERATED — do not edit by hand.
// Produced by scripts/genBestiary.ts from data/bestiary-source.json (all creatures:
// the canonical starters + the SRD/Eribor conversions). Conversions carry
// provisional: true — their soul-core types and TR6+/Legendary bands are best-effort.
// Regenerate with: npm run gen:bestiary
import type { BestiaryEntry } from '../../engine/schema';

export const generatedBestiary: BestiaryEntry[] = `;

writeFileSync(outPath, header + JSON.stringify(entries, null, 2) + ';\n');
console.log(`Wrote ${entries.length} generated creatures -> ${outPath}`);
