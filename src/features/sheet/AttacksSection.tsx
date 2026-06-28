import type { Spell, SystemDefinition, WeaponItem } from '../../engine/schema';
import type { Character } from '../../data/types';
import { computeSkillState, rollDice } from '../../engine/rules';
import { setLoadedSpell, setPoolCurrent } from '../../data/characters';
import { Button } from '../../components/ui/Button';
import { describeRoll, useRollLog } from '../rolllog/rollLog';
import styles from './AttacksSection.module.css';

const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export function AttacksSection({
  system,
  character,
}: {
  system: SystemDefinition;
  character: Character;
}) {
  const { postRoll } = useRollLog();
  const mode = system.modes.skill;

  const weapons = character.play.equippedWeaponIds
    .map((id) => system.equipment.weapons.find((w) => w.id === id))
    .filter((w): w is WeaponItem => Boolean(w));

  const knownOffensive = character.definition.knownSpellIds
    .map((id) => system.spells.find((s) => s.id === id))
    .filter((s): s is Spell => Boolean(s) && s!.type === 'offensive');

  const arcanaPoolId = system.modes.casting.poolStatId;
  const arcanaCurrent = arcanaPoolId
    ? (character.play.pools[arcanaPoolId]?.current ?? 0)
    : 0;

  const loadedId =
    character.play.loadedSpellId &&
    knownOffensive.some((s) => s.id === character.play.loadedSpellId)
      ? character.play.loadedSpellId
      : knownOffensive[0]?.id;
  const loaded = knownOffensive.find((s) => s.id === loadedId);

  function weaponBonus(w: WeaponItem): number {
    const st = character.play.skills[w.weaponSkillId];
    if (!st) return 0;
    return computeSkillState(st.investedPoints, st.realizedPoints, mode).activeBonus;
  }

  function rollWeapon(w: WeaponItem) {
    postRoll(describeRoll(w.name, rollDice(w.damageDice), { bonus: weaponBonus(w) }));
  }

  function cast() {
    if (!loaded || !arcanaPoolId || arcanaCurrent < loaded.cost) return;
    const r = loaded.damageDice ? rollDice(loaded.damageDice) : null;
    void setPoolCurrent(character.id, arcanaPoolId, arcanaCurrent - loaded.cost);
    postRoll(
      `${r ? describeRoll(loaded.name, r, { type: loaded.damageType }) : `${loaded.name}: cast`} (−${loaded.cost} Arcana)`,
    );
  }

  const nothing = weapons.length === 0 && knownOffensive.length === 0;

  return (
    <section>
      <h3 className={styles.title}>Attacks &amp; damage</h3>

      {nothing ? (
        <p className={styles.empty}>No attacks equipped.</p>
      ) : (
        <div className={styles.rows}>
          {weapons.map((w) => {
            const bonus = weaponBonus(w);
            return (
              <div key={w.id} className={styles.row}>
                <span className={styles.name}>{w.name}</span>
                <span className={styles.feed}>
                  {w.damageDice}
                  {bonus ? ` ${sign(bonus)}` : ''} · auto-hit vs DR
                </span>
                <Button size="sm" onClick={() => rollWeapon(w)}>
                  Roll
                </Button>
              </div>
            );
          })}

          {loaded && (
            <div className={`${styles.row} ${styles.spellRow}`}>
              <select
                className={styles.spellSelect}
                value={loadedId}
                onChange={(e) => void setLoadedSpell(character.id, e.target.value)}
                aria-label="Loaded spell"
              >
                {knownOffensive.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <span className={styles.feed}>
                {loaded.damageDice ?? '—'}
                {loaded.damageType ? ` ${loaded.damageType}` : ''} ·{' '}
                {loaded.cost > 0 ? `costs ${loaded.cost} AP` : 'base 0 AP'} · auto-hit vs DR
              </span>
              <button
                type="button"
                className={styles.cast}
                onClick={cast}
                disabled={arcanaCurrent < loaded.cost}
                title={
                  arcanaCurrent < loaded.cost ? 'Not enough Arcana' : undefined
                }
              >
                Cast
              </button>
            </div>
          )}

          {loaded && (
            <p className={styles.synopsis}>
              {loaded.synopsis} · range {loaded.range}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
