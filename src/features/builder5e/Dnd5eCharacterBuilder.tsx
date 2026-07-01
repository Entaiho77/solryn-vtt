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
  subraceId?: string;
  /** Half-Elf's flexible +1s (stat id → amount). */
  ancestryChoices: Record<string, number>;
  /** Half-Elf's Skill Versatility picks (separate from the class skill step). */
  raceSkillIds: string[];
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
  const [draft, setDraft] = useState<Draft>({
    name: '',
    abilities: {},
    ancestryChoices: {},
    raceSkillIds: [],
    chosenSkillIds: [],
  });
  const [step, setStep] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');

  const rule = system.modifierRule;
  const fighter = system.classes?.[0];
  const skillChoose = fighter?.skillChoices.choose ?? 2;

  // Selected race + its sub-choices (subrace, Half-Elf flexible bonus, Half-Elf skills).
  const race = system.ancestries.find((a) => a.id === draft.raceId);
  const subrace = race?.subraces?.find((sr) => sr.id === draft.subraceId);
  const flexBonus = race?.bonuses.find((b) => b.kind === 'choice');
  const flex = flexBonus?.kind === 'choice' ? flexBonus : undefined; // Half-Elf +1 to N abilities
  const raceSkillChoose = race?.raceSkillChoices?.choose ?? 0;
  const raceSkillFrom =
    race?.raceSkillChoices?.from === 'any' ? system.skills.map((sk) => sk.id) : (race?.raceSkillChoices?.from ?? []);
  // All proficient skills at finish = class picks + Half-Elf race picks (racial fixed grants
  // like Elf Perception are added automatically by pcDerived).
  const allChosenSkills = [...new Set([...draft.chosenSkillIds, ...draft.raceSkillIds])];
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
      case 'race': {
        if (!draft.raceId) return false;
        if (race?.subraces?.length && !draft.subraceId) return false;
        if (flex && Object.keys(draft.ancestryChoices).length !== flex.count) return false;
        if (raceSkillChoose && draft.raceSkillIds.length !== raceSkillChoose) return false;
        return true;
      }
      case 'class':
        return !!draft.classId;
      case 'skills':
        return draft.chosenSkillIds.length === skillChoose;
      case 'finish':
        return draft.name.trim().length > 0;
    }
  })();

  // The chosen class's thematic starting kit (falls back to a longsword if a class lacks one).
  const kit = (system.classes ?? []).find((c) => c.id === draft.classId)?.starterKit ?? {
    weaponIds: ['longsword'],
  };

  // Live preview of the finished combat numbers (built once enough is chosen).
  const preview = useMemo(() => {
    if (!assignedAll || !draft.classId) return null;
    const scores = effectiveScores(draft.abilities as Record<string, number>, race, subrace, draft.ancestryChoices);
    const character = {
      id: 'preview',
      gameId,
      ownerUserId,
      systemId: system.id,
      name: draft.name,
      buildComplete: false,
      definition: { ancestryId: draft.raceId ?? '', subraceId: draft.subraceId, ancestryChoices: draft.ancestryChoices, classId: draft.classId, coreScores: scores, chosenSkillIds: allChosenSkills, knownSpellIds: [] },
      play: { level: 1, reputation: system.creation.startingReputation, pools: {}, skills: {}, equippedWeaponIds: kit.weaponIds, ...(kit.armorId ? { equippedArmorId: kit.armorId } : {}) },
    } as Character;
    return pcDerived(system, character);
  }, [assignedAll, draft, race, subrace, allChosenSkills, system, gameId, ownerUserId, kit]);

  async function finish() {
    if (!preview) return;
    setFinishing(true);
    setError('');
    const scores = effectiveScores(draft.abilities as Record<string, number>, race, subrace, draft.ancestryChoices);
    const base: Omit<Character, 'id'> = {
      gameId,
      ownerUserId,
      systemId: system.id,
      name: draft.name.trim() || 'New Hero',
      buildComplete: true,
      definition: {
        ancestryId: draft.raceId ?? '',
        ...(draft.subraceId ? { subraceId: draft.subraceId } : {}),
        ...(Object.keys(draft.ancestryChoices).length ? { ancestryChoices: draft.ancestryChoices } : {}),
        classId: draft.classId,
        coreScores: scores,
        chosenSkillIds: allChosenSkills,
        knownSpellIds: [],
      },
      play: {
        level: 1,
        reputation: system.creation.startingReputation,
        pools: { hp: { current: preview.maxHp } },
        skills: {},
        equippedWeaponIds: kit.weaponIds,
        ...(kit.armorId ? { equippedArmorId: kit.armorId } : {}),
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

  const teaching = <p className={s.teachText}>All nine SRD races (with subraces), all twelve classes, standard array. Spellcasting arrives in a later phase.</p>;

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
              // Switching races clears any stale sub-choices.
              onClick={() => setDraft((d) => ({ ...d, raceId: a.id, subraceId: undefined, ancestryChoices: {}, raceSkillIds: [] }))}
            >
              <span className={s.statName}>{a.name}</span>
              <span className={s.statMod}>{a.bonusSummary}</span>
            </button>
          ))}

          {/* Subrace / draconic ancestry picker — appears once a race with options is chosen. */}
          {race?.subraces?.length ? (
            <>
              <p className={s.teachText}>
                {race.id === 'dragonborn' ? 'Choose a draconic ancestry (sets your breath weapon):' : 'Choose a subrace:'}
              </p>
              {race.subraces.map((sr) => (
                <button
                  key={sr.id}
                  className={[s.statRow, draft.subraceId === sr.id ? s.active : ''].filter(Boolean).join(' ')}
                  onClick={() => setDraft((d) => ({ ...d, subraceId: sr.id }))}
                >
                  <span className={s.statName}>{sr.name}</span>
                  <span className={s.statMod}>{sr.description}</span>
                </button>
              ))}
            </>
          ) : null}

          {/* Half-Elf: +1 to two chosen abilities. */}
          {flex ? (
            <>
              <p className={s.teachText}>
                +{flex.amount} to {flex.count} abilities ({Object.keys(draft.ancestryChoices).length}/{flex.count}):
              </p>
              {(flex.from ?? ABILITY_IDS).map((stat) => {
                const picked = draft.ancestryChoices[stat] != null;
                const full = Object.keys(draft.ancestryChoices).length >= flex.count;
                return (
                  <label key={stat} className={[s.statRow, picked ? s.active : ''].filter(Boolean).join(' ')}>
                    <input
                      type="checkbox"
                      checked={picked}
                      disabled={!picked && full}
                      onChange={() =>
                        setDraft((d) => {
                          const next = { ...d.ancestryChoices };
                          if (picked) delete next[stat];
                          else next[stat] = flex.amount;
                          return { ...d, ancestryChoices: next };
                        })
                      }
                    />
                    <span className={s.statName}>{stat}</span>
                  </label>
                );
              })}
            </>
          ) : null}

          {/* Half-Elf Skill Versatility: choose N skills from any. */}
          {raceSkillChoose ? (
            <>
              <p className={s.teachText}>
                Choose {raceSkillChoose} skill proficiencies ({draft.raceSkillIds.length}/{raceSkillChoose}):
              </p>
              {raceSkillFrom.map((sid) => {
                const sk = system.skills.find((x) => x.id === sid);
                const checked = draft.raceSkillIds.includes(sid);
                const full = draft.raceSkillIds.length >= raceSkillChoose;
                return (
                  <label key={sid} className={[s.statRow, checked ? s.active : ''].filter(Boolean).join(' ')}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && full}
                      onChange={() =>
                        setDraft((d) => ({
                          ...d,
                          raceSkillIds: checked ? d.raceSkillIds.filter((x) => x !== sid) : [...d.raceSkillIds, sid],
                        }))
                      }
                    />
                    <span className={s.statName}>{sk?.name ?? sid}</span>
                    <span className={s.statMod}>{sk?.attribute}</span>
                  </label>
                );
              })}
            </>
          ) : null}
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
              <div>
                Gear:{' '}
                {[
                  ...kit.weaponIds.map((id) => system.equipment.weapons.find((w) => w.id === id)?.name ?? id),
                  kit.armorId ? (system.equipment.armor.find((a) => a.id === kit.armorId)?.name ?? kit.armorId) : 'no armor',
                ].join(', ')}{' '}
                (equipped)
              </div>
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
