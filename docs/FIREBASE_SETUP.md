# Firebase Setup — Fresh Project (Solryn VTT)

A brand-new Firebase project for the rebuild, with **zero inheritance** from the old/abandoned project. Matthew does the console clicks (Part 1); everything code-side is already wired (Part 2). Follow top to bottom.

---

## Part 1 — Console steps (Matthew)

Console: <https://console.firebase.google.com>. The UI shifts occasionally; the click-paths below are current, with the goal in **bold** so you can find it if a label differs.

### 1. Create the project
**Add project** → name it `solryn-vtt` (or similar) → continue. Google Analytics is optional (you can disable it). This is a *new* project — do **not** reuse the old one.

### 2. Enable Authentication (Email/Password + Google)
Left sidebar → **Build → Authentication → Get started**. Then the **Sign-in method** tab:
- **Email/Password** → enable the first toggle (you can leave "Email link" off) → Save.
- **Google** → enable → pick a support email → Save.

> Authorized domains: `localhost` is allowed by default (enough for local dev). When you deploy to a real domain, add it under **Authentication → Settings → Authorized domains**.

### 3. Enable Realtime Database (NOT Firestore)
Left sidebar → **Build → Realtime Database → Create Database**.
- Pick a location (e.g. `us-central1`).
- Start in **Locked mode** (we ship proper rules — see Part 2 step B).
- Note the database URL shown at the top, e.g. `https://solryn-vtt-default-rtdb.firebaseio.com` or `…firebasedatabase.app`. **You'll need this exact URL** — Realtime DB requires it explicitly.

### 4. Register a Web App → get the config
Project **Overview** (gear icon → **Project settings**) → scroll to **Your apps** → click the **`</>`** (web) icon → register an app (nickname `solryn-web`; Hosting not required). Firebase shows a `firebaseConfig` object. **Copy those values** — that's everything I need.

### 5. Hand me the config
From step 4's `firebaseConfig`, I need these 7 fields:

| firebaseConfig key   | goes into `.env.local` as        |
| -------------------- | -------------------------------- |
| `apiKey`             | `VITE_FIREBASE_API_KEY`          |
| `authDomain`         | `VITE_FIREBASE_AUTH_DOMAIN`      |
| `databaseURL`        | `VITE_FIREBASE_DATABASE_URL`     |
| `projectId`          | `VITE_FIREBASE_PROJECT_ID`       |
| `storageBucket`      | `VITE_FIREBASE_STORAGE_BUCKET`   |
| `messagingSenderId`  | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId`              | `VITE_FIREBASE_APP_ID`           |

> If `databaseURL` is **missing** from the snippet (it sometimes is until the DB is created), grab it from step 3 — it's the one field RTDB can't run without.

(Client Firebase config values are safe to expose in the browser bundle; security comes from the rules, not from hiding these. So `.env.local` is convenience/keep-out-of-repo, not a secret store.)

---

## Part 2 — Code side (already wired; here's how to run it)

### A. Put the config in `.env.local`
```bash
cp .env.example .env.local
# then paste the 7 values from the table above
```
That's it — `src/firebase/config.ts` reads these `VITE_FIREBASE_*` vars; nothing is hardcoded, and the old project is referenced nowhere (verified). With config present, sign-in works; without it, the app still renders and shows a "not configured" notice.

### B. Deploy the security rules
The rules (`database.rules.json`) enforce ownership per §4.12: authenticated-only; users private to self; **game membership gates read**; **GM-only** game settings/maps/initiative-start; **per-token writes** (GM writes any token, players write only their own character token); **characters writable only by their owner** (GM is read-only on player characters); chat by members. (`storage.rules` gates map uploads to authenticated users, image-only, ≤12 MB.)

Easiest path — the Firebase CLI:
```bash
npm install -g firebase-tools     # one-time
firebase login                    # one-time
firebase use <your-project-id>    # e.g. firebase use solryn-vtt
firebase deploy --only database   # pushes database.rules.json
# (optional, if you enable Storage for big maps):  firebase deploy --only storage
```
Or paste `database.rules.json` into **Realtime Database → Rules** in the console and **Publish**.

### C. Seed the Solryn system into the database
The app **bundles** the Solryn data, so it never boots into a system-less void — but per the handoff we also seed `/systems/solryn` for completeness and the future custom-system builder. The seed is generated from the same canonical data the app uses (single source of truth), so it can't drift:
```bash
npm run seed:export   # writes seed/systems.json from the bundled Solryn definition
npm run seed:push     # firebase database:set /systems ./seed/systems.json  (needs `firebase use`)
```
The rules make `/systems` world-readable (to authenticated users) and **write-protected** — only this admin push can change it.

### D. Run it
```bash
npm install
npm run dev           # http://localhost:5173
```

---

## Part 3 — Verify the loop end-to-end (the thing that silently fails on misconfig)

1. **Sign up** with email/password → you land in the lobby. (Also test **Continue with Google**.) If sign-in fails, it's almost always the config — recheck `databaseURL` and that Email/Password + Google are enabled.
2. **Create a game** (Solryn) → it appears in your lobby; open it → you're the **GM** on the board. Open **Maps** (right edge) and upload an image.
3. In a second browser/incognito, **sign up as a different user**, then **join by invite code** (from the GM's game settings) → you're a **player** → the **13-step builder** runs (reading the Solryn data), then your character sheet/board view opens.
4. Confirm real-time: the player's token appears on the GM's board; HP edits and chat sync live.

### Rules sanity (optional, with the emulators)
The emulators need Java (already typical on dev machines):
```bash
firebase emulators:start --only auth,database
# set VITE_USE_FIREBASE_EMULATOR=true in .env.local to point the app at them
```
This exercises the exact `database.rules.json` locally without touching the live project.

---

## Part 4 — Old project
Nothing to migrate — all old-project data is throwaway. The codebase references the old project **nowhere** (no stale config, URLs, or keys; verified by sweep). Leave it dormant or delete it later; it's not part of this build.
