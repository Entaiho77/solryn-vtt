# Overnight progress — initiative redesign · naming step · map pan/zoom

Working the 3-item overnight list in order: build + test + commit each before the next.
Verification note that applies to all three: this cloud env's firewall blocks Firebase, so I
can't drive the live board/builder here — UI is verified by `tsc` build + the Vitest suite +
careful reasoning. **Please eyeball the visuals in the morning.**

## 1. Initiative tracker redesign — ✅ DONE
Full-width bottom bar: **round (left) · centered turn carousel (center) · Next/End (right)**.
- Carousel: all combatants sit in a flex "track"; the track is translated so the **active**
  combatant is centered, with a CSS transition — that's the smooth **slide on Next** (no snap).
  Each combatant **scales + fades by distance** from center; `overflow:hidden` clips the distant
  ones, so big fights naturally show only a handful around the active and small fights center
  cleanly — no separate windowing code needed.
- **Click a non-active combatant (GM)** jumps the turn to them — new `setTurn` op in `combat.ts`
  (guarded; ignores out-of-range / same index). Players still only get "End turn".
- Files: `combat.ts` (+`setTurn`), `InitiativeTracker.tsx` (rewrite), `InitiativeTracker.module.css`
  (rewrite), `combat.test.ts` (+3 tests). Build clean; 150 tests pass.
- Known minor (left as-is): wrapping from the last combatant back to #1 animates a long slide
  across the row — reads as a "new round" rewind; easy to dampen later if disliked.

## 2. Move character naming to its own step — ✅ DONE
A new `'name'` step kind sits right after **Choose Race** (before the info pages), rendered by a
new `NameStep` (just the character-name field + teaching copy). `GearStep` lost its name field;
gating moved accordingly — the name step requires a non-empty name, and gear now needs only
armor + weapon. The builder is one step longer (Solryn: 7 steps non-caster / 8 caster).
- Files: `builderModel.ts` (step kind + plan insert after ancestry + gating), `NameStep.tsx`
  (new), `GearStep.tsx` (name field removed), `CharacterBuilder.tsx` (render), `builderModel.test.ts`
  (step counts + new name-gating test). Build clean, 151 tests pass.

## 3. Map pan/zoom — ✅ DONE
The board is now a Google-Maps-style camera over a fixed-dimension map (the map's real width/
height and grid size are unchanged — it's purely a viewport).
- `BoardCanvas` rewritten: the canvas buffer is sized to the **viewport** (ResizeObserver), and
  `draw()` renders through a camera transform `setTransform(zoom,0,0,zoom,x,y)`. So map, grid,
  and tokens all **scale together** and stay anchored to their map coords. Line widths divide by
  zoom to stay ~1px on screen; the measure label is drawn in screen space (constant size).
- **Wheel** zooms toward the cursor (non-passive listener so page scroll is prevented).
  **Click-drag on empty space** pans. Dragging a token, fog-paint, and measure still work —
  hit-testing converts screen→world via the inverse camera. Zoom clamped 0.25×–4×.
- Camera math extracted to a pure `boardCamera.ts` (worldToScreen / screenToWorld / zoomAt /
  pan), unit-tested (inverse, zoom-to-cursor fixed point, clamp, pan).
- Files: `BoardCanvas.tsx` (rewrite), `BoardCanvas.module.css` (viewport, overflow hidden),
  `boardCamera.ts` + `boardCamera.test.ts` (new). Build clean, 155 tests pass.
- NOT verifiable here (needs the live board): the actual feel of pan/zoom. Two deliberate
  follow-ups left for your call, neither blocking: (a) no devicePixelRatio scaling yet — buffer
  is CSS-px, so it may look slightly soft on retina; adding dpr makes it crisp; (b) redraw runs
  per mousemove during a pan — fine in practice, could coalesce with requestAnimationFrame if it
  ever feels heavy.

## Summary
All three items implemented, each built clean + committed/pushed on its own
(`2ce839b`, `4e7fbea`, and the pan/zoom commit). 155 tests pass; nothing left blocked or
skipped. Everything visual/interactive needs an eyeball on the running board/builder in the
morning — this environment can't reach Firebase, so UI is verified by build + tests + reasoning.
