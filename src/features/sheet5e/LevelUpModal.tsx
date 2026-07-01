import { useMemo, useState } from 'react';
import type { Dnd5eSpell, SystemDefinition } from '../../engine/schema';
import type { Character } from '../../data/types';
import { applyLevelUp5e } from '../../data/characters';
import { ABILITY_IDS } from '../../systems/dnd5e/character';
import { spells as allSpells, getSpellsForClass } from '../../systems/dnd5e/spells';
import { computeLevelUp, levelUpSummary, type LevelUpChoices } from '../../systems/dnd5e/levelUp';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import s from '../board/drawers/drawers.module.css';

const row: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' };

/**
 * Guided 5e level-up. Opens when play.levelUpPending is true; non-dismissible (onClose is a
 * no-op) until the player finishes — the pending flag persists otherwise. Walks features → HP →
 * ASI → spells, then writes level, HP, scores, spells, and refreshed slots atomically.
 */
export function LevelUpModal({
  system,
  character,
  onDone,
}: {
  system: SystemDefinition;
  character: Character;
  onDone: () => void;
}) {
  const summary = useMemo(() => levelUpSummary(system, character), [system, character]);
  const [asiMode, setAsiMode] = useState<'one' | 'two'>('one');
  const [asiA, setAsiA] = useState<string>('');
  const [asiB, setAsiB] = useState<string>('');
  const [newCantripIds, setNewCantripIds] = useState<string[]>([]);
  const [newSpellIds, setNewSpellIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  // UI-only: which spell level the leveled picker shows ('all' or a specific level).
  const [spellLevelFilter, setSpellLevelFilter] = useState<number | 'all'>('all');

  // Spells the player could add: class list, not already known/booked, within castable level.
  const classSpells = summary.model ? getSpellsForClass(character.definition.classId ?? '', allSpells) : [];
  const have = new Set([...(character.definition.knownSpellIds ?? []), ...(character.definition.spellbookSpellIds ?? [])]);
  const maxSlotLevel = Math.max(0, ...Object.keys(summary.newMaxSlots).map(Number));
  const cantripChoices = classSpells.filter((sp) => sp.level === 0 && !have.has(sp.id));
  const spellChoices = classSpells.filter((sp) => sp.level >= 1 && sp.level <= maxSlotLevel && !have.has(sp.id));

  const asi: Record<string, number> = !summary.isAsi
    ? {}
    : asiMode === 'one'
      ? (asiA ? { [asiA]: 2 } : {})
      : asiA && asiB && asiA !== asiB
        ? { [asiA]: 1, [asiB]: 1 }
        : {};

  const asiComplete = !summary.isAsi || Object.keys(asi).length === (asiMode === 'one' ? 1 : 2);
  const cantripsComplete = newCantripIds.length === summary.cantripsGain;
  const spellsComplete = newSpellIds.length === summary.spellsGain;
  const canFinish = asiComplete && cantripsComplete && spellsComplete && !busy && !summary.atMax;

  async function finish() {
    setBusy(true);
    const choices: LevelUpChoices = { asi, newCantripIds, newSpellIds };
    const result = computeLevelUp(system, character, summary, choices);
    try {
      await applyLevelUp5e(character.id, result);
      onDone();
    } catch {
      setBusy(false);
    }
  }

  const pickList = (
    label: string,
    options: Dnd5eSpell[],
    picked: string[],
    setPicked: (ids: string[]) => void,
    max: number,
    filterable = false,
  ) => {
    // Level-filter tabs (leveled picker only): only the levels actually available appear.
    // Filtering is display-only — `picked` is the full selection, so it persists across tabs.
    const levels = filterable ? [...new Set(options.map((sp) => sp.level))].sort((a, b) => a - b) : [];
    const shown = filterable && spellLevelFilter !== 'all' ? options.filter((sp) => sp.level === spellLevelFilter) : options;
    return (
    <>
      <p className={s.label}>{label} ({picked.length}/{max})</p>
      {filterable && levels.length > 1 && (
        <div className={s.tabs}>
          <button className={`${s.tab} ${spellLevelFilter === 'all' ? s.tabActive : ''}`} onClick={() => setSpellLevelFilter('all')}>
            All
          </button>
          {levels.map((l) => (
            <button key={l} className={`${s.tab} ${spellLevelFilter === l ? s.tabActive : ''}`} onClick={() => setSpellLevelFilter(l)}>
              L{l}
            </button>
          ))}
        </div>
      )}
      <div className={s.list} style={{ maxHeight: 180 }}>
        {shown.map((sp) => {
          const checked = picked.includes(sp.id);
          const full = picked.length >= max;
          return (
            <label key={sp.id} className={`${s.item} ${checked ? s.itemActive ?? '' : ''}`} style={row}>
              <span>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!checked && full}
                  onChange={() => setPicked(checked ? picked.filter((x) => x !== sp.id) : [...picked, sp.id])}
                />{' '}
                {sp.name}
              </span>
              <span className={s.itemMeta}>{sp.school}{sp.level > 0 ? ` · L${sp.level}` : ''}</span>
            </label>
          );
        })}
      </div>
    </>
    );
  };

  return (
    <Modal
      open
      onClose={() => {}}
      title={`Level up — ${character.name}`}
      width={520}
      // Anchored footer (outside the scrollable body) so the confirm button never overlaps the list.
      footer={
        <Button onClick={() => void finish()} disabled={!canFinish}>
          {busy ? 'Applying…' : `Become level ${summary.toLevel}`}
        </Button>
      }
    >
      <div className={s.section}>
        <p className={s.label} style={{ fontSize: 'var(--text-lg)' }}>
          You are now level {summary.toLevel} {summary.className}!
        </p>

        {/* New features */}
        {summary.newFeatures.length > 0 && (
          <>
            <span className={s.label}>New features</span>
            {summary.newFeatures.map((f) => (
              <p key={f} className={s.hint} style={{ margin: 0 }}>• {f}</p>
            ))}
          </>
        )}
        {summary.subclassPending && (
          <p className={s.hint}>Your subclass unlocks at this level — subclass selection coming soon.</p>
        )}

        {/* HP */}
        <div style={row}>
          <span className={s.itemMeta}>Hit points</span>
          <strong>+{summary.hpGain} (average)</strong>
        </div>

        {/* Counter changes */}
        {summary.counterChanges.map((c) => (
          <div key={c.name} style={row}>
            <span className={s.itemMeta}>{c.name.replace(/_/g, ' ')}</span>
            <span>{c.from ?? '—'} → <strong>{c.to}</strong></span>
          </div>
        ))}

        {/* ASI */}
        {summary.isAsi && (
          <>
            <span className={s.label}>Ability Score Improvement</span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <label className={s.itemMeta}>
                <input type="radio" checked={asiMode === 'one'} onChange={() => { setAsiMode('one'); setAsiB(''); }} /> +2 to one
              </label>
              <label className={s.itemMeta}>
                <input type="radio" checked={asiMode === 'two'} onChange={() => setAsiMode('two')} /> +1 to two
              </label>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <select className={s.input} value={asiA} onChange={(e) => setAsiA(e.target.value)} aria-label="Ability">
                <option value="">—</option>
                {ABILITY_IDS.map((id) => <option key={id} value={id}>{id}</option>)}
              </select>
              {asiMode === 'two' && (
                <select className={s.input} value={asiB} onChange={(e) => setAsiB(e.target.value)} aria-label="Second ability">
                  <option value="">—</option>
                  {ABILITY_IDS.filter((id) => id !== asiA).map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
              )}
            </div>
            <p className={s.hint}>Feat support coming soon — for now an ASI is applied.</p>
          </>
        )}

        {/* Spells */}
        {summary.cantripsGain > 0 && pickList('New cantrips', cantripChoices, newCantripIds, setNewCantripIds, summary.cantripsGain)}
        {summary.spellsGain > 0 &&
          pickList(
            summary.model === 'spellbook' ? 'Add to spellbook' : 'New spells known',
            spellChoices,
            newSpellIds,
            setNewSpellIds,
            summary.spellsGain,
            true,
          )}
        {summary.model === 'prepared' && summary.newPreparedCount !== undefined && (
          <p className={s.hint}>
            As a prepared caster you now prepare {summary.newPreparedCount} spells per day from your full class list — no selection needed here.
          </p>
        )}

        {/* Spell slots */}
        {summary.model && Object.keys(summary.newMaxSlots).length > 0 && (
          <p className={s.hint}>
            Spell slots (refreshed): {Object.entries(summary.newMaxSlots).map(([lvl, n]) => `${n}×L${lvl}`).join(', ')}
          </p>
        )}
      </div>
    </Modal>
  );
}
