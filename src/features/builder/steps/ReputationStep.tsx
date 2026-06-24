import { StepFrame } from '../StepFrame';
import type { StepProps } from '../stepTypes';
import s from './steps.module.css';

export function ReputationStep({ system, nav }: StepProps) {
  const rep = system.creation.startingReputation;

  const teaching = (
    <>
      <p className={s.teachText}>
        Solryn has <strong>no alignment system</strong>. Your standing grows from what
        you actually do in play.
      </p>
      <p className={s.teachText}>
        The GM tracks reputation, and it can vary by faction or region — a hero to one
        town may be a villain to another.
      </p>
    </>
  );

  return (
    <StepFrame {...nav} teaching={teaching}>
      <div className={s.centerBlock}>
        <span className={s.bigNumber}>{rep}</span>
        <p className={s.note}>
          Everyone begins here — nothing to choose. Your reputation is a blank slate.
        </p>
      </div>
    </StepFrame>
  );
}
