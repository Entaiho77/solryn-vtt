import { useEffect, useRef } from 'react';
import type { SystemDefinition } from '../../engine/schema';
import type { Character, InitiativeState, Role, Token } from '../../data/types';
import { computeDerived } from '../../engine/rules';
import { addCombatant, endCombat, nextTurn, rollInitiative } from '../../data/combat';
import { Button } from '../../components/ui/Button';
import t from './InitiativeTracker.module.css';

function initiativeModifier(system: SystemDefinition, character: Character): number {
  const armor = system.equipment.armor.find(
    (a) => a.id === character.play.equippedArmorId,
  );
  const equip = armor ? { armor: { dr: armor.dr, speedPenalty: armor.speedPenalty } } : undefined;
  const roll = computeDerived(system, character.definition.coreScores, equip).find(
    (d) => d.isRoll,
  );
  return roll?.value ?? 0;
}

export function InitiativeTracker({
  state,
  system,
  role,
  uid,
  character,
  gameId,
  tokens,
  activeMapId,
}: {
  state: InitiativeState;
  system: SystemDefinition;
  role: Role;
  uid: string;
  character?: Character;
  gameId: string;
  tokens: Record<string, Token>;
  activeMapId?: string;
}) {
  const currentRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    currentRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [state.turnIndex, state.order.length]);

  const current = state.order[state.turnIndex];
  const isMyTurn = current?.ownerUserId === uid;
  const inOrder = character
    ? state.order.some((o) => o.characterId === character.id)
    : true;
  const canRollIn = role === 'player' && character && activeMapId && !inOrder;

  function rollMeIn() {
    if (!character || !activeMapId) return;
    const token = Object.values(tokens).find(
      (tk) => tk.characterId === character.id && tk.mapId === activeMapId,
    );
    void addCombatant(gameId, state, {
      id: `char:${character.id}`,
      name: character.name,
      kind: 'character',
      characterId: character.id,
      ownerUserId: uid,
      ...(token ? { tokenId: token.id } : {}),
      ...rollInitiative(initiativeModifier(system, character)),
    });
  }

  const advance = () => void nextTurn(gameId, state, tokens);

  return (
    <div className={t.bar}>
      <div className={t.round}>
        <span className={t.roundLabel}>Round</span>
        <span className={t.roundNum}>{state.round}</span>
      </div>

      <div className={t.strip}>
        {state.order.map((com, i) => {
          const isCurrent = i === state.turnIndex;
          const tok = com.tokenId ? tokens[com.tokenId] : undefined;
          const defeated = com.kind === 'creature' && tok?.defeated;
          return (
            <div
              key={com.id}
              ref={isCurrent ? currentRef : undefined}
              className={`${t.combatant} ${isCurrent ? t.current : ''} ${defeated ? t.defeated : ''}`}
            >
              <span
                className={t.disk}
                style={{ background: com.kind === 'character' ? '#5dcaa5' : '#b05a5a' }}
              >
                {com.name[0]?.toUpperCase() ?? '?'}
              </span>
              <span className={t.cname}>{com.name}</span>
              <span className={t.init}>{com.initiative}</span>
            </div>
          );
        })}
      </div>

      <div className={t.controls}>
        {canRollIn && (
          <Button size="sm" onClick={rollMeIn} className={t.pulse}>
            Roll initiative
          </Button>
        )}
        {isMyTurn && (
          <Button size="sm" onClick={advance}>
            End turn
          </Button>
        )}
        {role === 'gm' && (
          <>
            <Button size="sm" onClick={advance}>
              Next ›
            </Button>
            <Button size="sm" variant="danger" onClick={() => void endCombat(gameId)}>
              End
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
