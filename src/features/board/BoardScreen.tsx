import { useEffect, useRef, useState } from 'react';
import type { SystemDefinition } from '../../engine/schema';
import type { Character, Game, Role, Token } from '../../data/types';
import {
  addToken,
  moveToken,
  setGridVisible,
  toggleFogSquare,
} from '../../data/board';
import { BoardShell, type BarItem } from './BoardShell';
import { BoardCanvas, type BoardTool } from './BoardCanvas';
import { TokenCard } from './TokenCard';
import { InitiativeTracker } from './InitiativeTracker';
import { InitiativeDrawer } from './drawers/InitiativeDrawer';
import { MapsDrawer } from './drawers/MapsDrawer';
import { FogDrawer } from './drawers/FogDrawer';
import { AddCreatureDrawer } from './drawers/AddCreatureDrawer';
import { DiceDrawer } from './drawers/DiceDrawer';
import { RulesDrawer } from './drawers/RulesDrawer';
import { ChatDrawer } from './drawers/ChatDrawer';
import { NotesDrawer } from './drawers/NotesDrawer';
import { CharacterQuickView } from './drawers/CharacterQuickView';
import styles from './BoardScreen.module.css';

interface BoardScreenProps {
  system: SystemDefinition;
  game: Game;
  role: Role;
  uid: string;
  character?: Character;
}

export function BoardScreen({ system, game, role, uid, character }: BoardScreenProps) {
  const gameId = game.id;
  const tokens: Token[] = Object.values(game.tokens ?? {});
  const activeMap = game.activeMapId ? game.maps?.[game.activeMapId] : undefined;
  const initState = game.initiative;
  const highlightTokenId = initState?.active
    ? initState.order[initState.turnIndex]?.tokenId
    : undefined;

  const [openLeft, setOpenLeft] = useState<string | null>(null);
  const [openRight, setOpenRight] = useState<string | null>(
    role === 'player' ? 'character' : null,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [measuring, setMeasuring] = useState(false);

  const tool: BoardTool = measuring
    ? 'measure'
    : role === 'gm' && openRight === 'fog'
      ? 'fog'
      : 'select';

  const activeType = activeMap
    ? system.mapTypes.find((t) => t.id === activeMap.typeId)
    : undefined;
  const measureScale = activeMap
    ? (activeMap.customSquare ?? activeType?.perSquare ?? { value: 1, unit: 'sq' })
    : undefined;

  // Auto-create the player's character token on the active map (once per map).
  const attempted = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (role !== 'player' || !character || !activeMap) return;
    const exists = tokens.some(
      (t) => t.characterId === character.id && t.mapId === activeMap.id,
    );
    if (exists || attempted.current.has(activeMap.id)) return;
    attempted.current.add(activeMap.id);
    const count = tokens.filter(
      (t) => t.kind === 'character' && t.mapId === activeMap.id,
    ).length;
    void addToken(gameId, {
      mapId: activeMap.id,
      kind: 'character',
      name: character.name,
      col: count,
      row: 0,
      color: '#5dcaa5',
      visible: true,
      ownerUserId: uid,
      characterId: character.id,
    });
  }, [role, character, activeMap, tokens, gameId, uid]);

  function toggle(side: 'left' | 'right', id: string) {
    setMeasuring(false); // opening a drawer exits measure mode
    if (side === 'left') setOpenLeft((o) => (o === id ? null : id));
    else setOpenRight((o) => (o === id ? null : id));
  }

  const selected = selectedId ? (tokens.find((t) => t.id === selectedId) ?? null) : null;

  const myName = game.members[uid]?.displayName ?? 'Someone';
  const dice: BarItem = { kind: 'drawer', id: 'dice', label: 'Dice', glyph: '⚄', content: <DiceDrawer /> };
  const chat: BarItem = {
    kind: 'drawer',
    id: 'chat',
    label: 'Chat',
    glyph: '✉',
    content: <ChatDrawer gameId={gameId} uid={uid} displayName={myName} members={game.members} />,
  };
  const rules: BarItem = { kind: 'drawer', id: 'rules', label: 'Rules', glyph: 'ℹ', content: <RulesDrawer system={system} /> };

  const initiative: BarItem = {
    kind: 'drawer',
    id: 'initiative',
    label: 'Initiative',
    glyph: '⚔',
    content: <InitiativeDrawer gameId={gameId} game={game} activeMap={activeMap} />,
  };

  // Distance measuring is available to everyone — players measure their own movement/range.
  const measureAction: BarItem = {
    kind: 'action',
    id: 'measure',
    label: 'Measure distance',
    glyph: '↔',
    active: measuring,
    onClick: () => setMeasuring((m) => !m),
  };

  const left: BarItem[] =
    role === 'gm'
      ? [initiative, dice, chat, rules]
      : [
          dice,
          chat,
          { kind: 'drawer', id: 'notes', label: 'Notes', glyph: '✎', content: <NotesDrawer uid={uid} gameId={gameId} /> },
          rules,
        ];

  let right: BarItem[] = [];
  if (role === 'gm') {
    right = [
      measureAction,
      { kind: 'divider', id: 'd1' },
      {
        kind: 'drawer',
        id: 'fog',
        label: 'Fog of war',
        glyph: '☁',
        content: <FogDrawer gameId={gameId} activeMap={activeMap} />,
      },
      {
        kind: 'drawer',
        id: 'creatures',
        label: 'Add creature',
        glyph: '✚',
        content: (
          <AddCreatureDrawer system={system} gameId={gameId} uid={uid} activeMap={activeMap} />
        ),
      },
      { kind: 'divider', id: 'd2' },
      {
        kind: 'action',
        id: 'grid',
        label: 'Toggle grid',
        glyph: '#',
        active: activeMap?.gridVisible,
        onClick: () =>
          activeMap && void setGridVisible(gameId, activeMap.id, !activeMap.gridVisible),
      },
      {
        kind: 'drawer',
        id: 'maps',
        label: 'Maps',
        glyph: '▦',
        content: <MapsDrawer system={system} gameId={gameId} game={game} />,
      },
    ];
  } else if (character) {
    right = [
      measureAction,
      { kind: 'divider', id: 'pd1' },
      {
        kind: 'drawer',
        id: 'character',
        label: 'Character',
        glyph: '◈',
        content: (
          <CharacterQuickView
            system={system}
            character={character}
            canLevelUp={character.play.level < (game.levelGrant ?? 1)}
          />
        ),
      },
    ];
  }

  return (
    <BoardShell
      left={left}
      right={right}
      openLeft={openLeft}
      openRight={openRight}
      onToggle={toggle}
    >
      <div className={styles.boardArea}>
        {activeMap ? (
          <BoardCanvas
            map={activeMap}
            tokens={tokens}
            role={role}
            uid={uid}
            tool={tool}
            measureScale={measureScale}
            selectedTokenId={selected?.id}
            highlightTokenId={highlightTokenId}
            onMoveToken={(id, col, row) => void moveToken(gameId, id, col, row)}
            onToggleFog={(col, row, f) =>
              activeMap && void toggleFogSquare(gameId, activeMap.id, col, row, f)
            }
            onSelectToken={(t) => setSelectedId(t?.id ?? null)}
          />
        ) : (
          <div className={styles.empty}>
            {role === 'gm'
              ? 'Open Maps (right edge) to upload a map and start your board.'
              : 'The GM hasn’t set up a map yet.'}
          </div>
        )}

        {selected && (
          <TokenCard
            token={selected}
            system={system}
            role={role}
            uid={uid}
            gameId={gameId}
            viewerCharacter={character}
            onClose={() => setSelectedId(null)}
          />
        )}

        {initState?.active && (
          <InitiativeTracker
            state={initState}
            system={system}
            role={role}
            uid={uid}
            character={character}
            gameId={gameId}
            tokens={game.tokens ?? {}}
            activeMapId={activeMap?.id}
          />
        )}
      </div>
    </BoardShell>
  );
}
