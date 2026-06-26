import { useEffect, useReducer, useRef, useState, type MouseEvent } from 'react';
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
import {
  pan,
  screenToWorld,
  worldToScreen,
  zoomAt,
  type Camera,
} from './boardCamera';
import styles from './BoardCanvas.module.css';

export type BoardTool = 'select' | 'fog' | 'measure';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

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
  /** GM-chosen grid + measure line color (session-only): white for dark maps, black for light. */
  lineColor: 'white' | 'black';
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
  lineColor,
  measureScale,
  selectedTokenId,
  highlightTokenId,
  onMoveToken,
  onToggleFog,
  onSelectToken,
}: BoardCanvasProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [version, bump] = useReducer((v) => v + 1, 0);

  // Camera: screen = world * zoom + (x, y). Kept in a ref so pan/zoom don't re-render React.
  const camera = useRef<Camera>({ zoom: 1, x: 0, y: 0 });

  const tokenDrag = useRef<{ id: string } | null>(null);
  const fogPaint = useRef<{ target: boolean; seen: Set<string> } | null>(null);
  const measuringRef = useRef(false);
  const panRef = useRef<{ lastX: number; lastY: number } | null>(null);
  const [panning, setPanning] = useState(false);
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

  // Escape clears an active measuring line.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        measuringRef.current = false;
        setMeasure(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Size the canvas backing buffer to the viewport (the camera, not the map, defines size).
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      canvas.width = Math.max(1, wrap.clientWidth);
      canvas.height = Math.max(1, wrap.clientHeight);
      bump();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // Wheel zoom toward the cursor (non-passive so we can preventDefault the page scroll).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = canvas!.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const next = zoomAt(camera.current, sx, sy, factor, MIN_ZOOM, MAX_ZOOM);
      if (next === camera.current) return;
      camera.current = next;
      bump();
    }
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

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
    const cam = camera.current;

    // Clear + viewport backdrop in screen space, then switch into world space via the camera.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.board;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(cam.zoom, 0, 0, cam.zoom, cam.x, cam.y);

    const bg = getImage(map.imageUrl);
    if (bg) ctx.drawImage(bg, 0, 0, map.width, map.height);

    // Grid + measure line color: a single GM toggle (session-only), white or black, so the GM
    // can match whichever map is loaded (light maps → black, dark maps → white).
    const dark = lineColor === 'black';
    const gridColor = dark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.45)';
    const measureColor = dark ? '#000000' : '#ffffff';

    if (map.gridVisible) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1 / cam.zoom; // keep grid lines ~1px on screen at any zoom
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
        ctx.lineWidth = 3 / cam.zoom;
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      const selected = token.id === selectedTokenId;
      const sprung = token.kind === 'trap' && token.trapState === 'sprung';
      ctx.lineWidth = (selected ? 4 : 2) / cam.zoom;
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
      ctx.strokeStyle = measureColor;
      ctx.lineWidth = 2 / cam.zoom;
      ctx.setLineDash([6 / cam.zoom, 4 / cam.zoom]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const squares = gridDistanceSquares(measure.sc, measure.sr, measure.ec, measure.er);
      const label = `${squares} sq · ${fmt(squares * measureScale.value)} ${measureScale.unit}`;
      // Draw the label at a constant on-screen size regardless of zoom.
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const sb = worldToScreen(cam, b.x, b.y);
      ctx.font = 'bold 12px sans-serif';
      const w = ctx.measureText(label).width + 12;
      ctx.fillStyle = 'rgba(15,17,21,0.9)';
      ctx.fillRect(sb.x + 8, sb.y - 12, w, 22);
      ctx.fillStyle = COLORS.amber;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, sb.x + 14, sb.y - 1);
      ctx.restore();
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

  /** Mouse event → world (map) pixel coords, undoing the camera. */
  function eventCell(e: MouseEvent<HTMLCanvasElement>) {
    const w = screenToWorld(camera.current, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    const cell = pixelToCell(w.x, w.y, map.gridSize);
    return clampCell(cell.col, cell.row, cols, rows);
  }

  function handleDown(e: MouseEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return; // left button only (right-click handled separately)
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
    } else {
      // Empty space → pan the camera (Google-Maps style).
      panRef.current = { lastX: e.clientX, lastY: e.clientY };
      setPanning(true);
    }
  }

  function handleMove(e: MouseEvent<HTMLCanvasElement>) {
    if (panRef.current) {
      const dx = e.clientX - panRef.current.lastX;
      const dy = e.clientY - panRef.current.lastY;
      panRef.current = { lastX: e.clientX, lastY: e.clientY };
      camera.current = pan(camera.current, dx, dy);
      bump();
      return;
    }
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
    panRef.current = null;
    setPanning(false);
    setGhost(null);
  }

  // Right-click clears an active measuring line instead of starting a new one.
  function handleContextMenu(e: MouseEvent<HTMLCanvasElement>) {
    if (tool === 'measure') {
      e.preventDefault();
      measuringRef.current = false;
      setMeasure(null);
    }
  }

  const cursor =
    tool === 'measure' || tool === 'fog' ? 'crosshair' : panning ? 'grabbing' : 'grab';

  return (
    <div className={styles.scroll} ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ cursor }}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
}
