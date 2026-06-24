import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import type { MapDef, Role, Token } from '../../data/types';
import { squareKey } from '../../data/board';
import { canControlToken, fogStyle, tokenVisibility } from '../../permissions';
import {
  cellCenter,
  clampCell,
  gridDimensions,
  gridDistanceSquares,
  pixelToCell,
  tokenAtCell,
} from './boardGeometry';
import styles from './BoardCanvas.module.css';

export type BoardTool = 'select' | 'fog' | 'measure';

const COLORS = {
  board: '#1a1d24',
  grid: 'rgba(255,255,255,0.10)',
  teal: '#5dcaa5',
  amber: '#ef9f27',
  red: '#e24b4a',
  text: '#e6e7ea',
  border: 'rgba(255,255,255,0.45)',
  gray: '#6b7280',
};

interface Segment {
  sc: number;
  sr: number;
  ec: number;
  er: number;
}

interface BoardCanvasProps {
  map: MapDef;
  tokens: Token[];
  role: Role;
  uid: string;
  tool: BoardTool;
  measureScale?: { value: number; unit: string };
  selectedTokenId?: string;
  /** Current-turn combatant's token, drawn with a glow. */
  highlightTokenId?: string;
  onMoveToken: (tokenId: string, col: number, row: number) => void;
  onToggleFog: (col: number, row: number, fogged: boolean) => void;
  onSelectToken: (token: Token | null) => void;
}

const fmt = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');

export function BoardCanvas({
  map,
  tokens,
  role,
  uid,
  tool,
  measureScale,
  selectedTokenId,
  highlightTokenId,
  onMoveToken,
  onToggleFog,
  onSelectToken,
}: BoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [version, bump] = useReducer((v) => v + 1, 0);

  const tokenDrag = useRef<{ id: string } | null>(null);
  const fogPaint = useRef<{ target: boolean; seen: Set<string> } | null>(null);
  const measuringRef = useRef(false);
  const [ghost, setGhost] = useReducer(
    (_: unknown, v: { id: string; col: number; row: number } | null) => v,
    null,
  );
  const [measure, setMeasure] = useState<Segment | null>(null);

  const { cols, rows } = gridDimensions(map.width, map.height, map.gridSize);
  const fog = map.fog ?? {};

  // Leaving measure mode clears any drawn segment.
  useEffect(() => {
    if (tool !== 'measure') setMeasure(null);
  }, [tool]);

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

    const bg = getImage(map.imageUrl);
    if (bg) ctx.drawImage(bg, 0, 0, map.width, map.height);

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

    for (const token of tokens) {
      if (token.mapId !== map.id) continue;
      if (tokenVisibility(token, uid, role) === 'hidden') continue;

      const dragging = ghost?.id === token.id;
      const col = dragging ? ghost!.col : token.col;
      const row = dragging ? ghost!.row : token.row;
      const { x, y } = cellCenter(col, row, g);
      const radius = g * 0.42;

      ctx.save();
      if (token.visible === false) ctx.globalAlpha = 0.45;
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

      if (token.id === highlightTokenId) {
        ctx.strokeStyle = COLORS.teal;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      const selected = token.id === selectedTokenId;
      const sprung = token.kind === 'trap' && token.trapState === 'sprung';
      ctx.lineWidth = selected ? 4 : 2;
      ctx.strokeStyle = selected
        ? COLORS.teal
        : sprung
          ? COLORS.red
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

    // Fog — GM semi-transparent, players opaque.
    const opaque = fogStyle(role) === 'opaque';
    ctx.fillStyle = opaque ? '#0c0e12' : 'rgba(10,12,16,0.55)';
    for (const key of Object.keys(fog)) {
      const [c, r] = key.split(',').map(Number);
      ctx.fillRect(c * g, r * g, g, g);
    }

    // Measure overlay.
    if (measure && measureScale) {
      const a = cellCenter(measure.sc, measure.sr, g);
      const b = cellCenter(measure.ec, measure.er, g);
      ctx.strokeStyle = COLORS.amber;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const squares = gridDistanceSquares(measure.sc, measure.sr, measure.ec, measure.er);
      const label = `${squares} sq · ${fmt(squares * measureScale.value)} ${measureScale.unit}`;
      ctx.font = 'bold 12px sans-serif';
      const w = ctx.measureText(label).width + 12;
      ctx.fillStyle = 'rgba(15,17,21,0.9)';
      ctx.fillRect(b.x + 8, b.y - 12, w, 22);
      ctx.fillStyle = COLORS.amber;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, b.x + 14, b.y - 1);
    }
  }

  useEffect(draw, [
    map,
    tokens,
    role,
    uid,
    selectedTokenId,
    highlightTokenId,
    ghost,
    measure,
    version,
  ]);

  function eventCell(e: MouseEvent<HTMLCanvasElement>) {
    const cell = pixelToCell(e.nativeEvent.offsetX, e.nativeEvent.offsetY, map.gridSize);
    return clampCell(cell.col, cell.row, cols, rows);
  }

  function handleDown(e: MouseEvent<HTMLCanvasElement>) {
    const { col, row } = eventCell(e);

    if (tool === 'measure') {
      measuringRef.current = true;
      setMeasure({ sc: col, sr: row, ec: col, er: row });
      return;
    }

    if (tool === 'fog' && role === 'gm') {
      const fogged = !fog[squareKey(col, row)];
      fogPaint.current = { target: fogged, seen: new Set([squareKey(col, row)]) };
      onToggleFog(col, row, fogged);
      return;
    }

    const hit = tokenAtCell(
      tokens.filter(
        (t) => t.mapId === map.id && tokenVisibility(t, uid, role) !== 'hidden',
      ),
      col,
      row,
    );
    onSelectToken(hit ?? null);
    if (hit && canControlToken(hit, uid, role)) {
      tokenDrag.current = { id: hit.id };
      setGhost({ id: hit.id, col, row });
    }
  }

  function handleMove(e: MouseEvent<HTMLCanvasElement>) {
    const { col, row } = eventCell(e);
    if (measuringRef.current) {
      setMeasure((m) => (m ? { ...m, ec: col, er: row } : m));
    } else if (tokenDrag.current) {
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
    measuringRef.current = false;
    setGhost(null);
  }

  return (
    <div className={styles.scroll}>
      <canvas
        ref={canvasRef}
        width={map.width}
        height={map.height}
        className={`${styles.canvas} ${tool !== 'select' ? styles.fogCursor : ''}`}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
      />
    </div>
  );
}
