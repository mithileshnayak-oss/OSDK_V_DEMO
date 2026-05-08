# Vanyar — Training & Hackathon Platform (OSDK Demo)

A web platform for the Palantir ecosystem combining structured training (modules, tracks, exercises) with a hackathon engine (challenges, submissions, judging, leaderboards). End users never need Foundry accounts — the Express backend proxies all Ontology calls using a single confidential OAuth2 client.

## Architecture

```
┌────────────────────────────┐
│  React Portal — :5173      │   22 screens, 5 roles
│  Vite + React 18           │   JWT in memory
└──────────────┬─────────────┘
               │ REST + JWT
┌──────────────▼─────────────┐
│  Express Backend — :3001   │   ~30 routes
│  Node 18+, JWT auth        │   `--mock` mode for offline dev
└──────────────┬─────────────┘
               │ OAuth2 client_credentials
┌──────────────▼─────────────┐
│  Palantir Foundry          │   Ontology REST v2
│  aavya.palantirfoundry.com │   14 object types, 8 actions
└────────────────────────────┘
```

## Prerequisites

- Node.js 18+
- A Foundry confidential client (`CLIENT_ID` + `CLIENT_SECRET`) with these scopes:
  - `api:use-ontologies-read`, `api:use-ontologies-write`
  - `api:use-mediasets-read`, `api:use-mediasets-write`

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # fill in CLIENT_ID, CLIENT_SECRET, JWT_SECRET
cp users.json.example users.json    # local password store (bcrypt hashes)
```

### 2. Frontend

```bash
cd frontend
npm install
```

## Run

Two terminals:

```bash
# Terminal 1 — backend (real Foundry)
cd backend && node server.js

# Terminal 1' — backend (offline mock data, no Foundry)
cd backend && node server.js --mock

# Terminal 2 — frontend
cd frontend && npm run dev
```

Then open <http://localhost:5173>.

## Auth flows

The portal supports three login paths:

1. **Email + password** — bcrypt hash stored in `backend/users.json`. JWT issued for 7 days, kept in memory only (page refresh logs you out).
2. **Demo role buttons** — bypass credentials and issue a JWT for any of `participant | admin | instructor | judge | org_manager`. Enabled only when `MOCK=true` or `NODE_ENV !== 'production'`. Disable in production by setting `NODE_ENV=production`.
3. **Google SSO** — button is rendered but not yet wired.

## Project layout

```
backend/
  server.js                      # all routes, JWT, mock mode
  foundry.js                     # Foundry OAuth + REST helpers
  mock-data.js                   # sample data for --mock
  scripts/
    find-duplicate-users.js      # one-off VanyarUser dedupe
  users.json                     # local password store (gitignored)

frontend/
  src/
    api/client.js                # single fetch wrapper
    hooks/useApi.js              # generic data-fetching hook
    components/                  # 11 styled primitives
    screens/
      Login.jsx
      participant/               # 9 screens
      admin/                     # 6 screens
      instructor/                # 4 screens
      judge/                     # 3 screens

VANYAR_PLATFORM_GUIDE.md         # detailed architecture & ontology reference
prototype-index.html             # standalone HTML prototype
```

## Roles

| Role | Default landing | Notable permissions |
|---|---|---|
| participant | Dashboard | Enrol in events, complete modules, submit solutions |
| admin | Admin Dashboard | Create events, manage users/orgs, publish results |
| instructor | Tracks | Author tracks, view per-track progress |
| judge | Events | Score submissions in queue |
| org_manager | Org Events | Admin-scoped views (currently aliases admin screens) |

## Foundry actions wired

`create-event` · `publish-event` · `create-challenge` · `create-training-module` · `register-for-event` · `register-for-track` · `submit-solution` · `complete-module` · `score-submission` · `create-vanyar-user` · `delete-vanyar-user`

## Status

This is a working demo of the Vanyar MVP brief. Known gaps include:

- Automated scoring engine for analytical challenges
- Real file/dataset storage (currently synthesizes a placeholder CSV)
- SSO (Google + LinkedIn)
- Team creation flow
- Per-event judge/instructor assignment
- Partner content contribution workflow
- Data export from analytics
- Persistent results-publication state (currently in-memory)
- React Router (page refresh logs you out)

See `VANYAR_PLATFORM_GUIDE.md` for the full feature inventory and post-POC roadmap.

## License

TBD.
