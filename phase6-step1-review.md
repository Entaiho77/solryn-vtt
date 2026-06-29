# Phase 6 Step 1 — token images: findings & recommendation

Branch `claude/eribor-srd-bestiary-port`. Investigation only — no code changed.

## Key finding: rendering already supports images

`BoardCanvas.tsx:239–253` already draws `token.imageUrl` as a **circular-cropped** image
and falls back to the colored circle + first letter when it's absent. No new rendering
logic is needed — we only need to *feed* an `imageUrl` to tokens.

```
const art = getImage(token.imageUrl);
if (art) { clip to circle; drawImage } else { fill color; draw letter }
```

## Three creature/character sources (two editable, in Firebase)

| Source | Storage | Runtime-editable? |
|---|---|---|
| SRD/Eribor bestiary (`system.bestiary`) | static generated TS | No — can't add a field in code |
| "Saved" creatures (`SavedCreature`) | Firebase `users/{uid}/creatures/{id}` | Yes |
| Characters (`Character`) | Firebase `characters/{id}` | Yes |

## Upload plumbing already exists

`data/images.ts` → `prepareMapImage(gameId, file)`: validates image type/size, uploads to
Firebase Storage, returns a download URL (data-URL fallback when Storage is off). I'll mirror
it as `prepareTokenImage(scopeId, file)` with a smaller cap (~4 MB; tokens are small).

## Where each thing is viewed/edited

- **Bestiary creature** — listed in `AddCreatureDrawer` (Bestiary tab); a selected creature
  token opens `MonsterStatCard` (GM-only, already looks up the entry by `creatureId`).
- **Saved creature** — built/listed in `AddCreatureDrawer` (Build / Saved tabs).
- **Character** — `CharacterQuickView` (player right drawer) + full `PlaySheet` modal.

## Recommendation

### Data fields
- `SavedCreature.imageUrl?: string` — stored on the record.
- `Character.imageUrl?: string` — stored at `characters/{id}/imageUrl`.
- Static bestiary creatures can't take a code field → store their art in a **Firebase map
  keyed by `creatureId`** (scope decision below).
- `Token.imageUrl` stays an **optional per-token override**. Effective image resolved at
  render time:
  `token.imageUrl ?? creatureArt[creatureId] ?? savedCreature.imageUrl ?? character.imageUrl`.
  Resolving by id at render time is what makes "set art once → every token of that creature
  updates" work without rewriting already-placed tokens.

### Upload UI placement
- **Bestiary creature** → "Upload token art" control in `MonsterStatCard` (GM; scoped by `creatureId`).
- **Saved creature** → thumbnail + upload row in `AddCreatureDrawer`.
- **Character** → avatar + upload control in `CharacterQuickView`.

### Resolution wiring
`BoardScreen` builds two id→url maps (creature art + character art) and passes each token its
effective `imageUrl` before handing tokens to `BoardCanvas`. No change to `BoardCanvas` draw code.

## Open decision — scope of the bestiary art map

Static bestiary creatures need their default art in Firebase keyed by `creatureId`. Pick one:

- **A. Per-GM global (recommended)** — `users/{uid}/creatureArt/{creatureId}`. Set a goblin's
  art once and it applies across ALL of that GM's games. Mirrors the existing "my creatures"
  store; closest to a true per-creature default.
- **B. Per-game** — `games/{gameId}/creatureArt/{creatureId}`. Simpler scoping, but art must be
  re-set in every new game.

(Saved-creature and character art are unaffected by this choice — they live on their own records.)
