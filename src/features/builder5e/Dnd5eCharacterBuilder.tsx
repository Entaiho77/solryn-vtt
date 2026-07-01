import { useMemo, useState } from 'react';
import type { SystemDefinition } from '../../engine/schema';
import type { Character } from '../../data/types';
import { computeModifier } from '../../engine/rules';
import { StepFrame } from '../builder/StepFrame';
import { TextField } from '../../components/ui/TextField';
import {
  ABILITY_IDS,
  STANDARD_ARRAY,
  effectiveScores,
  pcDerived,
  type AbilityId,
} from '../../systems/dnd5e/character';
import s from '../builder/steps/steps.module.css';

/**
 * 5e character builder — its own step set on the SHARED StepFrame shell (Solryn's builder is
 * untouched). Scope (Phase B/C): Human Fighter, standard array, level 1. Selected by GamePage
 * when the system's progression mode is 'class-and-level'.
 */

interface Draft {
  name: string;
  abilities: Partial<Record<AbilityId, number>>;
  raceId?: string;
  classId?: string;
  chosenSkillIds: string[];
}

const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export function Dnd5eCharacterBuilder({
  system,
  gameId,
  ownerUserId,
  onFinish,
}: {
  system: SystemDefinition;
  gameId: string;
  ownerUserId: string;
  onFinish: (character: Omit<Character, 'id'>) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Draft>({ name: '', abilities: {}, chosenSkillIds: [] });
  const [step, setStep] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');

  const rule = system.modifierRule;
  const fighter = system.classes?.[0];
  const human = system.ancestries[0];
  const skillChoose = fighter?.skillChoices.choose ?? 2;
  const skillFrom = (fighter?.skillChoices.from === 'any'
    ? system.skills.map((s) => s.id)
    : fighter?.skillChoices.from) ?? [];

  const usedValues = Object.values(draft.abilities);
  const assignedAll = ABILITY_IDS.every((id) => draft.abilities[id] !== undefined);

  const steps = ['abilities', 'race', 'class', 'skills', 'finish'] as const;
  const meta = {
    abilities: { title: 'Assign ability scores', instruction: 'Place the standard array (15/14/13/12/10/8) — each value once.' },
    race: { title: 'Choose a race', instruction: 'Pick your race. Its bonuses apply to your scores right away.' },
    class: { title: 'Choose a class', instruction: 'Pick your class. It sets your hit die, proficiencies, and features.' },
    skills: { title: 'Choose skills', instruction: `Pick ${skillChoose} skill proficiencies from your class list.` },
    finish: { title: 'Name & finish', instruction: 'Name your character. Starter gear is equipped automatically.' },
  } as const;
  const kind = steps[step];

  const canNext = (() => {
    switch (kind) {
      case 'abilities':
        return assignedAll;
      case 'race':
        return !!draft.raceId;
      case 'class':
        return !!draft.classId;
      case 'skills':
        return draft.chosenSkillIds.length === skillChoose;
      case 'finish':
        return draft.name.trim().length > 0;
    }
  })();

  // Live preview of the finished combat numbers (built once enough is chosen).
  const preview = useMemo(() => {
    if (!assignedAll || !draft.classId) return null;
    const scores = effectiveScores(draft.abilities as Record<string, number>, human);
    const character = {
      id: 'preview',
      gameId,
      ownerUserId,
      systemId: system.id,
      name: draft.name,
      buildComplete: false,
      definition: { ancestryId: draft.raceId ?? '', classId: draft.classId, coreScores: scores, chosenSkillIds: draft.chosenSkillIds, knownSpellIds: [] },
      play: { level: 1, reputation: system.creation.startingReputation, pools: {}, skills: {}, equippedWeaponIds: ['longsword'], equippedArmorId: 'chain-mail' },
    } as Character;
    return pcDerived(system, character);
  }, [assignedAll, draft, human, system, gameId, ownerUserId]);

  async function finish() {
    if (!preview) return;
    setFinishing(true);
    setError('');
    const scores = effectiveScores(draft.abilities as Record<string, number>, human);
    const base: Omit<Character, 'id'> = {
      gameId,
      ownerUserId,
      systemId: system.id,
      name: draft.name.trim() || 'New Hero',
      buildComplete: true,
      definition: {
        ancestryId: draft.raceId ?? '',
        classId: draft.classId,
        coreScores: scores,
        chosenSkillIds: draft.chosenSkillIds,
        knownSpellIds: [],
      },
      play: {
        level: 1,
        reputation: system.creation.startingReputation,
        pools: { hp: { current: preview.maxHp } },
        skills: {},
        equippedWeaponIds: ['longsword'],
        equippedArmorId: 'chain-mail',
      },
    };
    try {
      await onFinish(base);
    } catch (e) {
      setError((e as Error).message);
      setFinishing(false);
    }
  }

  function next() {
    if (!canNext || finishing) return;
    if (step === steps.length - 1) void finish();
    else setStep(step + 1);
  }

  const nav = {
    stepNumber: step + 1,
    totalSteps: steps.length,
    title: meta[kind].title,
    instruction: meta[kind].instruction,
    onNext: next,
    nextLabel: finishing ? 'Creating…' : step === steps.length - 1 ? 'Finish character' : `Next: ${meta[steps[step + 1]].title}`,
    nextDisabled: !canNext || finishing,
    onBack: step > 0 ? () => setStep(step - 1) : undefined,
  };

  const teaching = <p className={s.teachText}>One race (Human), one class (Fighter), standard array — the first playable 5e character. More options arrive in later phases.</p>;

  return (
    <StepFrame {...nav} teaching={teaching}>
      {kind === 'abilities' && (
        <div className={s.statList}>
          {ABILITY_IDS.map((id) => {
            const val = draft.abilities[id];
            const options = STANDARD_ARRAY.filter((v) => !usedValues.includes(v) || v === val);
            return (
              <div key={id} className={s.statRow}>
                <span className={s.statName}>{id}</span>
                <select
                  value={val ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, abilities: { ...d.abilities, [id]: e.target.value ? Number(e.target.value) : undefined } }))
                  }
                >
                  <option value="">—</option>
                  {options.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <span className={s.statMod}>{val !== undefined ? `${sign(computeModifier(val, rule))} mod` : '—'}</span>
              </div>
            );
          })}
        </div>
      )}

      {kind === 'race' && (
        <div className={s.statList}>
          {system.ancestries.map((a) => (
            <button
              key={a.id}
              className={[s.statRow, draft.raceId === a.id ? s.active : ''].filter(Boolean).join(' ')}
              onClick={() => setDraft((d) => ({ ...d, raceId: a.id }))}
            >
              <span className={s.statName}>{a.name}</span>
              <span className={s.statMod}>{a.bonusSummary}</span>
            </button>
          ))}
        </div>
      )}

      {kind === 'class' && (
        <div className={s.statList}>
          {(system.classes ?? []).map((cl) => {
            const casterPending = !!cl.spellcasting; // spells aren't implemented yet
            return (
              <button
                key={cl.id}
                className={[s.statRow, draft.classId === cl.id ? s.active : ''].filter(Boolean).join(' ')}
                onClick={() => setDraft((d) => ({ ...d, classId: cl.id }))}
              >
                <span className={s.statName}>
                  {cl.name}
                  {casterPending && <span className={s.statMod}> (spells coming soon)</span>}
                </span>
                <span className={s.statMod}>Hit die {cl.hitDie} · saves {cl.savingThrows.join('/')}</span>
              </button>
            );
          })}
        </div>
      )}

      {kind === 'skills' && (
        <div className={s.statList}>
          {skillFrom.map((sid) => {
            const sk = system.skills.find((x) => x.id === sid);
            const checked = draft.chosenSkillIds.includes(sid);
            const full = draft.chosenSkillIds.length >= skillChoose;
            return (
              <label key={sid} className={[s.statRow, checked ? s.active : ''].filter(Boolean).join(' ')}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!checked && full}
                  onChange={() =>
                    setDraft((d) => ({
                      ...d,
                      chosenSkillIds: checked ? d.chosenSkillIds.filter((x) => x !== sid) : [...d.chosenSkillIds, sid],
                    }))
                  }
                />
                <span className={s.statName}>{sk?.name ?? sid}</span>
                <span className={s.statMod}>{sk?.attribute}</span>
              </label>
            );
          })}
        </div>
      )}

      {kind === 'finish' && (
        <div className={s.statList}>
          <TextField label="Name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Your hero's name" />
          {preview && (
            <div className={s.breakdown}>
              <div>AC {preview.ac} · HP {preview.maxHp} · Prof +{preview.proficiencyBonus}</div>
              {preview.attacks.map((a) => (
                <div key={a.name}>{a.name}: {sign(a.attackBonus)} to hit, {a.dice} {a.damageType}</div>
              ))}
              <div>Gear: Longsword, Chain Mail (equipped)</div>
              {preview.cls?.spellcasting && (
                <div style={{ color: 'var(--accent-amber)' }}>
                  Spellcasting isn't implemented yet — this class is playable for martial combat;
                  its spells arrive in a later phase.
                </div>
              )}
            </div>
          )}
          {error && <p style={{ color: 'var(--accent-red)' }}>{error}</p>}
        </div>
      )}
    </StepFrame>
  );
}
