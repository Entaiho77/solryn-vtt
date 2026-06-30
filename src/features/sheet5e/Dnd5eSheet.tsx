import { useState } from 'react';
import type { SystemDefinition } from '../../engine/schema';
import type { Character } from '../../data/types';
import { getCombatResolver } from '../../engine/rules';
import { setPoolCurrent } from '../../data/characters';
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
export function Dnd5eSheet({ system, character }: { system: SystemDefinition; character: Character }) {
  const { postRoll } = useRollLog();
  const resolver = getCombatResolver(system);
  const d = pcDerived(system, character);
  const hpCurrent = character.play.pools?.hp?.current ?? d.maxHp;

  const [targetAc, setTargetAc] = useState(13);
  const [advantage, setAdvantage] = useState<'advantage' | 'disadvantage' | undefined>();

  const rollAttack = (atk: (typeof d.attacks)[number]) =>
    postRoll(
      resolver.resolveAttack({
        label: `${character.name} — ${atk.name}`,
        dice: atk.dice,
        damageType: atk.damageType,
        attackBonus: atk.attackBonus,
        targetAc,
        advantage,
      }).logText,
    );

  return (
    <div className={s.section}>
      <span className={s.label}>{character.name} · {d.cls?.name ?? 'Adventurer'} {character.play.level}</span>

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

      {/* Attacks — through attackRollVsAc, with a target AC + adv/dis (minimal targeting). */}
      <span className={s.label}>Attacks</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <label className={s.itemMeta} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          Target AC
          <input type="number" value={targetAc} onChange={(e) => setTargetAc(Number(e.target.value) || 0)} style={{ width: 56 }} />
        </label>
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
      </div>
      {d.attacks.map((atk) => (
        <div key={atk.name} style={row}>
          <span className={s.itemMeta}>{atk.name}: {sign(atk.attackBonus)} to hit, {atk.dice} {atk.damageType}</span>
          <Button size="sm" onClick={() => rollAttack(atk)}>Roll</Button>
        </div>
      ))}
    </div>
  );
}
