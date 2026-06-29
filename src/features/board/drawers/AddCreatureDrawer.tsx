import { useState } from 'react';
import type { SystemDefinition } from '../../../engine/schema';
import type { MapDef, Token } from '../../../data/types';
import { addToken } from '../../../data/board';
import {
  deleteCreature,
  saveCreature,
  setSavedCreatureImage,
  useMyCreatures,
} from '../../../data/creatures';
import { firstFreeCell, gridDimensions } from '../boardGeometry';
import { Button } from '../../../components/ui/Button';
import { TokenArtUpload } from '../../../components/ui/TokenArtUpload';
import s from './drawers.module.css';

const CREATURE_COLOR = '#b05a5a';
const TRAP_COLOR = '#8a7d52';

type Category = 'creature' | 'trap';

export function AddCreatureDrawer({
  system,
  gameId,
  uid,
  activeMap,
  tokens,
}: {
  system: SystemDefinition;
  gameId: string;
  uid: string;
  activeMap?: MapDef;
  tokens: Token[];
}) {
  const [tab, setTab] = useState<'bestiary' | 'mine' | 'build'>('bestiary');
  const [category, setCategory] = useState<Category>('creature');
  const [name, setName] = useState('');
  const [hp, setHp] = useState('5');
  const [dr, setDr] = useState('0');
  const [damage, setDamage] = useState('1d6');
  const [init, setInit] = useState('0');
  const [detectionDC, setDetectionDC] = useState('13');
  const [trigger, setTrigger] = useState('Entering the space');
  const [effect, setEffect] = useState('1d6');
  const [disarmDC, setDisarmDC] = useState('13');
  const [save, setSave] = useState(true);

  const myCreatures = useMyCreatures(uid);

  if (!activeMap) return <p className={s.hint}>Add a map first, then place creatures.</p>;

  const { cols, rows } = gridDimensions(activeMap.width, activeMap.height, activeMap.gridSize);
  const center = { col: Math.floor(cols / 2), row: Math.floor(rows / 2) };

  function place(token: Omit<Token, 'id' | 'mapId' | 'col' | 'row'>) {
    // Drop onto the nearest free cell to centre so multiple creatures don't pile up on
    // one square (which would hide all but the topmost). Click-cycling is the safety net
    // if a rapid burst places faster than tokens sync back.
    const occupied = new Set(
      tokens.filter((t) => t.mapId === activeMap!.id).map((t) => `${t.col},${t.row}`),
    );
    const cell = firstFreeCell(occupied, center.col, center.row, cols, rows);
    void addToken(gameId, { ...token, mapId: activeMap!.id, col: cell.col, row: cell.row });
  }

  function placeStatBlock(
    blockName: string,
    cat: Category,
    stats: Record<string, number | string>,
    creatureId?: string,
  ) {
    const isTrap = cat === 'trap';
    const hpVal = Number(stats.hp);
    place({
      kind: isTrap ? 'trap' : 'creature',
      name: blockName,
      color: isTrap ? TRAP_COLOR : CREATURE_COLOR,
      visible: !isTrap, // traps start hidden until the GM reveals/springs them
      stats,
      ...(creatureId ? { creatureId } : {}),
      ...(isTrap ? { trapState: 'hidden' as const } : {}),
      ...(!isTrap && Number.isFinite(hpVal) && hpVal > 0
        ? { hp: { current: hpVal, max: hpVal } }
        : {}),
    });
  }

  function build() {
    const stats: Record<string, number | string> =
      category === 'creature'
        ? { hp: Number(hp) || 0, dr: Number(dr) || 0, damage, initiativeMod: Number(init) || 0 }
        : {
            detectionDC: Number(detectionDC) || 0,
            trigger,
            effect,
            disarmDC: Number(disarmDC) || 0,
          };
    const blockName = name.trim() || (category === 'trap' ? 'Trap' : 'Creature');
    placeStatBlock(blockName, category, stats);
    if (save) void saveCreature(uid, { name: blockName, category, stats });
    setName('');
  }

  return (
    <div>
      <div className={s.tabs}>
        {(['bestiary', 'mine', 'build'] as const).map((t) => (
          <button
            key={t}
            className={`${s.tab} ${tab === t ? s.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'bestiary' ? 'Bestiary' : t === 'mine' ? 'Saved' : 'Build'}
          </button>
        ))}
      </div>

      {tab === 'bestiary' && (
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
              <button
                className={s.place}
                onClick={() => placeStatBlock(b.name, b.category as Category, b.stats, b.id)}
              >
                + Place
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'mine' && (
        <div className={s.list}>
          {myCreatures.length === 0 && (
            <p className={s.hint}>Nothing saved yet. Build one and tick “Save”.</p>
          )}
          {myCreatures.map((c) => (
            <div key={c.id} className={s.section} style={{ gap: 'var(--space-2)' }}>
              <div className={s.item}>
                <span className={s.itemMain}>
                  <span className={s.itemName}>{c.name}</span>
                  <span className={s.itemMeta}>{c.category}</span>
                </span>
                <button className={s.place} onClick={() => placeStatBlock(c.name, c.category, c.stats, c.id)}>
                  + Place
                </button>
                <button
                  className={s.place}
                  style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}
                  onClick={() => void deleteCreature(uid, c.id)}
                  aria-label={`Delete ${c.name}`}
                >
                  ×
                </button>
              </div>
              <TokenArtUpload
                scope={uid}
                imageUrl={c.imageUrl}
                label="art"
                size={44}
                onChange={(url) => void setSavedCreatureImage(uid, c.id, url)}
                onClear={() => void setSavedCreatureImage(uid, c.id, null)}
              />
            </div>
          ))}
        </div>
      )}

      {tab === 'build' && (
        <div className={s.section}>
          <div className={s.tabs}>
            {(['creature', 'trap'] as const).map((c) => (
              <button
                key={c}
                className={`${s.tab} ${category === c ? s.tabActive : ''}`}
                onClick={() => setCategory(c)}
              >
                {c === 'creature' ? 'Creature' : 'Trap'}
              </button>
            ))}
          </div>

          <input
            className={s.input}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {category === 'creature' ? (
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
              <label className={s.itemMeta}>
                Init
                <input className={s.input} type="number" value={init} onChange={(e) => setInit(e.target.value)} />
              </label>
            </div>
          ) : (
            <>
              <div className={s.row}>
                <label className={s.itemMeta}>
                  Spot DC
                  <input className={s.input} type="number" value={detectionDC} onChange={(e) => setDetectionDC(e.target.value)} />
                </label>
                <label className={s.itemMeta}>
                  Disarm DC
                  <input className={s.input} type="number" value={disarmDC} onChange={(e) => setDisarmDC(e.target.value)} />
                </label>
              </div>
              <input className={s.input} placeholder="Trigger" value={trigger} onChange={(e) => setTrigger(e.target.value)} />
              <input className={s.input} placeholder="Effect / damage" value={effect} onChange={(e) => setEffect(e.target.value)} />
            </>
          )}

          <label className={s.toggleRow}>
            <span>Save to my creatures</span>
            <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} />
          </label>
          <Button onClick={build} full>
            Place on board
          </Button>
          {category === 'trap' && (
            <p className={s.hint}>Traps are placed hidden — reveal or spring them from the token card.</p>
          )}
        </div>
      )}
    </div>
  );
}
