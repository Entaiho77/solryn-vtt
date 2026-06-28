import { useEffect, useRef, useState } from 'react';
import type { SystemDefinition } from '../../engine/schema';
import type { Character, Game, Role, Token } from '../../data/types';
import {
  addToken,
  grabPartyToken,
  moveToken,
  releasePartyToken,
  setGridVisible,
  toggleFogSquare,
} from '../../data/board';
import { gridDimensions } from './boardGeometry';
import { isPartyScale } from './partyMode';
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
import { MonsterStatCard } from './drawers/MonsterStatCard';
import { RollLog } from '../rolllog/rollLog';
import { canSeeMonsterStats } from '../../permissions';
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
  // A persisted initiative can be malformed: Firebase drops empty arrays, so a fully
  // cleared order comes back undefined. Only "active with a non-empty order" is real
  // combat; anything else degrades to no tracker instead of crashing.
  const combatActive =
    !!initState?.active && Array.isArray(initState.order) && initState.order.length > 0;
  const highlightTokenId = combatActive
    ? initState!.order[initState!.turnIndex]?.tokenId
    : undefined;

  const [openLeft, setOpenLeft] = useState<string | null>(null);
  const [openRight, setOpenRight] = useState<string | null>(
    role === 'player' ? 'character' : null,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [measuring, setMeasuring] = useState(false);
  // Session-only GM toggle for grid + measure line color (white for dark maps, black for light).
  const [lineColor, setLineColor] = useState<'white' | 'black'>('white');

  const tool: BoardTool = measuring
    ? 'measure'
    : role === 'gm' && openRight === 'fog'
      ? 'fog'
      : 'select';

  const activeType = activeMap
    ? system.mapTypes.find((t) => t.id === activeMap.typeId)
    : undefined;
  const partyScale = isPartyScale(activeType);
  const measureScale = activeMap
    ? (activeMap.customSquare ?? activeType?.perSquare ?? { value: 1, unit: 'sq' })
    : undefined;

  // Auto-create the player's character token on the active map (once per map). Skipped on
  // travel-scale maps, where the party rides a single shared token instead.
  const attempted = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (role !== 'player' || !character || !activeMap || partyScale) return;
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
  }, [role, character, activeMap, partyScale, tokens, gameId, uid]);

  // On a travel-scale map the party shares one token. The GM's client seeds it (single
  // authority → no duplicate race); any player can then drag it. Once per such map.
  const partyAttempted = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (role !== 'gm' || !activeMap || !partyScale) return;
    const exists = tokens.some((t) => t.kind === 'party' && t.mapId === activeMap.id);
    if (exists || partyAttempted.current.has(activeMap.id)) return;
    partyAttempted.current.add(activeMap.id);
    const { cols, rows } = gridDimensions(activeMap.width, activeMap.height, activeMap.gridSize);
    void addToken(gameId, {
      mapId: activeMap.id,
      kind: 'party',
      name: 'Party',
      col: Math.floor(cols / 2),
      row: Math.floor(rows / 2),
      color: '#e9c46a',
      visible: true,
    });
  }, [role, activeMap, partyScale, tokens, gameId]);

  function toggle(side: 'left' | 'right', id: string) {
    setMeasuring(false); // opening a drawer exits measure mode
    if (side === 'left') setOpenLeft((o) => (o === id ? null : id));
    else setOpenRight((o) => (o === id ? null : id));
  }

  const selected = selectedId ? (tokens.find((t) => t.id === selectedId) ?? null) : null;

  // GM-selected creature → the merged stat card in a proper right-side slide-out panel
  // (same chrome/width as the Add-creature drawer). Other tokens keep the floating TokenCard.
  const showMonsterPanel = !!selected && selected.kind === 'creature' && canSeeMonsterStats(role);
  const monsterPanel =
    showMonsterPanel && selected
      ? {
          title: selected.name,
          content: (
            <MonsterStatCard
              system={system}
              name={selected.name}
              creatureId={selected.creatureId}
              token={selected}
              gameId={gameId}
              onClose={() => setSelectedId(null)}
            />
          ),
          onClose: () => setSelectedId(null),
        }
      : undefined;

  const myName = game.members[uid]?.displayName ?? 'Someone';
  const dice: BarItem = { kind: 'drawer', id: 'dice', label: 'Dice', glyph: '⚄', content: <DiceDrawer /> };
  const log: BarItem = { kind: 'drawer', id: 'log', label: 'Log', glyph: '📜', content: <RollLog /> };
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
    content: <InitiativeDrawer gameId={gameId} game={game} activeMap={activeMap} system={system} />,
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
      ? [initiative, dice, log, chat, rules]
      : [
          dice,
          log,
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
          <AddCreatureDrawer
            system={system}
            gameId={gameId}
            uid={uid}
            activeMap={activeMap}
            tokens={tokens}
          />
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
        kind: 'action',
        id: 'linecolor',
        label: `Grid & measure lines: ${lineColor} — click for ${lineColor === 'white' ? 'black' : 'white'}`,
        glyph: lineColor === 'white' ? '○' : '●',
        active: lineColor === 'black',
        onClick: () => setLineColor((c) => (c === 'white' ? 'black' : 'white')),
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
      rightPanel={monsterPanel}
    >
      <div className={styles.boardArea}>
        {activeMap ? (
          <BoardCanvas
            map={activeMap}
            tokens={tokens}
            role={role}
            uid={uid}
            tool={tool}
            lineColor={lineColor}
            partyScale={partyScale}
            measureScale={measureScale}
            selectedTokenId={selected?.id}
            highlightTokenId={highlightTokenId}
            onMoveToken={(id, col, row) => void moveToken(gameId, id, col, row)}
            onToggleFog={(col, row, f) =>
              activeMap && void toggleFogSquare(gameId, activeMap.id, col, row, f)
            }
            onSelectToken={(t) => setSelectedId(t?.id ?? null)}
            onGrabParty={(id) => void grabPartyToken(gameId, id, uid)}
            onReleaseParty={(id) => void releasePartyToken(gameId, id)}
          />
        ) : (
          <div className={styles.empty}>
            {role === 'gm'
              ? 'Open Maps (right edge) to upload a map and start your board.'
              : 'The GM hasn’t set up a map yet.'}
          </div>
        )}

        {/* Non-creature (or non-GM) tokens keep the floating TokenCard; GM creatures use the
            right-side monster panel (rendered by BoardShell.rightPanel above). */}
        {selected && selected.kind !== 'party' && !showMonsterPanel && (
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

        {combatActive && (
          <InitiativeTracker
            state={initState}
            system={system}
            role={role}
            uid={uid}
            character={character}
            gameId={gameId}
            tokens={game.tokens ?? {}}
            activeMapId={activeMap?.id}
            onSelectToken={(id) => setSelectedId(id)}
          />
        )}
      </div>
    </BoardShell>
  );
}
