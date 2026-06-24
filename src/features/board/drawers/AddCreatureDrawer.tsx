import { useState } from 'react';
import type { SystemDefinition } from '../../../engine/schema';
import type { MapDef, Token } from '../../../data/types';
import { addToken } from '../../../data/board';
import { gridDimensions } from '../boardGeometry';
import { Button } from '../../../components/ui/Button';
import s from './drawers.module.css';

const CREATURE_COLOR = '#b05a5a';
const TRAP_COLOR = '#8a7d52';

export function AddCreatureDrawer({
  system,
  gameId,
  activeMap,
}: {
  system: SystemDefinition;
  gameId: string;
  activeMap?: MapDef;
}) {
  const [tab, setTab] = useState<'bestiary' | 'build'>('bestiary');
  const [name, setName] = useState('');
  const [hp, setHp] = useState('5');
  const [dr, setDr] = useState('0');
  const [damage, setDamage] = useState('1d6');

  if (!activeMap) return <p className={s.hint}>Add a map first, then place creatures.</p>;

  const { cols, rows } = gridDimensions(activeMap.width, activeMap.height, activeMap.gridSize);
  const center = { col: Math.floor(cols / 2), row: Math.floor(rows / 2) };

  function place(token: Omit<Token, 'id' | 'mapId' | 'col' | 'row'>) {
    void addToken(gameId, {
      ...token,
      mapId: activeMap!.id,
      col: center.col,
      row: center.row,
    });
  }

  function placeBestiary(entryId: string) {
    const entry = system.bestiary.find((b) => b.id === entryId);
    if (!entry) return;
    const isTrap = entry.category === 'trap';
    const hpVal = Number(entry.stats.hp);
    place({
      kind: isTrap ? 'trap' : 'creature',
      name: entry.name,
      color: isTrap ? TRAP_COLOR : CREATURE_COLOR,
      visible: true,
      stats: entry.stats,
      ...(Number.isFinite(hpVal) && hpVal > 0
        ? { hp: { current: hpVal, max: hpVal } }
        : {}),
    });
  }

  function quickBuild() {
    const hpVal = Number(hp) || 0;
    place({
      kind: 'creature',
      name: name.trim() || 'Creature',
      color: CREATURE_COLOR,
      visible: true,
      stats: { hp: hpVal, dr: Number(dr) || 0, damage },
      hp: { current: hpVal, max: hpVal },
    });
    setName('');
  }

  return (
    <div>
      <div className={s.tabs}>
        <button
          className={`${s.tab} ${tab === 'bestiary' ? s.tabActive : ''}`}
          onClick={() => setTab('bestiary')}
        >
          Bestiary
        </button>
        <button
          className={`${s.tab} ${tab === 'build' ? s.tabActive : ''}`}
          onClick={() => setTab('build')}
        >
          Quick build
        </button>
      </div>

      {tab === 'bestiary' ? (
        <div className={s.list}>
          {system.bestiary.map((b) => (
            <div key={b.id} className={s.item}>
              <span className={s.itemMain}>
                <span className={s.itemName}>{b.name}</span>
                <span className={s.itemMeta}>
                  {b.category === 'trap'
                    ? `DC ${b.stats.detectionDC ?? '—'}`
                    : `HP ${b.stats.hp ?? '—'} · DR ${b.stats.dr ?? '—'}`}
                </span>
              </span>
              <button className={s.place} onClick={() => placeBestiary(b.id)}>
                + Place
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className={s.section}>
          <input
            className={s.input}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className={s.row}>
            <label className={s.itemMeta}>
              HP
              <input className={s.input} type="number" value={hp} onChange={(e) => setHp(e.target.value)} />
            </label>
            <label className={s.itemMeta}>
              DR
              <input className={s.input} type="number" value={dr} onChange={(e) => setDr(e.target.value)} />
            </label>
            <label className={s.itemMeta}>
              Damage
              <input className={s.input} value={damage} onChange={(e) => setDamage(e.target.value)} />
            </label>
          </div>
          <Button onClick={quickBuild} full>
            Place on board
          </Button>
          <p className={s.hint}>Saving customs to a reusable “my creatures” library comes later.</p>
        </div>
      )}
    </div>
  );
}
