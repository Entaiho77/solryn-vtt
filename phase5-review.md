# Phase 5 Review — readable side-panel icons

Commit `01630b6` · branch `claude/eribor-srd-bestiary-port` · typecheck ✓ · 177 tests ✓ · build ✓

## Icon inventory + label given

All icon-only controls live in the two edge-strip toolbars. Each now has a caption below it.

**Left strip**
| Glyph | Action | Label |
|---|---|---|
| ⚔ | Open Initiative drawer | **Initiative** |
| ⚄ | Open Dice roller | **Dice** |
| 📜 | Open shared Roll Log | **Log** |
| ✉ | Open Chat | **Chat** |
| ℹ | Open Rules reference | **Rules** |
| ✎ | Open personal Notes (player) | **Notes** |

**Right strip**
| Glyph | Action | Label |
|---|---|---|
| ↔ | Toggle measure-distance mode | **Measure** |
| ☁ | Open Fog of war | **Fog** |
| ✚ | Open Add-creature drawer | **Creature** |
| # | Toggle grid visibility | **Grid** |
| ○/● | Toggle grid+measure line color (white/black) | **Color** *(confirmed with you)* |
| ▦ | Open Maps | **Maps** |
| ◈ | Open Character quick-view (player) | **Character** |

**Left unchanged (already text / conventional):** Roll, Hide/Reveal, Defeat/Revive, Remove
buttons in the monster card; drawer-header and Modal close `×` (paired with a title, has
`aria-label="Close"`). No bare icon left without a label.

## Size / contrast changes (`BoardShell.module.css`)

| Property | Before | After |
|---|---|---|
| Strip width | 48px | **72px** |
| Glyph font-size | 1.2rem | **1.65rem** |
| Icon color (resting) | `--text-muted` #9aa0ab (faint) | **`--text-primary` #e6e7ea** |
| Caption | — | **0.625rem, centered below glyph** |

Tool button switched from a fixed 38×38 box to a vertical icon-over-label stack (64px wide,
auto height). Active state (teal tint/border) and hover are unchanged. Labels wrap if needed
(`overflow-wrap: anywhere`), so even "Initiative"/"Character" fit the strip without overflow.

## Behavior unchanged (presentation only)

- `label` (full text) still drives `title` + `aria-label`; new `short` field only feeds the
  visible caption (falls back to `label`).
- Click handlers, `active`/`aria-pressed` state, divider rendering, GM-vs-player item lists,
  and the 280px slide-out drawers are all untouched — the strips widened, the drawers did not.
- Verified by passing typecheck, the full 177-test suite, and a production build.
