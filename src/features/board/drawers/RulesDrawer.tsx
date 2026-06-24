import { useState } from 'react';
import type { SystemDefinition } from '../../../engine/schema';
import s from './drawers.module.css';

/** Read-only quick reference, generated from system data (§4.8) — free for any system. */
export function RulesDrawer({ system }: { system: SystemDefinition }) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const cards = system.rulesReference.filter(
    (c) =>
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query),
  );
  const conditions = system.conditions.filter(
    (c) => !query || c.name.toLowerCase().includes(query),
  );

  return (
    <div className={s.section}>
      <input
        className={s.input}
        placeholder={`Search ${system.name} rules…`}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className={s.list}>
        {cards.map((c) => (
          <div key={c.id} className={s.preview}>
            <div className={s.itemName}>{c.name}</div>
            <p className={s.hint}>{c.description}</p>
            {c.details && <p className={s.hint} style={{ opacity: 0.8 }}>{c.details}</p>}
          </div>
        ))}
      </div>

      {conditions.length > 0 && (
        <>
          <span className={s.label}>Conditions</span>
          <div className={s.list}>
            {conditions.map((c) => (
              <div key={c.id} className={s.preview}>
                <div className={s.itemName}>{c.name}</div>
                <p className={s.hint}>{c.description}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {cards.length === 0 && conditions.length === 0 && (
        <p className={s.hint}>Nothing matches “{q}”.</p>
      )}
    </div>
  );
}
