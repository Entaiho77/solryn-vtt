import { useEffect, useReducer, useRef, type MouseEvent } from 'react';
import type { MapDef, Role, Token } from '../../data/types';
import { squareKey } from '../../data/board';
import {
  canControlToken,
  fogStyle,
  tokenVisibility,
} from '../../permissions';
import {
  cellCenter,
  clampCell,
  gridDimensions,
  pixelToCell,
  tokenAtCell,
} from './boardGeometry';
import styles from './BoardCanvas.module.css';

export type BoardTool = 'select' | 'fog';

const COLORS = {
  board: '#1a1d24',
  grid: 'rgba(255,255,255,0.10)',
  teal: '#5dcaa5',
  text: '#e6e7ea',
  border: 'rgba(255,255,255,0.45)',
  gray: '#6b7280',
};

interface BoardCanvasProps {
  map: MapDef;
  tokens: Token[];
  role: Role;
  uid: string;
  tool: BoardTool;
  selectedTokenId?: string;
  onMoveToken: (tokenId: string, col: number, row: number) => void;
  onToggleFog: (col: number, row: number, fogged: boolean) => void;
  onSelectToken: (token: Token | null) => void;
}

export function BoardCanvas({
  map,
  tokens,
  role,
  uid,
  tool,
  selectedTokenId,
  onMoveToken,
  onToggleFog,
  onSelectToken,
}: BoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [version, bump] = useReducer((v) => v + 1, 0);

  // Drag state (token move and fog paint) kept in refs so handlers stay stable.
  const tokenDrag = useRef<{ id: string; col: number; row: number } | null>(null);
  const fogPaint = useRef<{ target: boolean; seen: Set<string> } | null>(null);
  const [ghost, setGhost] = useReducer(
    (_: unknown, v: { id: string; col: number; row: number } | null) => v,
    null,
  );

  const { cols, rows } = gridDimensions(map.width, map.height, map.gridSize);
  const fog = map.fog ?? {};

  function getImage(src?: string): HTMLImageElement | null {
    if (!src) return null;
    const cache = imgCache.current;
    const existing = cache.get(src);
    if (existing) return existing.complete && existing.naturalWidth > 0 ? existing : null;
    const img = new Image();
    img.onload = () => bump();
    img.src = src;
    cache.set(src, img);
    return null;
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const g = map.gridSize;

    ctx.clearRect(0, 0, map.width, map.height);
    ctx.fillStyle = COLORS.board;
    ctx.fillRect(0, 0, map.width, map.height);

    // Map image — placed at top-left, never stretched.
    const bg = getImage(map.imageUrl);
    if (bg) ctx.drawImage(bg, 0, 0, map.width, map.height);

    // Grid overlay.
    if (map.gridVisible) {
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        ctx.moveTo(c * g, 0);
        ctx.lineTo(c * g, rows * g);
      }
      for (let r = 0; r <= rows; r++) {
        ctx.moveTo(0, r * g);
        ctx.lineTo(cols * g, r * g);
      }
      ctx.stroke();
    }

    // Tokens (permission-filtered).
    for (const token of tokens) {
      if (token.mapId !== map.id) continue;
      const view = tokenVisibility(token, uid, role);
      if (view === 'hidden') continue;

      const dragging = ghost?.id === token.id;
      const col = dragging ? ghost!.col : token.col;
      const row = dragging ? ghost!.row : token.row;
      const { x, y } = cellCenter(col, row, g);
      const radius = g * 0.42;

      ctx.save();
      if (token.visible === false) ctx.globalAlpha = 0.45; // GM-only dimmed hidden token
      if (token.defeated) ctx.globalAlpha = 0.35;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      const art = getImage(token.imageUrl);
      if (art) {
        ctx.save();
        ctx.clip();
        ctx.drawImage(art, x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();
      } else {
        ctx.fillStyle = token.color ?? COLORS.gray;
        ctx.fill();
        ctx.fillStyle = '#0f1115';
        ctx.font = `bold ${Math.round(radius)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((token.name[0] ?? '?').toUpperCase(), x, y + 1);
      }

      const selected = token.id === selectedTokenId;
      ctx.lineWidth = selected ? 4 : 2;
      ctx.strokeStyle = selected
        ? COLORS.teal
        : token.defeated
          ? COLORS.gray
          : COLORS.border;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = COLORS.text;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(token.name, x, y + radius + 3);
      ctx.restore();
    }

    // Fog — same data, rendered two ways: GM semi-transparent, players opaque.
    const opaque = fogStyle(role) === 'opaque';
    ctx.fillStyle = opaque ? '#0c0e12' : 'rgba(10,12,16,0.55)';
    for (const key of Object.keys(fog)) {
      const [c, r] = key.split(',').map(Number);
      ctx.fillRect(c * g, r * g, g, g);
    }
  }

  // Redraw on any input change (version bumps when an image finishes loading).
  useEffect(draw, [map, tokens, role, uid, selectedTokenId, ghost, version]);

  function eventCell(e: MouseEvent<HTMLCanvasElement>) {
    const cell = pixelToCell(e.nativeEvent.offsetX, e.nativeEvent.offsetY, map.gridSize);
    return clampCell(cell.col, cell.row, cols, rows);
  }

  function handleDown(e: MouseEvent<HTMLCanvasElement>) {
    const { col, row } = eventCell(e);

    if (tool === 'fog' && role === 'gm') {
      const fogged = !fog[squareKey(col, row)];
      fogPaint.current = { target: fogged, seen: new Set([squareKey(col, row)]) };
      onToggleFog(col, row, fogged);
      return;
    }

    const hit = tokenAtCell(
      tokens.filter((t) => t.mapId === map.id && tokenVisibility(t, uid, role) !== 'hidden'),
      col,
      row,
    );
    onSelectToken(hit ?? null);
    if (hit && canControlToken(hit, uid, role)) {
      tokenDrag.current = { id: hit.id, col, row };
      setGhost({ id: hit.id, col, row });
    }
  }

  function handleMove(e: MouseEvent<HTMLCanvasElement>) {
    const { col, row } = eventCell(e);
    if (tokenDrag.current) {
      if (ghost?.col !== col || ghost?.row !== row) {
        setGhost({ id: tokenDrag.current.id, col, row });
      }
    } else if (fogPaint.current) {
      const key = squareKey(col, row);
      if (!fogPaint.current.seen.has(key)) {
        fogPaint.current.seen.add(key);
        onToggleFog(col, row, fogPaint.current.target);
      }
    }
  }

  function handleUp() {
    if (tokenDrag.current && ghost) {
      onMoveToken(tokenDrag.current.id, ghost.col, ghost.row);
    }
    tokenDrag.current = null;
    fogPaint.current = null;
    setGhost(null);
  }

  return (
    <div className={styles.scroll}>
      <canvas
        ref={canvasRef}
        width={map.width}
        height={map.height}
        className={`${styles.canvas} ${tool === 'fog' ? styles.fogCursor : ''}`}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
      />
    </div>
  );
}
