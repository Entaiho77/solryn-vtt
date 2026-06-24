import { useState } from 'react';
import type { SemanticColor, SystemDefinition } from '../../../engine/schema';
import type { Character } from '../../../data/types';
import { computeDerived } from '../../../engine/rules';
import { setPoolCurrent } from '../../../data/characters';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { ResourceTracker, type ResourceColor } from '../../sheet/ResourceTracker';
import { AttacksSection } from '../../sheet/AttacksSection';
import { SpellBookOverlay } from '../../sheet/SpellBookOverlay';
import { PlaySheet } from '../../sheet/PlaySheet';
import s from './drawers.module.css';

const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
const trackerColor = (c?: SemanticColor): ResourceColor =>
  c === 'purple' ? 'purple' : c === 'amber' ? 'amber' : 'teal';

/** The player's quick-view drawer: the things touched every turn (§4.8). */
export function CharacterQuickView({
  system,
  character,
}: {
  system: SystemDefinition;
  character: Character;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  const scores = character.definition.coreScores;
  const armor = system.equipment.armor.find(
    (a) => a.id === character.play.equippedArmorId,
  );
  const equip = armor
    ? { armor: { dr: armor.dr, speedPenalty: armor.speedPenalty } }
    : undefined;
  const derived = computeDerived(system, scores, equip);
  const pools = derived.filter((d) => d.resourcePool);
  const refs = derived.filter((d) => !d.resourcePool);
  const isCaster = character.definition.knownSpellIds.length > 0;

  return (
    <div className={s.section}>
      {pools.map((p) => {
        const max = p.value;
        const current = character.play.pools?.[p.id]?.current ?? max;
        return (
          <ResourceTracker
            key={p.id}
            label={p.abbreviation ?? p.name}
            color={trackerColor(p.color)}
            current={current}
            max={max}
            onChange={(n) => void setPoolCurrent(character.id, p.id, n)}
          />
        );
      })}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        {refs.map((d) => (
          <span key={d.id} className={s.preview}>
            {d.abbreviation ?? d.name}:{' '}
            <strong>
              {d.isRoll ? sign(d.value) : d.value}
              {d.unit ? ` ${d.unit}` : ''}
            </strong>
          </span>
        ))}
      </div>

      <AttacksSection system={system} character={character} />

      <div className={s.row}>
        {isCaster && (
          <Button variant="secondary" size="sm" onClick={() => setBookOpen(true)}>
            Spells
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={() => setSheetOpen(true)}>
          Full sheet
        </Button>
      </div>

      {isCaster && (
        <SpellBookOverlay
          system={system}
          character={character}
          open={bookOpen}
          onClose={() => setBookOpen(false)}
        />
      )}

      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={character.name}
        width={780}
      >
        <PlaySheet system={system} character={character} />
      </Modal>
    </div>
  );
}
