import { useState } from 'react';
import type { Combatant, Game, MapDef } from '../../../data/types';
import type { SystemDefinition } from '../../../engine/schema';
import { endCombat, rollInitiative, startCombat } from '../../../data/combat';
import { Button } from '../../../components/ui/Button';
import { MonsterStatCard } from './MonsterStatCard';
import s from './drawers.module.css';

export function InitiativeDrawer({
  gameId,
  game,
  activeMap,
  system,
}: {
  gameId: string;
  game: Game;
  activeMap?: MapDef;
  system: SystemDefinition;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cardName, setCardName] = useState<string | null>(null);
  const init = game.initiative;
  const creatures = activeMap
    ? Object.values(game.tokens ?? {}).filter(
        (t) => t.kind === 'creature' && t.mapId === activeMap.id,
      )
    : [];

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function roll() {
    const monsters: Combatant[] = creatures
      .filter((t) => selected.has(t.id))
      .map((t) => ({
        id: t.id,
        name: t.name,
        kind: 'creature' as const,
        tokenId: t.id,
        ...rollInitiative(Number(t.stats?.initiativeMod) || 0),
      }));
    void startCombat(gameId, monsters);
    setSelected(new Set());
  }

  if (cardName) {
    return (
      <div className={s.section}>
        <button type="button" className={s.place} onClick={() => setCardName(null)} style={{ alignSelf: 'flex-start' }}>
          ‹ Back
        </button>
        <MonsterStatCard system={system} name={cardName} />
      </div>
    );
  }

  if (init?.active) {
    return (
      <div className={s.section}>
        <span className={s.label}>Combat running</span>
        <p className={s.hint}>
          Round {init.round} · {init.order.length} combatants. Tap a monster to open its card.
        </p>
        <div className={s.list}>
          {init.order
            .filter((c) => c.kind === 'creature')
            .map((c) => (
              <button key={c.id} type="button" className={s.item} onClick={() => setCardName(c.name)}>
                <span className={s.itemName}>{c.name}</span>
              </button>
            ))}
        </div>
        <Button variant="danger" onClick={() => void endCombat(gameId)}>
          End combat
        </Button>
      </div>
    );
  }

  if (!activeMap) return <p className={s.hint}>Add a map and place creatures first.</p>;

  return (
    <div className={s.section}>
      <span className={s.label}>Start combat</span>
      <p className={s.hint}>
        Select the creatures in this fight, then roll initiative. Players roll
        themselves in afterward.
      </p>
      {creatures.length === 0 && <p className={s.hint}>No creatures on this map yet.</p>}
      <div className={s.list}>
        {creatures.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <label className={s.item} style={{ flex: 1 }}>
              <input
                type="checkbox"
                checked={selected.has(t.id)}
                onChange={() => toggle(t.id)}
              />
              <span className={s.itemMain}>
                <span className={s.itemName}>{t.name}</span>
              </span>
            </label>
            <button type="button" className={s.place} onClick={() => setCardName(t.name)}>
              Card
            </button>
          </div>
        ))}
      </div>
      <Button onClick={roll} disabled={selected.size === 0} full>
        Roll initiative ({selected.size})
      </Button>
    </div>
  );
}
