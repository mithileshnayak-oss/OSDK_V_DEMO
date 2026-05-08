# Vanyar Training & Hackathon Platform
## Complete Build Guide — Architecture, Status & Implementation Plan

> **Foundry Stack:** `aavya.palantirfoundry.com` | **Ontology RID:** `ri.ontology.main.ontology.2b524aaa-b15b-49c6-9b69-353f71badbaf` | **Branch:** `km/vanyar-ontology-setup`

---

## Table of Contents

1. [What Is Vanyar](#1-what-is-vanyar)
2. [Architecture — The Full Picture](#2-architecture--the-full-picture)
3. [Why No Workshop, No Foundry Accounts for Users](#3-why-no-workshop-no-foundry-accounts-for-users)
4. [Complete Build Status](#4-complete-build-status)
5. [Foundry Data Layer — All RIDs](#5-foundry-data-layer--all-rids)
6. [Key User Flows](#6-key-user-flows)
7. [Step-by-Step Implementation Plan](#7-step-by-step-implementation-plan)
8. [File Structure](#8-file-structure)
9. [Environment Configuration](#9-environment-configuration)
10. [API Reference](#10-api-reference)
11. [Known Limitations & Future Work](#11-known-limitations--future-work)
12. [Post-POC Roadmap](#12-post-poc-roadmap)

---

## 1. What Is Vanyar

Vanyar is a **training and hackathon platform for the Palantir ecosystem**. It serves three audiences:

| Audience | Use Case |
|---|---|
| **Enterprise** | Train internal teams on Foundry, Ontology, AIP, OSDK |
| **Service Partners** | Certify consultant readiness for Foundry delivery |
| **Universities** | Run student hackathons with real Foundry challenges |

### Four User Roles

| Role | Responsibilities |
|---|---|
| **Learner / Participant** | Registers for tracks, enrols in events, submits solutions, tracks progress |
| **Org Admin** | Manages organisation, creates events and challenges, oversees teams |
| **Judge / Evaluator** | Reviews submissions, provides scores and feedback |
| **Team Captain** | Manages team membership, coordinates event participation |

### Two Platform Pillars

**Training Platform** — Structured learning paths with modules, exercises, and progress tracking.

**Hackathon Engine** — Competitive events with challenge submissions, judge scoring, and live leaderboards.

---

## 2. Architecture — The Full Picture

### The Core Principle: Participants Never Need Foundry Accounts

All external users (participants, judges, admins) interact exclusively with the **React Portal**. The **Express Backend** handles all Foundry communication using a single confidential client credential. Foundry is invisible to end users.

```
┌─────────────────────────────────────────────────────┐
│  ALL USERS  (zero Foundry accounts required)        │
│                                                     │
│  Participant · Admin · Instructor · Judge           │
│  Sign up / log in with email or Google              │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS + JWT (portal's own auth)
                       ▼
┌─────────────────────────────────────────────────────┐
│  REACT PORTAL  — localhost:5173                     │
│                                                     │
│  22 screens across 4 roles                         │
│  Login · Register (portal-native auth)             │
│  Stores JWT in memory                               │
│  Sends JWT on every API call                        │
└──────────────────────┬──────────────────────────────┘
                       │ REST API + JWT
                       ▼
┌─────────────────────────────────────────────────────┐
│  EXPRESS BACKEND  — localhost:3001                  │
│                                                     │
│  Verifies JWT (portal's own auth system)           │
│  Extracts userId from token                         │
│  Calls Foundry using CLIENT_CREDENTIALS            │
│  Passes userId as action parameter                  │
│  Mock mode: node server.js --mock                  │
└──────────────────────┬──────────────────────────────┘
                       │ OAuth2 client_credentials
                       │ (one server-level credential)
                       ▼
┌─────────────────────────────────────────────────────┐
│  PALANTIR FOUNDRY — aavya.palantirfoundry.com       │
│                                                     │
│  14 Object Types   22 Link Types   8 Action Types  │
│  13 Raw Datasets   13 Clean Pipelines               │
│  13 Clean Datasets                                  │
│  LeaderboardEntry (pipeline-computed, read-only)   │
└─────────────────────────────────────────────────────┘
```

### OAuth2 Client Types Explained

| Type | What You Have | Used For |
|---|---|---|
| **Backend Service (Confidential Client)** | ✅ Registered in Developer Console | Server→Foundry communication. Uses `client_credentials` grant. Server authenticates as itself. |
| **Client-Facing App (Public Client)** | Not needed | Would be used if participants had Foundry accounts. They don't — so skip this. |

**One Backend Service client is all you need.** The portal's authentication is completely independent of Foundry.

### How userId Works Without Foundry User Accounts

```
Participant registers on portal
        │
        ▼
Backend generates UUID → userId = "usr_a1b2c3d4"
        │
        ├── Stores in portal's own user table (or JWT)
        │
        └── Calls Foundry action: createVanyarUser(userId, email, name, orgId)
                │
                └── Creates VanyarUser object in Foundry Ontology
                    userId is just a String property — not a Foundry identity
```

Actions like `submitSolution`, `registerForEvent`, `completeModule` all accept `userId` as a plain string parameter. Foundry stores it on the object. No Foundry account required.

---

## 3. Why No Workshop, No Foundry Accounts for Users

### Workshop Is Optional — Not Required

Workshop was originally planned for internal Foundry-licensed users (Admin, Instructor, Judge). Since the React portal now covers all 22 screens across all 4 roles, **Workshop adds no value for the POC**.

| Approach | Pros | Cons |
|---|---|---|
| **Workshop (original plan)** | Fast to build with no-code widgets | Only works for Foundry-licensed users; adds complexity |
| **React Portal (current build)** | Works for everyone; full control over UX; OSDK-ready | Already built ✅ |

**Decision: Skip Workshop for POC. The React portal replaces it entirely.**

The only Foundry-native components still needed are:
- **Pipeline Builder** — for leaderboard computation (no UI alternative)
- **Contour** — optional, for advanced admin analytics later

---

## 4. Complete Build Status

### ✅ DONE

| Layer | Component | Details |
|---|---|---|
| **Foundry** | 14 Object Types | All with RIDs, backed by clean datasets |
| **Foundry** | 22 Link Types | All many-to-one object-backed links |
| **Foundry** | 8 Action Types | All with RIDs and validation rules |
| **Foundry** | 13 Raw Datasets | Synthetic seed data for all entities |
| **Foundry** | 13 Pipeline Builder Transforms | Cleaning transforms for all raw datasets |
| **Foundry** | 13 Clean Datasets | Output of cleaning pipelines, backing object types |
| **Backend** | Express Server | 12 REST endpoints, mock mode, CORS, token caching |
| **Backend** | Foundry API Client | OAuth2 `client_credentials`, auto token refresh |
| **Backend** | Mock Data | Full sample data matching ontology schema |
| **Portal** | 22 Screens | All roles: Participant (9), Admin (5), Instructor (4), Judge (3), Login |
| **Portal** | API Client | Fetch-based, OSDK-annotated, ready for swap |
| **Portal** | Design System | gwaithlabs: copper/amber/violet, DM Mono, Bebas Neue, noise grain |
| **Marketing** | Landing Page | 20-section marketing site at index.html |

### ❌ PENDING

| Priority | Component | Effort | Unblocks |
|---|---|---|---|
| 🔴 **CRITICAL** | Complete Developer Console registration → get CLIENT_ID + SECRET | 10 min | Everything |
| 🔴 **CRITICAL** | Add `callAction()` to foundry.js | 1 hour | All write operations |
| 🔴 **CRITICAL** | Add JWT auth to Express backend | 2 hours | User identity in actions |
| 🔴 **CRITICAL** | Leaderboard computation pipeline | 3–4 hours | Live rankings |
| 🟡 **IMPORTANT** | Update portal Login with real register/login form | 2 hours | Real user flow |
| 🟡 **IMPORTANT** | Wire action endpoints on backend | 3 hours | Submit, enrol, complete |
| 🟡 **IMPORTANT** | Function-backed action validations | 2–3 hours | Data integrity |
| 🟡 **IMPORTANT** | Analytics pipelines (training + event) | 2 hours | Admin dashboards |
| 🔵 **NICE TO HAVE** | Notification side-effects on actions | 2 hours | Email alerts |
| 🔵 **NICE TO HAVE** | Audit & Compliance (Checkpoint) | 2 hours | Compliance trail |
| 🔵 **NICE TO HAVE** | Pipeline refresh schedules | 1 hour | Auto-refresh data |

---

## 5. Foundry Data Layer — All RIDs

### Project Structure

```
Project Root:         ri.compass.main.folder.fe4cc509-ed28-4761-ad92-b1c1ba7ebbd2
Data:                 ri.compass.main.folder.baca1ef6-2a16-48c4-b39e-23a27068919c
  Raw Data:           ri.compass.main.folder.01c36e1c-896d-47ab-9ab3-8deceb31b0d4
  Clean Data:         ri.compass.main.folder.b348e60e-68b9-4479-9c0b-51f6f169fb1e
  OT Backed Data:     ri.compass.main.folder.1a4d9a36-5384-41a9-a927-bb2cbc5039eb
Ontology:             ri.compass.main.folder.089fdd9b-1a1f-44b2-ab96-2dc7fbfa148f
  Object Types:       ri.compass.main.folder.a0808007-b01a-4281-8253-bbbfadf65f01
  Action Types:       ri.compass.main.folder.fb54a357-0a9c-4c84-9bf9-7db145069761
  Link Types:         ri.compass.main.folder.df367f3e-49f2-4586-b87f-d748eb7397
Applications:         ri.compass.main.folder.ce1acf17-fa42-4a01-b897-c564846f0e5c
```

### Object Types (14)

| # | Object Type | RID | Primary Key | Edits |
|---|---|---|---|---|
| 1 | VanyarUser | `ri.ontology.main.object-type.36b52945-5370-42d7-91c1-b5605dd2b3c3` | userId | ✅ |
| 2 | Organisation | `ri.ontology.main.object-type.6a60d842-0ee9-4483-8949-37dafe690a6e` | orgId | ✅ |
| 3 | Event | `ri.ontology.main.object-type.33779fb7-56d5-481f-8564-5ec4489fcd1d` | eventId | ✅ |
| 4 | Challenge | `ri.ontology.main.object-type.077624bb-b33d-4659-ac02-60d0ae37d8dd` | challengeId | ✅ |
| 5 | Submission | `ri.ontology.main.object-type.f774d4c6-bc6b-4e33-b2cd-6dd82a64e46b` | submissionId | ✅ |
| 6 | Score | `ri.ontology.main.object-type.3bc90c59-f169-4771-a341-95d5c58d1012` | scoreId | ✅ |
| 7 | Track | `ri.ontology.main.object-type.14d8de86-6a37-4042-8c42-52b7af3251f0` | trackId | ✅ |
| 8 | TrainingModule | `ri.ontology.main.object-type.acad919f-6898-471e-a423-80a6c80dcecd` | moduleId | ✅ |
| 9 | Exercise | `ri.ontology.main.object-type.dc65632c-e4d9-4777-aaa7-06c53af13cb6` | exerciseId | ✅ |
| 10 | Enrolment | `ri.ontology.main.object-type.d5dfcf02-e169-489f-aa55-53bef36d2fe1` | enrolmentId | ✅ |
| 11 | Progress | `ri.ontology.main.object-type.9af9b487-4ab8-4be3-9d48-cadeaed9acaf` | progressId | ✅ |
| 12 | Team | `ri.ontology.main.object-type.be862025-728d-4528-8ab6-27ebd24efd55` | teamId | ✅ |
| 13 | LeaderboardEntry | `ri.ontology.main.object-type.eb78da41-d5cd-45d0-aee3-cd7730e2eece` | entryId | ❌ read-only |
| 14 | JudgeAssignment | `ri.ontology.main.object-type.0b56694a-a55e-4e90-a917-61ef06ad0f91` | assignmentId | ✅ edit-only |

### Action Types (8)

| # | Action | RID | Key Parameters | Validation |
|---|---|---|---|---|
| 1 | Create Event | `ri.actions.main.action-type.7898e2d6-d82b-466a-913e-2df91f2cca04` | name, eventType, startDate, endDate, orgId | — |
| 2 | Publish Event | `ri.actions.main.action-type.c7b73bf9-6439-400d-aa81-37aa99d141ab` | event (object) | Must be DRAFT |
| 3 | Create Challenge | `ri.actions.main.action-type.414cceb4-d9f9-47c9-ba50-8e64c2fca3f9` | event, title, challengeType, maxScore | Event must be DRAFT |
| 4 | Create Training Module | `ri.actions.main.action-type.6bc42be6-0e38-4826-8b37-4e7146d4755e` | track, title, contentType, contentRef | — |
| 5 | Register for Event | `ri.actions.main.action-type.eab9bbb7-ae3d-4e17-a129-ad1463deea78` | user, event | Event NOT in DRAFT |
| 6 | Submit Solution | `ri.actions.main.action-type.4d58346e-1f17-4b60-9dbb-de15dd68f062` | user, challenge/exercise, fileRef, fileName | One of challenge/exercise |
| 7 | Complete Module | `ri.actions.main.action-type.c62e4857-c83a-4641-b71e-f9c29fdc6a37` | user, module | — |
| 8 | Score Submission | `ri.actions.main.action-type.9f632571-2294-40a9-8737-4b94f8f27049` | submission, judge, scoreValue, feedback | 0–100, must be SUBMITTED |

### Link Types (22)

| Link | Relation | RID |
|---|---|---|
| user-to-org | VanyarUser → Organisation | `ri.ontology.main.relation.26c51a49-de9c-49db-832b-77d42c8cba38` |
| user-to-team | VanyarUser → Team | `ri.ontology.main.relation.6e9c5a06-8def-4e38-ab90-e0bef30d02dc` |
| event-to-org | Event → Organisation | `ri.ontology.main.relation.9e712ce8-bc6c-43db-93ee-4178212b84` |
| challenge-to-event | Challenge → Event | `ri.ontology.main.relation.14b2145d-a8cd-42e4-8538-f659fbac2cf9` |
| submission-to-user | Submission → VanyarUser | `ri.ontology.main.relation.74c554ea-8c03-4625-97c2-2d0c62f369c6` |
| submission-to-challenge | Submission → Challenge | `ri.ontology.main.relation.f64650aa-59e8-410a-98d0-602348a5b3e0` |
| submission-to-exercise | Submission → Exercise | `ri.ontology.main.relation.2f86d312-fa12-4c50-b557-210503f92f3c` |
| submission-to-team | Submission → Team | `ri.ontology.main.relation.72cfdb21-fe9e-4456-9a40-3e08db637cda` |
| score-to-submission | Score → Submission | `ri.ontology.main.relation.254bdd5b-5c3f-40c8-95d3-d7dc8d288d62` |
| score-to-judge | Score → VanyarUser | `ri.ontology.main.relation.11819b24-f318-4898-a134-892c6b84a627` |
| track-to-instructor | Track → VanyarUser | `ri.ontology.main.relation.1b1befa3-80a9-4f96-b925-dfa4cf67e0f3` |
| module-to-track | TrainingModule → Track | `ri.ontology.main.relation.9c746326-b364-4813-9f27-364dd3d31892` |
| exercise-to-module | Exercise → TrainingModule | `ri.ontology.main.relation.799d37f1-0d84-489b-a64f-0d159b28a6a2` |
| enrolment-to-user | Enrolment → VanyarUser | `ri.ontology.main.relation.b4f355b6-889e-4f59-8894-b05d6be19423` |
| enrolment-to-event | Enrolment → Event | `ri.ontology.main.relation.36850b10-b295-4ef0-b8bf-2ea5c29b17ab` |
| progress-to-user | Progress → VanyarUser | `ri.ontology.main.relation.b06d67ae-72fc-4ed1-9b1b-324903e1f7bf` |
| progress-to-module | Progress → TrainingModule | `ri.ontology.main.relation.0c3d3486-767d-4daf-b982-48e07ce6c2c0` |
| team-to-event | Team → Event | `ri.ontology.main.relation.fdf27682-94cb-4e72-a89e-3c98e2369387` |
| team-to-captain | Team → VanyarUser | `ri.ontology.main.relation.52fd1671-faf8-4fa3-8517-991a19e76925` |
| leaderboard-to-event | LeaderboardEntry → Event | `ri.ontology.main.relation.f2390483-716e-476b-804c-eb397ef9e28a` |
| leaderboard-to-user | LeaderboardEntry → VanyarUser | `ri.ontology.main.relation.aa7a11a7-b15c-4b80-b69a-44ea997d7000` |
| leaderboard-to-team | LeaderboardEntry → Team | `ri.ontology.main.relation.9991b0e5-43b3-4f5d-bf3f-978c1a60cc57` |

### Raw Datasets (13)

| Dataset | RID | Note |
|---|---|---|
| users_vanyaruser | `ri.foundry.main.dataset.ed97d71e-658a-47db-a9ca-64262ba36e2d` | |
| organisations | `ri.foundry.main.dataset.c7e8e675-4d04-4109-84e1-1ac4e41c1cab` | |
| events | `ri.foundry.main.dataset.d15a7192-b7a3-496a-a95a-7d424fa74e41` | |
| challenges | `ri.foundry.main.dataset.1689a2ee-4877-44ad-aba0-df51c4766b52` | |
| submissions | `ri.foundry.main.dataset.4095a890-2b11-458b-978e-4253792679b5` | ⚠️ Broken headers — fixed in pipeline |
| scores | `ri.foundry.main.dataset.ae6bcd54-3d7c-479c-8a83-cba419794045` | |
| tracks | `ri.foundry.main.dataset.1afb4cbb-10e7-4a13-b976-3f4f490ccac1` | |
| training_modules | `ri.foundry.main.dataset.fae2a410-8fbc-4845-99f9-ab018150492e` | |
| exercises | `ri.foundry.main.dataset.d4623753-8580-4fc9-849c-16376d9adc45` | |
| enrolments | `ri.foundry.main.dataset.3487239a-0b6d-43af-9391-499fa26b4c72` | |
| training_progress | `ri.foundry.main.dataset.c494dea2-acb0-40dd-bf32-09a5c84179e8` | ⚠️ Broken headers — fixed in pipeline |
| teams | `ri.foundry.main.dataset.ef6cf276-d6a3-49ca-8384-ef85462429a3` | |
| leaderboard_entries | `ri.foundry.main.dataset.66399c6f-3a17-448a-ad1f-28e3f135e3b9` | |

---

## 6. Key User Flows

### Flow 1 — Participant Registration & Onboarding

```
1. Participant visits portal (localhost:5173)
2. Clicks "Sign Up" → fills email + name + password
3. Portal POST /api/auth/register
4. Backend generates UUID userId
5. Backend calls Foundry action (future: when actions are wired):
   createVanyarUser(userId, email, name, orgId)
6. Backend returns JWT { userId, role: 'PARTICIPANT', name }
7. Portal stores JWT in memory
8. Portal navigates to Dashboard
9. Dashboard loads: GET /api/stats, /api/events, /api/tracks
10. Backend fetches from Foundry using client_credentials token
11. Real data renders on screen
```

### Flow 2 — Hackathon Event Lifecycle

```
ADMIN:
1. Logs into portal (Admin role)
2. Goes to Admin → Events → Create Event
3. Fills: name, type=HACKATHON, dates, org
4. Portal POST /api/admin/events/create
5. Backend calls Foundry action: createEvent(...)
6. Event created in Foundry with status=DRAFT

7. Admin clicks Add Challenge → fills title, type=NON_ANALYTICAL
8. Backend calls: createChallenge(eventId, title, type, maxScore)

9. Admin clicks Publish Event
10. Backend calls: publishEvent(eventId)
11. Event status → PUBLISHED, now visible to participants

PARTICIPANT:
12. Browses Events Catalogue → sees published event
13. Clicks Register
14. Backend calls: registerForEvent(userId, eventId)
15. Enrolment object created in Foundry

16. Participant views Event Detail → sees challenges
17. Uploads solution file → Portal calls POST /api/submissions
18. Backend calls: submitSolution(userId, challengeId, fileRef, fileName)
19. Submission object created, status=SUBMITTED

JUDGE:
20. Logs in as Judge → sees Review Queue
21. Opens submission, reviews file
22. Enters score (0–100) + feedback → clicks Submit Score
23. Backend calls: scoreSubmission(submissionId, judgeUserId, value, feedback)
24. Score object created, Submission status → EVALUATED

PIPELINE:
25. Leaderboard pipeline runs (every 15 min)
26. Reads all Score objects for event
27. Aggregates: totalScore, rank, submissionCount per user
28. Writes LeaderboardEntry objects

PARTICIPANT:
29. Views Leaderboard → sees live rankings
```

### Flow 3 — Training Track Consumption

```
INSTRUCTOR:
1. Logs in as Instructor → My Tracks
2. Creates track: name, difficulty, estimatedHours
3. Adds modules: title, contentType=PDF, contentRef
4. Adds exercise per module: title, type=UPLOAD, maxScore

PARTICIPANT:
5. Browses Training Catalogue → sees tracks with difficulty badges
6. Opens a track → Module Viewer
7. Left panel: ordered module list with completion indicators
8. Right panel: content area (PDF/video/text)
9. Completes exercise → uploads file
10. Backend calls: submitSolution(userId, exerciseId, fileRef, fileName)
11. Clicks Mark as Complete
12. Backend calls: completeModule(userId, moduleId)
13. Progress object created/updated: status=COMPLETED

14. Dashboard progress bar updates
15. Track completion % increases
```

### Flow 4 — Scoring & Leaderboard Update

```
Judge scores submission
        │
        ▼
scoreSubmission action fires
        │
        ├── Creates Score object (value, feedback, scoredAt)
        └── Updates Submission status → EVALUATED
                │
                ▼
        [15 min later OR triggered]
        Leaderboard Pipeline runs
                │
                ├── Reads all Scores for event
                ├── Groups by userId/teamId
                ├── Computes totalScore, rank, submissionCount
                └── Writes LeaderboardEntry objects
                        │
                        ▼
                Participant sees updated rank
                in portal Leaderboard screen
```

---

## 7. Step-by-Step Implementation Plan

---

### STEP 1 — Complete Developer Console Registration
**Time: 10 minutes | Priority: 🔴 CRITICAL**

You are currently on the Application Type screen with "Backend Service" selected.

1. Click **Continue**
2. On Permissions screen — add scopes:
   - Object Types: VanyarUser, Organisation, Event, Challenge, Submission, Score, Track, TrainingModule, Exercise, Enrolment, Progress, Team, LeaderboardEntry (read/write)
   - Action Types: all 8 actions (execute)
3. Click **Create**
4. Copy the generated `CLIENT_ID` and `CLIENT_SECRET`
5. Add to `backend/.env`:

```env
FOUNDRY_URL=https://aavya.palantirfoundry.com
CLIENT_ID=<paste here>
CLIENT_SECRET=<paste here>
ONTOLOGY_RID=ri.ontology.main.ontology.2b524aaa-b15b-49c6-9b69-353f71badbaf
PORT=3001
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
JWT_SECRET=<generate a long random string>
```

6. Test: `cd backend && node server.js` (without `--mock`) → visit `http://localhost:3001/api/health`

---

### STEP 2 — Add callAction() to foundry.js
**Time: 1 hour | Priority: 🔴 CRITICAL**

Add this function to `backend/foundry.js`:

```js
/**
 * POST /api/v2/ontologies/{rid}/actions/{actionType}/apply
 */
export async function callAction(actionRid, parameters) {
  const resp = await fetch(
    `${FOUNDRY_URL}/api/v2/ontologies/${ONTOLOGY_RID}/actions/${actionRid}/apply`,
    {
      method: 'POST',
      headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
      body: JSON.stringify({ parameters }),
    }
  );
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`callAction(${actionRid}) → ${resp.status}: ${text}`);
  }
  return resp.json();
}
```

Then define an action map in `server.js`:

```js
const ACTIONS = {
  createEvent:          'ri.actions.main.action-type.7898e2d6-d82b-466a-913e-2df91f2cca04',
  publishEvent:         'ri.actions.main.action-type.c7b73bf9-6439-400d-aa81-37aa99d141ab',
  createChallenge:      'ri.actions.main.action-type.414cceb4-d9f9-47c9-ba50-8e64c2fca3f9',
  createTrainingModule: 'ri.actions.main.action-type.6bc42be6-0e38-4826-8b37-4e7146d4755e',
  registerForEvent:     'ri.actions.main.action-type.eab9bbb7-ae3d-4e17-a129-ad1463deea78',
  submitSolution:       'ri.actions.main.action-type.4d58346e-1f17-4b60-9dbb-de15dd68f062',
  completeModule:       'ri.actions.main.action-type.c62e4857-c83a-4641-b71e-f9c29fdc6a37',
  scoreSubmission:      'ri.actions.main.action-type.9f632571-2294-40a9-8737-4b94f8f27049',
};
```

---

### STEP 3 — Add JWT Auth to Backend
**Time: 2 hours | Priority: 🔴 CRITICAL**

```bash
cd backend && npm install jsonwebtoken bcryptjs
```

Add to `server.js`:

```js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;

// In-memory user store for POC (replace with DB in production)
const userStore = new Map(); // userId → { email, passwordHash, name, role, orgId }

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, error: 'Unauthenticated' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { email, name, password, orgId } = req.body;
  if (!email || !name || !password) 
    return fail(res, new Error('email, name, password required'), 400);

  const userId = crypto.randomUUID();
  userStore.set(email, { userId, email, name, role: 'PARTICIPANT', orgId: orgId || null });
  
  // Wire to Foundry when actions are ready:
  // await callAction(ACTIONS.createVanyarUser, { userId, email, name, orgId });

  const token = jwt.sign({ userId, email, name, role: 'PARTICIPANT' }, JWT_SECRET, { expiresIn: '7d' });
  ok(res, { token, userId, name, role: 'PARTICIPANT' });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = userStore.get(email);
  if (!user) return fail(res, new Error('User not found'), 404);
  const token = jwt.sign({ userId: user.userId, email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  ok(res, { token, userId: user.userId, name: user.name, role: user.role });
});
```

---

### STEP 4 — Wire Action Endpoints on Backend
**Time: 3 hours | Priority: 🟡 IMPORTANT**

Add these routes to `server.js` — all protected by `requireAuth`:

```js
// POST /api/events/:id/enrol
app.post('/api/events/:id/enrol', requireAuth, async (req, res) => {
  if (MOCK_MODE) return ok(res, { enrolled: true });
  try {
    await callAction(ACTIONS.registerForEvent, {
      user: { primaryKey: req.user.userId, objectType: 'VanyarUser' },
      event: { primaryKey: req.params.id, objectType: 'Event' },
    });
    ok(res, { enrolled: true });
  } catch (e) { fail(res, e); }
});

// POST /api/submissions
app.post('/api/submissions', requireAuth, async (req, res) => {
  if (MOCK_MODE) return ok(res, { submitted: true, submissionId: 'mock-sub-001' });
  try {
    const { challengeId, exerciseId, fileRef, fileName } = req.body;
    await callAction(ACTIONS.submitSolution, {
      user: { primaryKey: req.user.userId, objectType: 'VanyarUser' },
      ...(challengeId && { challenge: { primaryKey: challengeId, objectType: 'Challenge' } }),
      ...(exerciseId && { exercise: { primaryKey: exerciseId, objectType: 'Exercise' } }),
      fileRef, fileName,
    });
    ok(res, { submitted: true });
  } catch (e) { fail(res, e); }
});

// POST /api/modules/:id/complete
app.post('/api/modules/:id/complete', requireAuth, async (req, res) => {
  if (MOCK_MODE) return ok(res, { completed: true });
  try {
    await callAction(ACTIONS.completeModule, {
      user: { primaryKey: req.user.userId, objectType: 'VanyarUser' },
      module: { primaryKey: req.params.id, objectType: 'TrainingModule' },
    });
    ok(res, { completed: true });
  } catch (e) { fail(res, e); }
});

// POST /api/scores (judge only)
app.post('/api/scores', requireAuth, async (req, res) => {
  if (MOCK_MODE) return ok(res, { scored: true });
  try {
    const { submissionId, scoreValue, feedback } = req.body;
    await callAction(ACTIONS.scoreSubmission, {
      submission: { primaryKey: submissionId, objectType: 'Submission' },
      judge: { primaryKey: req.user.userId, objectType: 'VanyarUser' },
      scoreValue,
      feedback: feedback || '',
    });
    ok(res, { scored: true });
  } catch (e) { fail(res, e); }
});

// POST /api/admin/events (admin only)
app.post('/api/admin/events', requireAuth, async (req, res) => {
  if (MOCK_MODE) return ok(res, { created: true, eventId: 'mock-evt-new' });
  try {
    const { name, eventType, startDate, endDate, orgId, description, maxParticipants } = req.body;
    await callAction(ACTIONS.createEvent, { name, eventType, startDate, endDate, orgId, description, maxParticipants });
    ok(res, { created: true });
  } catch (e) { fail(res, e); }
});

// POST /api/admin/events/:id/publish (admin only)
app.post('/api/admin/events/:id/publish', requireAuth, async (req, res) => {
  if (MOCK_MODE) return ok(res, { published: true });
  try {
    await callAction(ACTIONS.publishEvent, {
      event: { primaryKey: req.params.id, objectType: 'Event' },
    });
    ok(res, { published: true });
  } catch (e) { fail(res, e); }
});
```

---

### STEP 5 — Update Portal Login with Real Auth
**Time: 2 hours | Priority: 🟡 IMPORTANT**

Update `portal/src/screens/Login.jsx` to call real auth endpoints:

```jsx
// Register flow
const handleRegister = async () => {
  const data = await api.register({ email, name, password });
  setToken(data.token);          // stores in api/client.js
  setUser({ userId: data.userId, name: data.name, role: data.role });
  onLogin(data.role);            // navigate to correct dashboard
};

// Login flow  
const handleLogin = async () => {
  const data = await api.login({ email, password });
  setToken(data.token);
  setUser({ userId: data.userId, name: data.name, role: data.role });
  onLogin(data.role);
};
```

Add to `portal/src/api/client.js`:

```js
export const api = {
  // ... existing methods ...
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  enrol:    (eventId) => apiFetch(`/events/${eventId}/enrol`, { method: 'POST', body: '{}' }),
  submit:   (body) => apiFetch('/submissions', { method: 'POST', body: JSON.stringify(body) }),
  complete: (moduleId) => apiFetch(`/modules/${moduleId}/complete`, { method: 'POST', body: '{}' }),
  score:    (body) => apiFetch('/scores', { method: 'POST', body: JSON.stringify(body) }),
};
```

---

### STEP 6 — Build Leaderboard Pipeline in Foundry
**Time: 3–4 hours | Priority: 🔴 CRITICAL**

In Foundry → Pipeline Builder → New Pipeline → `compute_leaderboard`:

```
Inputs:
  clean_scores     (ri.foundry.main.dataset.4e392?9-7a49-49bf-88fc-ca89a6bdce1e)
  clean_submissions (ri.foundry.main.dataset.39a93e3f-11ad-4f60-881e-3b9be44cc127)

Transform (Python / PySpark):
  1. JOIN scores ON submissionId → get eventId, userId, teamId, submittedAt
  2. GROUP BY eventId, userId
  3. AGGREGATE:
       totalScore      = SUM(value)
       submissionCount = COUNT(submissionId)
       lastSubmittedAt = MAX(submittedAt)
  4. RANK by totalScore DESC, tie-break by lastSubmittedAt ASC
  5. Generate entryId = UUID

Output:
  clean_leaderboard_entries (ri.foundry.main.dataset.75de1230-4fa2-4763-81d6-a3ae1ddf39d6)

Schedule: Every 15 minutes
Trigger:  Also trigger when scoreSubmission action fires
```

---

### STEP 7 — Add Validation Functions in Foundry (Optional for POC)
**Time: 2–3 hours | Priority: 🟡 IMPORTANT**

Three actions currently lack complex validation. Add TypeScript functions in Foundry → Logic:

**Function 1: checkEnrolmentCapacity**
```typescript
// Called before registerForEvent
// Returns error if event is full
function checkEnrolmentCapacity(eventId: string): boolean {
  const event = objects.Event.get(eventId);
  const enrolCount = objects.Enrolment.where(e => e.eventId.eq(eventId)).count();
  return event.maxParticipants == null || enrolCount < event.maxParticipants;
}
```

**Function 2: checkDuplicateEnrolment**
```typescript
// Called before registerForEvent
function checkDuplicateEnrolment(userId: string, eventId: string): boolean {
  return objects.Enrolment
    .where(e => e.userId.eq(userId).and(e.eventId.eq(eventId)))
    .count() === 0;
}
```

Attach these as validation rules on the `Register for Event` action type in Ontology Manager.

---

### STEP 8 — Configure Pipeline Schedules
**Time: 1 hour | Priority: 🟡 IMPORTANT**

In Foundry → each Pipeline Builder pipeline → Schedule:

| Pipeline | Schedule |
|---|---|
| compute_leaderboard | Every 15 minutes |
| Training Analytics | Every 30 minutes |
| Event Analytics | Every 30 minutes |
| Progress Rollup | Trigger on completeModule action |

---

### STEP 9 — Notification Side-Effects (Optional)
**Time: 2 hours | Priority: 🔵 NICE TO HAVE**

Options:
- **Foundry Notifications** — native, configure in Ontology Manager on action side-effects
- **Webhook in Code Repository** — Python script that POSTs to email service (SendGrid, etc.)

Events to notify:
- `registerForEvent` → "You've enrolled in {eventName}"
- `scoreSubmission` → "Your submission was scored: {value}/100 — {feedback}"
- `publishEvent` → "New event published: {eventName}"
- `completeModule` → "Module completed! Progress: {pct}%"

---

## 8. File Structure

```
C:\Users\mithi\Desktop\Vanyar_website\
│
├── index.html                          ← Marketing landing page (20 sections)
│
├── backend/
│   ├── server.js                       ← Express API (12 endpoints + auth)
│   ├── foundry.js                      ← Foundry REST client + callAction()
│   ├── mock-data.js                    ← Sample data for --mock mode
│   ├── package.json                    ← { "type": "module", express, cors, dotenv }
│   ├── .env                            ← CLIENT_ID, CLIENT_SECRET, JWT_SECRET
│   └── .env.example                    ← Template
│
└── portal/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                     ← Router, role state
        ├── index.css                   ← gwaithlabs design tokens
        ├── api/
        │   └── client.js               ← API client (OSDK-annotated)
        ├── hooks/
        │   └── useApi.js               ← Data loading hook
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Card.jsx
        │   ├── Badge.jsx
        │   ├── Button.jsx
        │   ├── KPI.jsx
        │   ├── ProgressBar.jsx
        │   ├── Table.jsx
        │   ├── MiniChart.jsx
        │   ├── DropZone.jsx
        │   ├── PageHeader.jsx
        │   └── LoadState.jsx
        └── screens/
            ├── Login.jsx
            ├── participant/
            │   ├── Dashboard.jsx
            │   ├── Training.jsx
            │   ├── ModuleViewer.jsx
            │   ├── Events.jsx
            │   ├── EventDetail.jsx
            │   ├── Submission.jsx
            │   ├── MySubmissions.jsx
            │   ├── Leaderboard.jsx
            │   └── Profile.jsx
            ├── admin/
            │   ├── Dashboard.jsx
            │   ├── Events.jsx
            │   ├── Users.jsx
            │   ├── Organisations.jsx
            │   ├── Training.jsx
            │   └── Analytics.jsx
            ├── instructor/
            │   ├── Tracks.jsx
            │   ├── Editor.jsx
            │   ├── Exercises.jsx
            │   └── Progress.jsx
            └── judge/
                ├── Events.jsx
                ├── Queue.jsx
                └── History.jsx
```

---

## 9. Environment Configuration

### `backend/.env`

```env
# Palantir Foundry
FOUNDRY_URL=https://aavya.palantirfoundry.com
CLIENT_ID=<from Developer Console — Backend Service>
CLIENT_SECRET=<from Developer Console — Backend Service>
ONTOLOGY_RID=ri.ontology.main.ontology.2b524aaa-b15b-49c6-9b69-353f71badbaf

# Server
PORT=3001
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Auth
JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
```

### `portal/.env` (create this file)

```env
VITE_API_URL=http://localhost:3001/api
```

### Running Both Services

```bash
# Terminal 1 — Backend (real Foundry data)
cd C:\Users\mithi\Desktop\Vanyar_website\backend
node server.js

# Terminal 1 — Backend (mock data, no Foundry creds needed)
node server.js --mock

# Terminal 2 — Portal
cd C:\Users\mithi\Desktop\Vanyar_website\portal
npm run dev
```

Portal: `http://localhost:5173`
Backend: `http://localhost:3001`
Health check: `http://localhost:3001/api/health`

---

## 10. API Reference

### Auth Endpoints

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/api/auth/register` | None | `{ email, name, password, orgId? }` | `{ token, userId, name, role }` |
| POST | `/api/auth/login` | None | `{ email, password }` | `{ token, userId, name, role }` |

### Data Endpoints (read — no auth required for POC)

| Method | Path | Returns |
|---|---|---|
| GET | `/api/health` | Server status, mock mode flag |
| GET | `/api/stats` | `{ users, events, tracks, submissions }` |
| GET | `/api/events?status=ACTIVE` | Array of Event objects |
| GET | `/api/events/:id` | Single Event object |
| GET | `/api/events/:id/challenges` | Challenges for event |
| GET | `/api/events/:id/leaderboard?limit=20` | Leaderboard entries |
| GET | `/api/leaderboard?limit=10` | Global top leaderboard |
| GET | `/api/tracks` | All tracks |
| GET | `/api/tracks/:id/modules` | Modules for track |
| GET | `/api/submissions?limit=20` | Recent submissions |
| GET | `/api/organisations` | All organisations |

### Action Endpoints (write — require JWT)

| Method | Path | Auth | Body | Action Fired |
|---|---|---|---|---|
| POST | `/api/events/:id/enrol` | JWT | `{}` | `registerForEvent` |
| POST | `/api/submissions` | JWT | `{ challengeId?, exerciseId?, fileRef, fileName }` | `submitSolution` |
| POST | `/api/modules/:id/complete` | JWT | `{}` | `completeModule` |
| POST | `/api/scores` | JWT | `{ submissionId, scoreValue, feedback }` | `scoreSubmission` |
| POST | `/api/admin/events` | JWT | `{ name, eventType, startDate, endDate, orgId }` | `createEvent` |
| POST | `/api/admin/events/:id/publish` | JWT | `{}` | `publishEvent` |
| POST | `/api/admin/challenges` | JWT | `{ eventId, title, challengeType, maxScore }` | `createChallenge` |
| POST | `/api/admin/modules` | JWT | `{ trackId, title, contentType, contentRef }` | `createTrainingModule` |

---

## 11. Known Limitations & Future Work

From the Developer Reference — acknowledged gaps:

| Issue | Impact | Fix |
|---|---|---|
| No duplicate enrolment check | User can register multiple times for same event | Add TypeScript function as validation rule on `registerForEvent` |
| No `maxParticipants` capacity check | Events can exceed capacity | Add count check function on `registerForEvent` |
| `submitSolution` allows both challenge + exercise | Data integrity issue | Function-backed action with exactly-one-of validation |
| `sortOrder` defaults to 1 for all challenges/modules | No ordering | Auto-increment function: read MAX(sortOrder) + 1 |
| `moduleCount` on Track not auto-updated | Stale count | Function or pipeline that recomputes on module creation |
| No notification side-effects on actions | No user alerts | Foundry Notifications or Code Repository webhook |
| No pipeline refresh schedules | Leaderboard only updates on manual trigger | Configure 15-min schedule on leaderboard pipeline |
| JudgeAssignment has no seed data | Empty judge queue in demo | Add seed data or create via action in demo setup |
| Audit fields (createdBy, createdAt) null in cleaned data | Incomplete audit trail | Actions must set these fields; currently null |
| LeaderboardEntry edits disabled | Cannot manually set ranks | Correct — pipeline-only, but pipeline must be built |

---

## 12. Post-POC Roadmap

### Phase 1 — MVP (Weeks 4–6)
- Automated analytical scoring (Python transforms compare submission CSV against ground truth)
- Email notifications via Foundry webhooks
- Configurable scoring rubrics
- File preview in portal (PDF renderer)

### Phase 2 — Ecosystem Features (Weeks 7–9)
- Partner content contribution portal
- Live leaderboard updates (WebSocket / SSE)
- Team collaboration features
- Dataset versioning for challenges

### Phase 3 — Enterprise Readiness (Weeks 10–12)
- SAML federation for partner organisations
- Advanced RBAC (Org Manager role with delegated admin)
- Audit logging via Checkpoint
- Data export APIs
- Contour dashboards for self-service analytics

### Phase 4 — Scale & Polish (Weeks 13–15)
- Performance optimisation (pipeline scheduling, object indexing)
- Mobile-responsive portal design
- Comprehensive documentation
- Foundry sandbox environments for exercise validation (OSDK-based)

---

## Summary — What to Do This Week

```
Day 1 (Today):
  [x] Object Types built (14) ✅
  [x] Link Types built (22) ✅
  [x] Action Types built (8) ✅
  [x] React Portal built (22 screens) ✅
  [x] Express Backend built ✅
  [ ] Complete Developer Console → get CLIENT_ID + SECRET → update .env

Day 2:
  [ ] Add callAction() to foundry.js
  [ ] Add action endpoints to server.js (enrol, submit, complete, score)
  [ ] Test: create event → publish → enrol → submit (via mock first)

Day 3:
  [ ] Add JWT auth (register + login endpoints)
  [ ] Update portal Login screen with real form
  [ ] Test full auth flow end-to-end

Day 4:
  [ ] Build Leaderboard pipeline in Foundry Pipeline Builder
  [ ] Configure 15-min schedule

Day 5:
  [ ] End-to-end integration test:
      Admin creates event → Participant registers → Submits →
      Judge scores → Pipeline runs → Leaderboard updates
  [ ] Demo walkthrough preparation
```

---

*Generated: April 2026 | Vanyar Platform POC | Gwaith Labs*
*Foundry Stack: aavya.palantirfoundry.com | Branch: km/vanyar-ontology-setup*
