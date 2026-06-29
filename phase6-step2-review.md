# Phase 6 Step 2 — token images (build review)

Commit `017f10e` · branch `claude/eribor-srd-bestiary-port` · typecheck ✓ · 177 tests ✓ · build ✓

## Data fields added

| Field | Location |
|---|---|
| `SavedCreature.imageUrl?` | `users/{uid}/creatures/{id}/imageUrl` |
| `Character.imageUrl?` | `characters/{id}/imageUrl` |
| Bestiary art map | `users/{uid}/creatureArt/{creatureId}` (per-GM global) |
| `Token.imageUrl?` | per-token override (already existed) |

## Upload plumbing

- `prepareTokenImage(scope, file)` in `data/images.ts` — mirrors `prepareMapImage`: validates
  image type, **4 MB cap**, uploads to Storage and returns the download URL; **data-URL
  fallback** when Storage isn't configured.
- Reusable `components/ui/TokenArtUpload.tsx` — round preview of the current image, Upload/
  Replace + Remove buttons, busy/error states. Used by all three surfaces.

## Where each upload control lives

| Surface | Component | Saves to |
|---|---|---|
| Bestiary creature (GM-only) | `MonsterStatCard` → "Token art" | `setCreatureArt(uid, entry.id)` |
| Saved creature | `AddCreatureDrawer` (Saved tab, per row) | `setSavedCreatureImage(uid, id)` |
| Character | `CharacterQuickView` (top avatar) | `setCharacterImage(character.id)` |

Each shows the current image and allows replacing/removing it.

## Resolution order (render time, by id)

`BoardScreen` builds the maps and computes each token's effective image:

```
token.imageUrl ?? artById[token.creatureId] ?? characterArt[token.characterId]
```

- `artById` = per-GM `creatureArt` (read under `game.createdBy`) merged with saved-creature
  images. Saved creatures are now placed with `creatureId = savedId` so their tokens resolve
  by the same id-keyed lookup.
- `characterArt` = `useGameCharacterArt(gameId)` — every player's character image, so other
  players' tokens get art too, not just the viewer's.
- The computed `imageUrl` is injected into `boardTokens` and handed to `BoardCanvas`.
  **`BoardCanvas` draw code is unchanged** — it already clips to a circle and falls back.

Setting art once updates all of that creature/character's existing tokens (resolved live, not
baked at placement).

## Fallback — no broken tokens

Any token whose creature/character has no image resolves to `undefined`, and `BoardCanvas`
keeps the existing colored-circle + first-letter rendering (`BoardCanvas.tsx:239–253`,
untouched). Verified by typecheck, the full 177-test suite, and a production build.

## Note

Bestiary/saved art is stored under the GM's uid (`users/{gmUid}/…`) and read on the board via
`game.createdBy`. If your Firebase rules restrict `users/{uid}` reads to that user, players
won't see GM-set creature art (they fall back to color+letter cleanly); the GM sees it fully.
Character art lives under `characters/{id}` and is unaffected. Loosen that rule if you want
players to see creature art too.
