import { StepFrame } from '../StepFrame';
import type { StepProps } from '../stepTypes';
import { effectiveScores } from '../builderModel';
import s from './steps.module.css';

export function ChooseRaceStep({ system, draft, dispatch, nav }: StepProps) {
  const eff = effectiveScores(system, draft);
  const abbr = (id: string) =>
    system.coreStats.find((c) => c.id === id)?.abbreviation ?? id;

  const teaching = (
    <>
      <p className={s.teachText}>
        Your race’s bonuses apply to your <strong>rolled stats right now</strong> —
        watch the preview update as you choose and assign.
      </p>
      <p className={s.teachText}>
        Advantages and weaknesses are <strong>recorded</strong> here but come into
        play during the game, not at creation.
      </p>
      <p className={s.teachText}>
        There’s no going back from here to the stat roll — those rolls are sealed.
      </p>
    </>
  );

  return (
    <StepFrame {...nav} teaching={teaching}>
      <div className={s.toolbar}>
        <div className={s.assignRow}>
          {system.coreStats.map((c) => {
            const base = draft.coreScores[c.id] ?? 0;
            const e = eff[c.id] ?? base;
            const delta = e - base;
            return (
              <span key={c.id} className={s.statToggle} style={{ cursor: 'default' }}>
                {c.abbreviation} {e}
                {delta !== 0 && <span className={s.delta}> +{delta}</span>}
              </span>
            );
          })}
        </div>
      </div>

      <div className={s.cardList}>
        {system.ancestries.map((a) => {
          const selected = draft.ancestryId === a.id;
          const select = () => dispatch({ type: 'chooseAncestry', ancestryId: a.id });
          return (
            <div
              key={a.id}
              className={[s.optionCard, selected ? s.selected : ''].join(' ')}
              role="button"
              tabIndex={0}
              onClick={select}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  select();
                }
              }}
            >
              <div className={s.optionHead}>
                <span className={s.optionName}>{a.name}</span>
                <span className={s.optionSummary}>{a.bonusSummary}</span>
                {a.provisional && <span className={s.provisional}>draft</span>}
              </div>
              <div className={s.optionMeta}>{a.advantages.join(' · ')}</div>
              {a.weaknesses.length > 0 && (
                <div className={s.optionMeta} style={{ color: 'var(--accent-amber)' }}>
                  Weakness: {a.weaknesses.join(' · ')}
                </div>
              )}

              {selected && a.bonuses.some((b) => b.kind === 'choice') && (
                <div
                  className={s.assign}
                  onClick={(e) => e.stopPropagation()}
                  role="presentation"
                >
                  {a.bonuses.map((b, i) =>
                    b.kind === 'choice' ? (
                      <div key={i}>
                        <span className={s.fieldLabel}>
                          Assign +{b.amount} to {b.count}{' '}
                          {b.count === 1 ? 'stat' : 'stats'}
                          {b.from
                            ? ` (${b.from.map(abbr).join(' or ')})`
                            : ' of your choice'}
                        </span>
                        <div className={s.assignRow}>
                          {(b.from ?? system.coreStats.map((c) => c.id)).map(
                            (statId) => {
                              const picks = draft.choiceSelections[i] ?? [];
                              const on = picks.includes(statId);
                              const full = picks.length >= b.count && !on;
                              return (
                                <button
                                  key={statId}
                                  type="button"
                                  className={[s.statToggle, on ? s.on : '']
                                    .filter(Boolean)
                                    .join(' ')}
                                  disabled={full}
                                  onClick={() =>
                                    dispatch({
                                      type: 'setChoiceSelection',
                                      bonusIndex: i,
                                      statIds: on
                                        ? picks.filter((p) => p !== statId)
                                        : [...picks, statId],
                                    })
                                  }
                                >
                                  {abbr(statId)}
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </StepFrame>
  );
}
