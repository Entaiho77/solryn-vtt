import { StepFrame } from '../StepFrame';
import type { StepProps } from '../stepTypes';
import { Button } from '../../../components/ui/Button';
import { computeModifier, modifierChart, rollDice } from '../../../engine/rules';
import s from './steps.module.css';

const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export function RollStatsStep({ system, draft, dispatch, nav }: StepProps) {
  const order = system.creation.statOrder;
  const rule = system.modifierRule;
  const nextToRoll = order.find((id) => draft.coreScores[id] === undefined);
  const chart = modifierChart(rule, 2, 12);
  const statById = (id: string) => system.coreStats.find((c) => c.id === id);

  const teaching = (
    <>
      <p className={s.teachText}>
        Every <strong>3 points</strong> in a stat grants <strong>+1</strong> to its
        modifier — and the pattern continues with <strong>no cap</strong>. Watch each
        roll turn into a modifier.
      </p>
      <div className={s.breakdown}>
        {chart.map((r) => (
          <div key={r.score}>
            score {r.score} → {sign(r.modifier)}
          </div>
        ))}
      </div>
      <p className={s.teachText}>
        Stats are rolled in order and each locks the instant it lands — no rerolls,
        no rearranging. They ride forward as locked reference on every later page.
      </p>
    </>
  );

  return (
    <StepFrame {...nav} teaching={teaching}>
      <div className={s.statList}>
        {order.map((id) => {
          const stat = statById(id);
          const value = draft.coreScores[id];
          const rolled = value !== undefined;
          const active = id === nextToRoll;
          const roll = stat?.roll ?? '2d4';
          return (
            <div
              key={id}
              className={[
                s.statRow,
                active ? s.active : '',
                !rolled && !active ? s.pending : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={s.statName}>{stat?.name ?? id}</span>
              {rolled ? (
                <>
                  <span className={s.statValue}>{value}</span>
                  <span className={s.statMod}>
                    {sign(computeModifier(value, rule))} mod
                  </span>
                </>
              ) : active ? (
                <Button
                  size="sm"
                  onClick={() =>
                    dispatch({
                      type: 'rollStat',
                      statId: id,
                      value: rollDice(roll).total,
                    })
                  }
                >
                  Roll {roll}
                </Button>
              ) : (
                <span className={s.statMod}>—</span>
              )}
            </div>
          );
        })}
      </div>
    </StepFrame>
  );
}
