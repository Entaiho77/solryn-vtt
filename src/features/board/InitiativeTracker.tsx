import type { SystemDefinition } from '../../engine/schema';
import type { Character, InitiativeState, Role, Token } from '../../data/types';
import { computeDerived } from '../../engine/rules';
import {
  addCombatant,
  endCombat,
  nextTurn,
  rollInitiative,
  setTurn,
} from '../../data/combat';
import { Button } from '../../components/ui/Button';
import t from './InitiativeTracker.module.css';

/** Width (px) of one combatant slot in the carousel — must match `.slot` in the CSS. */
const SLOT = 100;

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
  onSelectToken,
}: {
  state: InitiativeState;
  system: SystemDefinition;
  role: Role;
  uid: string;
  character?: Character;
  gameId: string;
  tokens: Record<string, Token>;
  activeMapId?: string;
  onSelectToken?: (tokenId: string) => void;
}) {
  const current = state.order[state.turnIndex];
  const isMyTurn = current?.ownerUserId === uid;
  const inOrder = character
    ? state.order.some((o) => o.characterId === character.id)
    : true;
  const canRollIn = role === 'player' && character && activeMapId && !inOrder;
  const canJump = role === 'gm'; // GM can jump the turn by clicking a combatant

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
  const jumpTo = (i: number) => void setTurn(gameId, state, i);

  // Slide the track so the active combatant's center sits at the carousel's center.
  const trackX = -(state.turnIndex * SLOT + SLOT / 2);

  return (
    <div className={t.bar}>
      <div className={t.round}>
        <span className={t.roundLabel}>Round</span>
        <span className={t.roundNum}>{state.round}</span>
      </div>

      <div className={t.carousel}>
        <div className={t.track} style={{ transform: `translateX(${trackX}px)` }}>
          {state.order.map((com, i) => {
            const isCurrent = i === state.turnIndex;
            const dist = Math.abs(i - state.turnIndex);
            // Shrink + fade with distance from center; the active one is full-size.
            const scale = isCurrent ? 1 : Math.max(0.6, 1 - 0.17 * dist);
            const opacity = isCurrent ? 1 : Math.max(0.25, 1 - 0.3 * dist);
            const tok = com.tokenId ? tokens[com.tokenId] : undefined;
            const defeated = com.kind === 'creature' && tok?.defeated;
            const canJumpHere = canJump && !isCurrent;
            // A tap selects the token (surfaces its card); GMs also jump the turn.
            const interactive = canJumpHere || Boolean(tok && onSelectToken);
            const activate = () => {
              if (tok && onSelectToken) onSelectToken(tok.id);
              if (canJumpHere) jumpTo(i);
            };
            return (
              <div key={com.id} className={t.slot}>
                <div
                  className={[
                    t.combatant,
                    isCurrent ? t.current : '',
                    defeated ? t.defeated : '',
                    interactive ? t.clickable : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ transform: `scale(${scale})`, opacity }}
                  onClick={interactive ? activate : undefined}
                  role={interactive ? 'button' : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  onKeyDown={
                    interactive
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            activate();
                          }
                        }
                      : undefined
                  }
                  title={
                    tok
                      ? `View ${com.name}${canJumpHere ? ' · jump to turn' : ''}`
                      : canJumpHere
                        ? `Jump to ${com.name}’s turn`
                        : undefined
                  }
                >
                  {isCurrent && <span className={t.turnLabel}>current turn</span>}
                  <span
                    className={t.disk}
                    style={{ background: com.kind === 'character' ? '#5dcaa5' : '#b05a5a' }}
                  >
                    {com.name[0]?.toUpperCase() ?? '?'}
                  </span>
                  <span className={t.cname}>{com.name}</span>
                  <span className={t.init}>{com.initiative}</span>
                </div>
              </div>
            );
          })}
        </div>
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
