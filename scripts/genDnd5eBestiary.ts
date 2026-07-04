// Generate src/systems/dnd5e/bestiary.generated.ts from data/srd-monsters-5e.json
// (the raw 5e-bits/5e-database SRD monsters — RAW 5e stat blocks, NOT the Solryn-compressed
// data/bestiary-source.json). Produces 5e-shaped BestiaryEntry[]: AC/HP/CR/saves in stats,
// to-hit attacks (attack_bonus present) in attacks[], and everything else (passive traits,
// Multiattack, breath weapons, legendary actions) in abilities[] as display text.
//
//   npm run gen:bestiary5e
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const srcPath = resolve(root, 'data/srd-monsters-5e.json');
const outPath = resolve(root, 'src/systems/dnd5e/bestiary.generated.ts');

interface DamageOption {
  damage_dice?: string;
  damage_type?: { name?: string };
}
interface Damage {
  damage_dice?: string;
  damage_type?: { name?: string };
  // Versatile/choice weapons store options here instead of a flat damage_dice.
  from?: { options?: DamageOption[] };
}

/** Effective dice + type for a damage entry, resolving the versatile `choose` form (first option). */
function effDamage(d: Damage): { dice: string; type: string } | null {
  const opt = d.damage_dice ? d : d.from?.options?.[0];
  if (!opt?.damage_dice) return null;
  return { dice: opt.damage_dice, type: opt.damage_type?.name ?? '' };
}
interface ActionDc {
  dc_type?: { name?: string };
  dc_value?: number;
  success_type?: string;
}
interface Action {
  name: string;
  desc?: string;
  attack_bonus?: number;
  damage?: Damage[];
  dc?: ActionDc;
}
interface Trait {
  name: string;
  desc?: string;
}
interface Prof {
  value: number;
  proficiency: { index: string; name: string };
}
interface Monster {
  index: string;
  name: string;
  size?: string;
  type: string;
  subtype?: string;
  armor_class?: { value: number }[];
  hit_points: number;
  hit_dice?: string;
  speed?: Record<string, string | boolean>;
  challenge_rating: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies?: Prof[];
  special_abilities?: Trait[];
  actions?: Action[];
  legendary_actions?: Trait[];
}

const data = JSON.parse(readFileSync(srcPath, 'utf8')) as Monster[];

// The SRD source mistags these abilities success_type:"none"; 5e rules make them save-for-half.
// Keyed "<creatureIndex>::<actionName>" — audited individually, NOT a blanket rule (e.g.
// Gelatinous Cube Engulf / Water Elemental Whelm are correctly avoid-on-success and excluded).
// Applied only where the source still says success_type === 'none'.
const SAVE_HALF_CORRECTIONS = new Set([
  'adult-red-dragon::Fire Breath', // dragon breath weapon — half on a successful save
  'ancient-white-dragon::Cold Breath', // dragon breath weapon — half on a successful save
  'green-dragon-wyrmling::Poison Breath', // dragon breath weapon — half on a successful save
  'winter-wolf::Cold Breath', // breath weapon — half on a successful save
]);
let correctedCount = 0;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function speedStr(speed?: Record<string, string | boolean>): string {
  if (!speed) return '—';
  const parts: string[] = [];
  for (const [mode, val] of Object.entries(speed)) {
    if (mode === 'hover') continue;
    if (typeof val !== 'string') continue;
    parts.push(mode === 'walk' ? val : `${mode} ${val}`);
  }
  if (speed.hover) parts.push('(hover)');
  return parts.join(', ') || '—';
}

function crLabel(cr: number): string {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return String(cr);
}

function savesStr(profs?: Prof[]): string {
  const saves = (profs ?? []).filter((p) => p.proficiency.index.startsWith('saving-throw-'));
  if (!saves.length) return '';
  return saves
    .map((p) => `${p.proficiency.name.replace('Saving Throw: ', '')} ${p.value >= 0 ? '+' : ''}${p.value}`)
    .join(', ');
}

/** A to-hit attack iff it has an attack_bonus AND a rollable damage die (incl. versatile). */
function isAttack(a: Action): boolean {
  return a.attack_bonus != null && (a.damage ?? []).some((d) => effDamage(d));
}

function toAttack(a: Action) {
  const dmgs = (a.damage ?? []).map(effDamage).filter((d): d is { dice: string; type: string } => !!d);
  const primary = dmgs[0];
  const extras = dmgs
    .slice(1)
    .map((d) => `+ ${d.dice} ${d.type.toLowerCase()}`.trim())
    .join(' ');
  return {
    name: a.name,
    diceExpr: primary.dice,
    damageType: primary.type,
    attackBonus: a.attack_bonus as number,
    ...(extras ? { note: extras } : {}),
  };
}

const traitStr = (t: Trait, tag = '') =>
  `${t.name}${tag}${t.desc ? `: ${t.desc}` : ''}`.replace(/\s+/g, ' ').trim();

const flags: string[] = [];
let attackCount = 0;

const entries = data.map((m) => {
  const ac = m.armor_class?.[0]?.value;
  if (ac == null) flags.push(`${m.index}: missing AC`);
  if (m.hit_points == null) flags.push(`${m.index}: missing HP`);

  const actions = m.actions ?? [];
  const attacks = actions.filter(isAttack).map(toAttack);
  if (attacks.length) attackCount++;
  else if (actions.length) flags.push(`${m.index}: no to-hit attack (${actions.length} action(s) → abilities)`);

  // Everything that isn't a to-hit attack becomes display-only ability text.
  const abilities = [
    ...(m.special_abilities ?? []).map((t) => traitStr(t)),
    ...actions.filter((a) => !isAttack(a)).map((a) => traitStr(a)),
    ...(m.legendary_actions ?? []).map((t) => traitStr(t, ' (Legendary)')),
  ];

  // Structured save info (DC + ability + success) from actions that force a save.
  const saves = actions
    .filter((a) => a.dc?.dc_type?.name && typeof a.dc.dc_value === 'number')
    .map((a) => {
      const corrected =
        a.dc!.success_type === 'none' && SAVE_HALF_CORRECTIONS.has(`${m.index}::${a.name}`);
      if (corrected) correctedCount++;
      return {
        name: a.name,
        ability: a.dc!.dc_type!.name as string,
        dc: a.dc!.dc_value as number,
        success: corrected || a.dc!.success_type === 'half' ? 'half' : 'none',
      };
    });

  return {
    id: m.index,
    name: m.name,
    category: 'creature',
    ...(m.size ? { size: m.size } : {}),
    stats: {
      ac: ac ?? 10,
      hp: m.hit_points ?? 0,
      hd: m.hit_dice ?? '',
      speed: speedStr(m.speed),
      type: m.subtype ? `${cap(m.type)} (${cap(m.subtype)})` : cap(m.type),
      cr: m.challenge_rating,
      crLabel: crLabel(m.challenge_rating),
      str: m.strength,
      dex: m.dexterity,
      con: m.constitution,
      int: m.intelligence,
      wis: m.wisdom,
      cha: m.charisma,
      saves: savesStr(m.proficiencies),
    },
    ...(abilities.length ? { abilities } : {}),
    ...(saves.length ? { saves } : {}),
    ...(attacks.length ? { attacks } : {}),
  };
});

const header = `// AUTO-GENERATED — do not edit by hand.
// Produced by scripts/genDnd5eBestiary.ts from data/srd-monsters-5e.json (raw 5e SRD stat
// blocks from 5e-bits/5e-database). This is the 5e bestiary — independent of Solryn's
// Solryn-compressed bestiary.generated.ts. Regenerate with: npm run gen:bestiary5e
import type { BestiaryEntry } from '../../engine/schema';

export const generatedBestiary: BestiaryEntry[] = `;

writeFileSync(outPath, header + JSON.stringify(entries, null, 2) + ';\n');
console.log(`Wrote ${entries.length} creatures (${attackCount} with to-hit attacks) -> ${outPath}`);
console.log(`save-for-half corrections applied: ${correctedCount} (of ${SAVE_HALF_CORRECTIONS.size} listed)`);
console.log(`\nFlags (${flags.length}):`);
for (const f of flags) console.log('  ' + f);
