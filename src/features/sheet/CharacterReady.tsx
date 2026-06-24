import type { SystemDefinition } from '../../engine/schema';
import type { Character } from '../../data/types';
import { computeDerived, computeModifiers } from '../../engine/rules';
import s from './CharacterReady.module.css';

const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

/**
 * Minimal play-mode view shown after "Finish character". It reads the persisted
 * character back through the generic engine (proving the round-trip). The full §4.6
 * sheet — resource trackers, skills, attacks, spell book — lands in Phase C.
 */
export function CharacterReady({
  system,
  character,
}: {
  system: SystemDefinition;
  character: Character;
}) {
  const scores = character.definition.coreScores;
  const mods = computeModifiers(system, scores);
  const armor = system.equipment.armor.find(
    (a) => a.id === character.play.equippedArmorId,
  );
  const equip = armor
    ? { armor: { dr: armor.dr, speedPenalty: armor.speedPenalty } }
    : undefined;
  const derived = computeDerived(system, scores, equip);
  const ancestry = system.ancestries.find(
    (a) => a.id === character.definition.ancestryId,
  );
  const pools = derived.filter((d) => d.resourcePool);
  const refStrip = derived.filter((d) => !d.resourcePool);

  return (
    <div className={s.sheet}>
      <header className={s.header}>
        <div>
          <h2 className={s.name}>{character.name}</h2>
          <p className={s.sub}>
            {ancestry?.name ?? 'Unknown'} · Level {character.play.level} ·{' '}
            {character.play.reputation}
          </p>
        </div>
      </header>

      <section className={s.stats}>
        {system.coreStats.map((c) => (
          <div key={c.id} className={s.stat}>
            <span className={s.statAbbr}>{c.abbreviation}</span>
            <span className={s.statScore}>{scores[c.id] ?? 0}</span>
            <span className={s.statMod}>{sign(mods[c.id] ?? 0)}</span>
          </div>
        ))}
      </section>

      <section className={s.pools}>
        {pools.map((p) => {
          const max = p.value;
          const current = character.play.pools?.[p.id]?.current ?? max;
          return (
            <div key={p.id} className={`${s.pool} ${s[p.color ?? 'teal'] ?? ''}`}>
              <span className={s.poolLabel}>{p.name}</span>
              <span className={s.poolValue}>
                {current}
                <span className={s.poolMax}>/{max}</span>
              </span>
            </div>
          );
        })}
      </section>

      <section className={s.refStrip}>
        {refStrip.map((d) => (
          <div key={d.id} className={s.ref}>
            <span className={s.refLabel}>{d.abbreviation ?? d.name}</span>
            <span className={s.refValue}>
              {d.isRoll ? sign(d.value) : d.value}
              {d.unit ? ` ${d.unit}` : ''}
            </span>
          </div>
        ))}
      </section>

      <p className={s.note}>
        Character created and saved. The full play-mode sheet — interactive resource
        trackers, skills, attacks &amp; damage, and the spell book — arrives in the next
        phase.
      </p>
    </div>
  );
}
