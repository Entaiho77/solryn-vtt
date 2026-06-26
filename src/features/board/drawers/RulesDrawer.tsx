import { useState } from 'react';
import type { SystemDefinition } from '../../../engine/schema';
import s from './drawers.module.css';

/** One collapsible reference entry: name-only until clicked, then its description. */
function RuleItem({
  name,
  description,
  details,
  open,
  onToggle,
}: {
  name: string;
  description: string;
  details?: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={s.ruleRow}>
      <button type="button" className={s.ruleHead} onClick={onToggle} aria-expanded={open}>
        <span className={s.itemName}>{name}</span>
        <span className={s.caret} aria-hidden>
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open && (
        <div className={s.preview}>
          <p className={s.hint} style={{ margin: 0 }}>
            {description}
          </p>
          {details && (
            <p className={s.hint} style={{ opacity: 0.8, margin: 'var(--space-1) 0 0' }}>
              {details}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Read-only quick reference, generated from system data (§4.8) — free for any system. */
export function RulesDrawer({ system }: { system: SystemDefinition }) {
  const [q, setQ] = useState('');
  // Manually-expanded entry ids. An active search expands every shown match on top of these
  // so you can read why it matched — the search filter itself is unchanged.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
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

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const isOpen = (id: string) => query !== '' || expanded.has(id);

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
          <RuleItem
            key={c.id}
            name={c.name}
            description={c.description}
            details={c.details}
            open={isOpen(`card:${c.id}`)}
            onToggle={() => toggle(`card:${c.id}`)}
          />
        ))}
      </div>

      {conditions.length > 0 && (
        <>
          <span className={s.label}>Conditions</span>
          <div className={s.list}>
            {conditions.map((c) => (
              <RuleItem
                key={c.id}
                name={c.name}
                description={c.description}
                open={isOpen(`cond:${c.id}`)}
                onToggle={() => toggle(`cond:${c.id}`)}
              />
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
