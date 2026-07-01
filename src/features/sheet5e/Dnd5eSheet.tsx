import { useState } from 'react';
import type { SystemDefinition } from '../../engine/schema';
import type { Character } from '../../data/types';
import { describeRoll, getCombatResolver, rollDice } from '../../engine/rules';
import { restoreSpellSlots, setPoolCurrent, setSpellSlot } from '../../data/characters';
import { pcDerived, ABILITY_IDS } from '../../systems/dnd5e/character';
import { Button } from '../../components/ui/Button';
import { ResourceTracker } from '../sheet/ResourceTracker';
import { useRollLog } from '../rolllog/rollLog';
import s from '../board/drawers/drawers.module.css';

const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' };

/**
 * The 5e play sheet (in-game drawer) — selected by system for class-and-level characters; the
 * Solryn CharacterQuickView is untouched. Attacks route through the system's combat resolver
 * (attackRollVsAc) exactly like monsters: d20 + attack bonus vs an entered target AC.
 */
export function Dnd5eSheet({
  system,
  character,
  target,
}: {
  system: SystemDefinition;
  character: Character;
  /** The current click-to-target token (its AC is used when present); undefined → manual AC. */
  target?: { id: string; name: string; ac?: number };
}) {
  const { postRoll } = useRollLog();
  const resolver = getCombatResolver(system);
  const d = pcDerived(system, character);
  const hpCurrent = character.play.pools?.hp?.current ?? d.maxHp;

  const [targetAc, setTargetAc] = useState(13);
  const [advantage, setAdvantage] = useState<'advantage' | 'disadvantage' | undefined>();
  const [sneak, setSneak] = useState(false);
  const [lucky, setLucky] = useState(false);

  // Dragonborn breath weapon — plain damage roll + save note, via the same path as monster
  // abilities (postAbility): never through the attack resolver, so it isn't a to-hit roll.
  const rollBreath = () => {
    if (!d.breath) return;
    const r = rollDice(d.breath.dice);
    const shape = d.breath.shape === 'cone' ? `${d.breath.size} ft cone` : `${d.breath.size} ft line`;
    const line = `${describeRoll(`${character.name} — Breath Weapon`, r, { type: d.breath.damageType })} · ${shape} · DC ${d.breath.dc} DEX save for half (${Math.floor(r.total / 2)})`;
    postRoll(line);
  };

  // A targeted token with a known AC drives the roll (AC read from its stat block, name shown
  // in the log); otherwise fall back to the typed Target AC.
  const usingTarget = target != null && typeof target.ac === 'number';

  const rollAttack = (atk: (typeof d.attacks)[number]) =>
    postRoll(
      resolver.resolveAttack({
        label: usingTarget
          ? `${character.name} → ${target!.name} — ${atk.name}`
          : `${character.name} — ${atk.name}`,
        dice: atk.dice,
        damageType: atk.damageType,
        attackBonus: atk.attackBonus,
        targetAc: usingTarget ? target!.ac : targetAc,
        advantage,
        // Sneak Attack: manual — player enables when it applies (adv / ally adjacent). Doubles on a crit.
        ...(sneak && d.sneakAttackDice ? { bonusDamage: { dice: d.sneakAttackDice, label: 'Sneak Attack' } } : {}),
      }).logText,
    );

  return (
    <div className={s.section}>
      <span className={s.label}>{character.name} · {d.cls?.name ?? 'Adventurer'} {character.play.level}</span>
      {d.raceName && (
        <span className={s.itemMeta}>
          {d.subraceName ? `${d.subraceName} · ` : ''}{d.raceName} · {d.speed} ft speed
        </span>
      )}

      {/* Ability scores + modifiers */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        {ABILITY_IDS.map((id) => (
          <span key={id} className={s.preview} title={id}>
            <strong>{id}</strong> {d.scores[id] ?? 10} ({sign(d.mods[id] ?? 0)})
          </span>
        ))}
      </div>

      {/* Core combat numbers */}
      <div style={row}><span className={s.itemMeta}>Armor Class</span><strong>{d.ac}</strong></div>
      <div style={row}><span className={s.itemMeta}>Proficiency</span><span>{sign(d.proficiencyBonus)}</span></div>
      <ResourceTracker
        label="HP"
        current={hpCurrent}
        max={d.maxHp}
        onChange={(n) => void setPoolCurrent(character.id, 'hp', n)}
      />

      {/* Saving throws */}
      <span className={s.label}>Saving throws</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        {d.saves.map((sv) => (
          <span key={sv.id} className={s.preview} title={sv.proficient ? 'proficient' : undefined}>
            {sv.id} {sign(sv.mod)}{sv.proficient ? ' ●' : ''}
          </span>
        ))}
      </div>

      {/* Skills (proficient) */}
      {d.skills.length > 0 && (
        <>
          <span className={s.label}>Skills</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {d.skills.map((sk) => (
              <span key={sk.id} className={s.preview}>{sk.name} {sign(sk.mod)}</span>
            ))}
          </div>
        </>
      )}

      {/* Attacks — through attackRollVsAc. AC comes from the current target when one is set
          (right-click a creature on the board); otherwise the typed Target AC is the fallback. */}
      <span className={s.label}>Attacks</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        {usingTarget ? (
          <span className={s.itemMeta}>
            Target: <strong>{target!.name}</strong> (AC {target!.ac})
          </span>
        ) : (
          <label className={s.itemMeta} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            {target ? `${target.name} (no AC) — ` : ''}Target AC
            <input type="number" value={targetAc} onChange={(e) => setTargetAc(Number(e.target.value) || 0)} style={{ width: 56 }} />
          </label>
        )}
        <select
          className={s.itemMeta}
          value={advantage ?? 'normal'}
          onChange={(e) => setAdvantage(e.target.value === 'normal' ? undefined : (e.target.value as 'advantage' | 'disadvantage'))}
          aria-label="Roll mode"
        >
          <option value="normal">Normal</option>
          <option value="advantage">Advantage</option>
          <option value="disadvantage">Disadvantage</option>
        </select>
        {d.sneakAttackDice && (
          <label className={s.itemMeta} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }} title="Adds Sneak Attack dice on a hit — enable when it applies (advantage or an ally adjacent).">
            <input type="checkbox" checked={sneak} onChange={(e) => setSneak(e.target.checked)} />
            Sneak Attack ({d.sneakAttackDice})
          </label>
        )}
      </div>
      {!usingTarget && (
        <p className={s.hint}>Right-click a creature on the board to attack its AC automatically.</p>
      )}
      {d.attacks.map((atk) => (
        <div key={atk.name} style={row}>
          <span className={s.itemMeta}>{atk.name}: {sign(atk.attackBonus)} to hit, {atk.dice} {atk.damageType}</span>
          <Button size="sm" onClick={() => rollAttack(atk)}>Roll</Button>
        </div>
      ))}

      {/* Spell slots — resource display only (no Cast button yet; casting is G3). Max comes from
          the class table; current lives on the character (persists via Firebase). */}
      {d.spell && (
        <>
          <span className={s.label}>Spellcasting</span>
          <div style={row}>
            <span className={s.itemMeta}>
              {d.spell.ability} · Save DC {d.spell.saveDc} · Attack {sign(d.spell.attackBonus)}
            </span>
            <Button size="sm" variant="ghost" onClick={() => void restoreSpellSlots(character.id, d.spell!.maxSlots)}>
              Long Rest
            </Button>
          </div>
          {Object.keys(d.spell.maxSlots).length === 0 ? (
            <p className={s.hint}>No spell slots at this level yet.</p>
          ) : (
            Object.entries(d.spell.maxSlots).map(([lvl, max]) => {
              const level = Number(lvl);
              const current = character.play.spellSlots?.[level] ?? max;
              return (
                <div key={lvl} style={row}>
                  <span className={s.itemMeta}>Level {lvl} slots</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Button size="sm" variant="ghost" onClick={() => void setSpellSlot(character.id, level, Math.max(0, current - 1))}>
                      −
                    </Button>
                    <strong>{current}/{max}</strong>
                    <Button size="sm" variant="ghost" onClick={() => void setSpellSlot(character.id, level, Math.min(max, current + 1))}>
                      +
                    </Button>
                  </span>
                </div>
              );
            })
          )}
          {d.cls?.id === 'warlock' && (
            <p className={s.hint}>
              Warlock uses Pact Magic slot counts, but slot recovery here is a placeholder (Long
              Rest). Short-rest recovery arrives with Pact Magic.
            </p>
          )}
        </>
      )}

      {/* Racial traits that affect play: resistances, breath weapon (rollable), Lucky toggle,
          and text notes for passive/flavor traits. */}
      {(d.resistances.length > 0 || d.breath || d.lucky || d.raceTraits.length > 0) && (
        <>
          <span className={s.label}>Racial traits</span>
          {d.resistances.length > 0 && (
            <div style={row}>
              <span className={s.itemMeta}>Damage resistance</span>
              <strong>{d.resistances.join(', ')}</strong>
            </div>
          )}
          {d.breath && (
            <div style={row}>
              <span className={s.itemMeta}>
                Breath Weapon: {d.breath.dice} {d.breath.damageType}, {d.breath.shape === 'cone' ? `${d.breath.size} ft cone` : `${d.breath.size} ft line`} · DC {d.breath.dc} DEX
              </span>
              <Button size="sm" onClick={rollBreath}>Roll</Button>
            </div>
          )}
          {d.lucky && (
            <label
              className={s.itemMeta}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
              title="Halfling Lucky: when you roll a natural 1 on an attack, check, or save, reroll and use the new roll."
            >
              <input type="checkbox" checked={lucky} onChange={(e) => setLucky(e.target.checked)} />
              Lucky (reroll natural 1s)
            </label>
          )}
          {d.raceTraits.map((t, i) => (
            <p key={i} className={s.hint}>{t}</p>
          ))}
        </>
      )}
    </div>
  );
}
