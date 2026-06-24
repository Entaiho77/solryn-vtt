import { StepFrame } from '../StepFrame';
import type { StepProps } from '../stepTypes';
import { computeDerived } from '../../../engine/rules';
import { effectiveScores, equipmentContext } from '../builderModel';
import s from './steps.module.css';

const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

/** Generic "show, don't ask" page for ANY derived stat — no Solryn special-casing. */
export function DerivedStep({
  system,
  draft,
  nav,
  derivedId,
}: StepProps & { derivedId: string }) {
  const ds = system.derivedStats.find((d) => d.id === derivedId)!;
  const results = computeDerived(
    system,
    effectiveScores(system, draft),
    equipmentContext(system, draft),
  );
  const r = results.find((x) => x.id === derivedId)!;
  const colorClass =
    r.color === 'purple' ? s.purple : r.color === 'amber' ? s.amber : '';

  const teaching = (
    <>
      <p className={s.teachText}>{ds.description}</p>
      <div>
        <span className={s.formula}>{r.breakdown}</span>
      </div>
    </>
  );

  return (
    <StepFrame {...nav} teaching={teaching}>
      <div className={s.centerBlock}>
        {r.isRoll ? (
          <>
            <div>
              <span className={`${s.bigNumber} ${colorClass}`}>{sign(r.value)}</span>
              <span className={s.unit}>{ds.name} modifier</span>
            </div>
            <div className={s.breakdown}>
              {r.die} + {sign(r.value)}, rolled each combat
            </div>
            <p className={s.note}>
              {ds.name} isn’t stored as a fixed number — you roll {r.die} and add{' '}
              {sign(r.value)} at the start of every combat. Players win ties against
              monsters.
            </p>
          </>
        ) : (
          <>
            <div>
              <span className={`${s.bigNumber} ${colorClass}`}>{r.value}</span>
              {ds.unit && <span className={s.unit}>{ds.unit}</span>}
              {r.pending && <span className={s.unit}>so far</span>}
            </div>
            <div className={s.breakdown}>{r.breakdown}</div>
            {r.pending && (
              <p className={s.pendingNote}>
                The armor piece is added at the end — your {ds.name} finalizes when you
                pick starting gear.
              </p>
            )}
          </>
        )}
      </div>
    </StepFrame>
  );
}
