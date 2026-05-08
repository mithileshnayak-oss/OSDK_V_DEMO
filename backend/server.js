import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  listObjects,
  getObject,
  searchObjects,
  aggregateObjects,
  getLinkedObjects,
  callAction,
} from './foundry.js';
import { MOCK } from './mock-data.js';

const MOCK_MODE = process.argv.includes('--mock') || process.env.MOCK === 'true';
const JWT_SECRET = process.env.JWT_SECRET || 'vanyar-dev-secret-change-in-prod';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('CORS: origin not allowed'));
  },
}));

app.use(express.json());

// ── helpers ───────────────────────────────────────────────────────────────────

function ok(res, data) { res.json({ ok: true, data }); }

function fail(res, err, status = 500) {
  console.error('[route error]', err.message);
  res.status(status).json({ ok: false, error: err.message });
}

// Flatten Foundry objects to {id, ...properties}.
// Handles two shapes: v2 REST (flat with __primaryKey / __apiName meta) and
// the legacy / mock shape (nested {primaryKey, properties}).
const flatten = (o) => {
  if (!o) return o;
  if (o.__primaryKey !== undefined) {
    const { __primaryKey, __apiName, __rid, __title, ...props } = o;
    return { id: __primaryKey, ...props };
  }
  return { id: o.primaryKey, ...(o.properties ?? {}) };
};
// Real Foundry data has lowercase statuses (active, upcoming, completed).
// Frontend expects uppercase. Also map "upcoming" → "PUBLISHED" semantically.
// And — since nothing in Foundry auto-transitions upcoming → active on the
// start date — we compute the effective status from startDate/endDate here.
// The stored `status` still wins for explicit DRAFT / CANCELLED states.
const STATUS_ALIAS = { UPCOMING: 'PUBLISHED' };
const effectiveStatus = (stored, startDate, endDate) => {
  if (!stored) return stored;
  // Don't override explicit admin states.
  if (stored === 'DRAFT' || stored === 'CANCELLED') return stored;
  const now = Date.now();
  const start = startDate ? Date.parse(startDate) : NaN;
  const end = endDate ? Date.parse(endDate) : NaN;
  if (!isNaN(end) && now > end) return 'COMPLETED';
  if (!isNaN(start) && !isNaN(end) && now >= start && now <= end) return 'ACTIVE';
  return stored;
};
const flattenEvent = (o) => {
  const f = flatten(o);
  if (!f) return f;
  f.title = f.title ?? f.name;
  if (typeof f.status === 'string') {
    const up = f.status.toUpperCase();
    f.status = effectiveStatus(STATUS_ALIAS[up] ?? up, f.startDate, f.endDate);
  }
  return f;
};
const flattenEntry = (o) => {
  const f = flatten(o);
  if (!f) return f;
  f.score = f.score ?? f.totalScore;
  f.userName = f.userName ?? f.userId;
  f.teamName = f.teamName ?? f.teamId;
  return f;
};
const arr = (x) => Array.isArray(x) ? x : [];

// ── portal user store (email + password hash) ────────────────────────────────
// Persisted to disk so portal logins survive a backend restart. Foundry holds
// the canonical VanyarUser identity; this file only stores what Foundry can't
// (the bcrypt hash). In production this would be a proper database.
const USERS_FILE = path.resolve(process.cwd(), 'users.json');
const _users = new Map();
try {
  if (fs.existsSync(USERS_FILE)) {
    const raw = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    for (const [email, u] of Object.entries(raw)) _users.set(email, u);
    console.log(`[users] loaded ${_users.size} user(s) from ${USERS_FILE}`);
  }
} catch (e) {
  console.error('[users] failed to load users.json:', e.message);
}
function persistUsers() {
  try {
    const obj = Object.fromEntries(_users);
    fs.writeFileSync(USERS_FILE + '.tmp', JSON.stringify(obj, null, 2));
    fs.renameSync(USERS_FILE + '.tmp', USERS_FILE);
  } catch (e) {
    console.error('[users] persist failed:', e.message);
  }
}

// ── in-memory results-publication store ──────────────────────────────────────
// Brief §4.3: "Leaderboards should support hidden scoring until event end +
// manual result publication." For the POC we track this server-side only;
// in a full build it would be a field on VanyarEvent written by an action.
const _publishedResults = new Map(); // eventId → publishedAt (ISO string)
const isResultsPublished = (eventId) => _publishedResults.has(eventId);

// ── JWT middleware ────────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Missing token' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'Invalid or expired token' });
  }
}

// ── action RIDs ───────────────────────────────────────────────────────────────

// Real apiNames discovered from the Foundry tenant (kebab-case)
const ACTION = {
  createEvent:      'create-event',
  publishEvent:     'publish-event',
  createChallenge:  'create-challenge',
  createModule:     'create-training-module',
  registerForEvent: 'register-for-event',
  submitSolution:   'submit-solution',
  completeModule:   'complete-module',
  scoreSubmission:  'score-submission',
  createVanyarUser: 'create-vanyar-user',
  deleteVanyarUser: 'delete-vanyar-user',
  registerForTrack: 'register-for-track',
};

// ── /api/health ───────────────────────────────────────────────────────────────

app.get('/api/health', (_, res) => res.json({ ok: true, mock: MOCK_MODE, ts: Date.now() }));

// ── /api/auth/register ────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, orgId } = req.body ?? {};
  if (!email || !password || !name) {
    return res.status(400).json({ ok: false, error: 'email, password, name required' });
  }
  if (_users.has(email.toLowerCase())) {
    return res.status(409).json({ ok: false, error: 'Email already registered' });
  }

  // Role is never accepted from the client — new users are always 'participant'.
  // Elevation to admin/instructor/judge must be done by an existing admin (TODO).
  const role = 'participant';
  const hash = await bcrypt.hash(password, 10);

  // Foundry has no uniqueness constraint on email. Check for an existing
  // VanyarUser first and reuse its userId; otherwise create a new one.
  let userId;
  if (!MOCK_MODE) {
    try {
      const existing = await searchObjects('VanyarUser', {
        where: { type: 'eq', field: 'email', value: email },
        pageSize: 1,
      });
      const match = arr(existing?.data)[0];
      if (match) {
        userId = flatten(match).id;
        console.log('[register] reusing existing Foundry VanyarUser:', userId);
      }
    } catch (e) {
      console.error('[register] VanyarUser email lookup failed:', e.message);
    }
  }

  if (!userId) {
    userId = `usr_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    if (!MOCK_MODE) {
      try {
        await callAction(ACTION.createVanyarUser, {
          userId,
          email,
          name,
          role,
          orgId: orgId ?? 'default-org',
        });
      } catch (e) {
        // Registration still succeeds on the portal side — the Foundry mirror
        // can be backfilled later. Surface the failure in logs for debugging.
        console.error('[register] createVanyarUser failed:', e.message);
      }
    }
  }

  _users.set(email.toLowerCase(), { userId, email, hash, name, role, orgId });
  persistUsers();

  const token = jwt.sign({ userId, email, name, role, orgId }, JWT_SECRET, { expiresIn: '7d' });
  ok(res, { token, userId, name, role });
});

// ── /api/auth/demo ────────────────────────────────────────────────────────────
// Dev-only endpoint: issues a JWT for the requested role without credentials.
// Only enabled in MOCK_MODE or when NODE_ENV !== 'production'. Do not expose
// to real users — it is the bypass used by the "Demo Access" buttons in the UI.

const DEMO_ENABLED = MOCK_MODE || process.env.NODE_ENV !== 'production';
const DEMO_USERS = {
  participant: { userId: 'demo_participant', name: 'Arjun Mehta',   email: 'arjun@example.com' },
  admin:       { userId: 'demo_admin',       name: 'Priya Sharma',  email: 'priya@foundry.ai' },
  instructor:  { userId: 'demo_instructor',  name: 'Rohan Das',     email: 'rohan@foundry.ai' },
  judge:       { userId: 'demo_judge',       name: 'Ananya Iyer',   email: 'ananya@foundry.ai' },
  org_manager: { userId: 'demo_orgmgr',      name: 'Karan Verma',   email: 'karan@aavya.com',  orgId: 'demo-org' },
};

app.post('/api/auth/demo', async (req, res) => {
  if (!DEMO_ENABLED) {
    return res.status(404).json({ ok: false, error: 'Demo auth disabled' });
  }
  const { role } = req.body ?? {};
  const profile = DEMO_USERS[role];
  if (!profile) {
    return res.status(400).json({ ok: false, error: 'Unknown demo role' });
  }

  // Ensure a VanyarUser exists in Foundry for this demo identity. Actions
  // that take a VanyarUser reference (submit-solution, complete-module, …)
  // fail with ActionParameterObjectNotFound if the demo userId isn't a real
  // object. Search by email first to avoid duplicates across restarts.
  let { userId } = profile;
  if (!MOCK_MODE) {
    try {
      const existing = await searchObjects('VanyarUser', {
        where: { type: 'eq', field: 'email', value: profile.email },
        pageSize: 1,
      });
      const match = arr(existing?.data)[0];
      if (match) {
        userId = flatten(match).id;
      } else {
        await callAction(ACTION.createVanyarUser, {
          userId,
          email: profile.email,
          name: profile.name,
          role,
          orgId: profile.orgId ?? 'default-org',
        });
      }
    } catch (e) {
      console.error('[demo] failed to ensure VanyarUser:', e.message);
    }
  }

  const token = jwt.sign({ ...profile, userId, role }, JWT_SECRET, { expiresIn: '7d' });
  ok(res, { token, ...profile, userId, role });
});

// ── /api/auth/login ───────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'email and password required' });
  }

  const user = _users.get(email.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.hash))) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.userId, email: user.email, name: user.name, role: user.role, orgId: user.orgId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  ok(res, { token, userId: user.userId, name: user.name, role: user.role });
});

// ── /api/stats ────────────────────────────────────────────────────────────────

app.get('/api/stats', async (_, res) => {
  if (MOCK_MODE) return ok(res, MOCK.stats);
  try {
    const [users, eventsAll, eventList, tracks, submissions, orgs] = await Promise.all([
      aggregateObjects('VanyarUser',   { aggregations: [{ type: 'count', name: 'count' }] }),
      aggregateObjects('VanyarEvent',        { aggregations: [{ type: 'count', name: 'count' }] }),
      // Count ACTIVE via listObjects + date-derived status so this matches
      // what the frontend sees on /api/events.
      listObjects('VanyarEvent', { pageSize: 200 }),
      aggregateObjects('VanyarTrack',        { aggregations: [{ type: 'count', name: 'count' }] }),
      aggregateObjects('VanyarSubmission',   { aggregations: [{ type: 'count', name: 'count' }] }),
      aggregateObjects('VanyarOrganisation', { aggregations: [{ type: 'count', name: 'count' }] }),
    ]);
    // Foundry v2 shape: { data: [{ group, metrics: [{name, value}, ...] }] }
    const n = (agg) => {
      const metrics = agg.data?.[0]?.metrics;
      if (Array.isArray(metrics)) return metrics[0]?.value ?? 0;
      return metrics?.count ?? 0; // legacy shape fallback
    };
    const activeEvents = arr(eventList.data).map(flattenEvent).filter(e => e.status === 'ACTIVE').length;
    ok(res, {
      totalUsers: n(users),
      totalEvents: n(eventsAll),
      activeEvents,
      tracks: n(tracks),
      submissions: n(submissions),
      organisations: n(orgs),
      modulesCompleted: 0,
      avgScore: 0,
    });
  } catch (e) { fail(res, e); }
});

// ── /api/stats/me ─────────────────────────────────────────────────────────────
// Participant-scoped KPIs for the dashboard. activeEvents stays platform-wide
// (it's a signal of what's available to join); everything else is per-user.

app.get('/api/stats/me', requireAuth, async (req, res) => {
  if (MOCK_MODE) {
    return ok(res, { activeEvents: 0, modulesCompleted: 0, submissions: 0, avgScore: 0 });
  }
  try {
    const userId = req.user.userId;
    const [eventList, progressRes, subsRes] = await Promise.all([
      listObjects('VanyarEvent', { pageSize: 200 }),
      searchObjects('VanyarProgress', {
        where: { type: 'eq', field: 'userId', value: userId },
        pageSize: 500,
      }),
      searchObjects('VanyarSubmission', {
        where: { type: 'eq', field: 'userId', value: userId },
        pageSize: 200,
      }),
    ]);

    const activeEvents = arr(eventList.data).map(flattenEvent).filter(e => e.status === 'ACTIVE').length;

    // Distinct moduleId count — one completion per module, even if the
    // complete-module action was fired twice (dupes happen).
    const progress = arr(progressRes.data).map(flatten);
    const modulesCompleted = new Set(progress.map(p => p.moduleId).filter(Boolean)).size;

    const subs = arr(subsRes.data).map(flatten);
    const submissions = subs.length;

    // Scores live on VanyarScore (submissionId, value, feedback, judgeUserId)
    // — not on the submission itself. Join by submissionId.
    const mySubmissionIds = new Set(subs.map(s => s.submissionId ?? s.id).filter(Boolean));
    let avgScore = 0;
    if (mySubmissionIds.size) {
      const scoresRes = await listObjects('VanyarScore', { pageSize: 500 });
      const myScores = arr(scoresRes.data).map(flatten)
        .filter(sc => mySubmissionIds.has(sc.submissionId))
        .map(sc => sc.value)
        .filter(v => typeof v === 'number');
      if (myScores.length) {
        avgScore = Math.round(myScores.reduce((a, v) => a + v, 0) / myScores.length);
      }
    }

    ok(res, { activeEvents, modulesCompleted, submissions, avgScore });
  } catch (e) { fail(res, e); }
});

// ── /api/events ───────────────────────────────────────────────────────────────

app.get('/api/events', async (req, res) => {
  if (MOCK_MODE) {
    const statuses = req.query.status?.split(',').map(s => s.trim().toUpperCase());
    const filtered = statuses
      ? MOCK.events.filter(e => statuses.includes(e.properties.status))
      : MOCK.events;
    return ok(res, filtered.map(flattenEvent));
  }
  try {
    // Fetch all and filter after flattening — status is now computed from
    // dates, so Foundry-side filtering would miss events whose stored status
    // is "upcoming" but whose dates put them in the ACTIVE window.
    const requested = req.query.status?.split(',').map(s => s.trim().toUpperCase());
    const result = await listObjects('VanyarEvent', { pageSize: 100, orderBy: 'startDate ASC' });
    let events = arr(result.data).map(flattenEvent);
    if (requested?.length) {
      events = events.filter(e => requested.includes(e.status));
    }
    ok(res, events);
  } catch (e) { fail(res, e); }
});

// ── /api/events (create) ──────────────────────────────────────────────────────

app.post('/api/events', requireAuth, async (req, res) => {
  const { role } = req.user;
  if (role !== 'admin' && role !== 'instructor' && role !== 'org_manager') {
    return res.status(403).json({ ok: false, error: 'Admin, instructor, or org manager role required' });
  }
  if (MOCK_MODE) return ok(res, { eventId: `evt_mock_${Date.now()}` });
  try {
    const { name, eventType, startDate, endDate, description } = req.body;
    if (!name || !eventType || !startDate || !endDate) {
      return res.status(400).json({ ok: false, error: 'name, eventType, startDate, endDate required' });
    }
    const result = await callAction(ACTION.createEvent, {
      name,
      eventType,
      startDate,
      endDate,
      description: description ?? '',
      orgId: req.user.orgId ?? req.body.orgId ?? 'demo-org',
    });
    ok(res, result);
  } catch (e) { fail(res, e); }
});

// ── /api/events/:id ───────────────────────────────────────────────────────────

app.get('/api/events/:id', async (req, res) => {
  if (MOCK_MODE) {
    const ev = MOCK.events.find(e => e.primaryKey === req.params.id);
    return ev ? ok(res, flattenEvent(ev)) : res.status(404).json({ ok: false, error: 'not found' });
  }
  try {
    const event = await getObject('VanyarEvent', req.params.id);
    ok(res, flattenEvent(event));
  } catch (e) { fail(res, e); }
});

// ── /api/events/:id/publish ───────────────────────────────────────────────────

app.post('/api/events/:id/publish', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'org_manager') {
    return res.status(403).json({ ok: false, error: 'Admin or org manager role required' });
  }
  if (MOCK_MODE) return ok(res, { published: true });
  try {
    const result = await callAction(ACTION.publishEvent, { event: req.params.id });
    ok(res, result);
  } catch (e) { fail(res, e); }
});

// ── /api/events/:id/publish-results ───────────────────────────────────────────
// Admin or org manager flips the event's "results published" flag, which
// unhides the leaderboard for all participants. Brief §4.3.

app.post('/api/events/:id/publish-results', requireAuth, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'org_manager') {
    return res.status(403).json({ ok: false, error: 'Admin or org manager role required' });
  }
  _publishedResults.set(req.params.id, new Date().toISOString());
  ok(res, { published: true, publishedAt: _publishedResults.get(req.params.id) });
});

app.delete('/api/events/:id/publish-results', requireAuth, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'org_manager') {
    return res.status(403).json({ ok: false, error: 'Admin or org manager role required' });
  }
  _publishedResults.delete(req.params.id);
  ok(res, { published: false });
});

app.get('/api/events/:id/results-status', (req, res) => {
  ok(res, {
    published: isResultsPublished(req.params.id),
    publishedAt: _publishedResults.get(req.params.id) ?? null,
  });
});

// ── /api/events/:id/enrol ─────────────────────────────────────────────────────

app.post('/api/events/:id/enrol', requireAuth, async (req, res) => {
  if (MOCK_MODE) return ok(res, { enrolmentId: `enr_mock_${Date.now()}` });
  try {
    const result = await callAction(ACTION.registerForEvent, {
      user: req.user.userId,
      event: req.params.id,
    });
    ok(res, result);
  } catch (e) { fail(res, e); }
});

// ── /api/events/:id/challenges ────────────────────────────────────────────────

app.get('/api/events/:id/challenges', async (req, res) => {
  if (MOCK_MODE) return ok(res, (MOCK.challengesForEvent[req.params.id] ?? []).map(flatten));
  try {
    const result = await searchObjects('VanyarChallenge', {
      where: { type: 'eq', field: 'eventId', value: req.params.id },
      orderBy: [{ field: 'sortOrder', direction: 'ASC' }],
      pageSize: 50,
    });
    ok(res, arr(result.data).map(flatten));
  } catch (e) { fail(res, e); }
});

// ── /api/challenges/:id/dataset ───────────────────────────────────────────────
// Serves the starter dataset for an analytical challenge. The ontology stores
// only a path-like `datasetRef` (e.g. "datasets/pipeline_perf.csv"), not a
// binary. For the MVP we synthesize a small placeholder CSV so the download
// flow is end-to-end clickable. In a full build this would stream from
// Foundry File Storage / S3.

app.get('/api/challenges/:id/dataset', requireAuth, async (req, res) => {
  if (MOCK_MODE) {
    return res.status(404).json({ ok: false, error: 'No dataset in mock mode' });
  }
  try {
    const ch = flatten(await getObject('VanyarChallenge', req.params.id));
    const ref = ch?.datasetRef;
    if (!ref || ref === '—') {
      return res.status(404).json({ ok: false, error: 'No dataset for this challenge' });
    }
    const filename = ref.split('/').pop() || 'dataset.csv';
    const csv = [
      `# ${ch.title ?? 'Challenge dataset'}`,
      `# Source: ${ref}`,
      `# Generated: ${new Date().toISOString()}`,
      'id,value,category,notes',
      '1,42,A,sample row',
      '2,17,B,sample row',
      '3,99,A,sample row',
      '4,58,C,sample row',
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (e) { fail(res, e); }
});

// ── /api/events/:id/leaderboard ───────────────────────────────────────────────

app.get('/api/events/:id/leaderboard', async (req, res) => {
  // Privileged roles (admin / org_manager / judge) always see live scores.
  // Participants + anonymous viewers see hidden until admin publishes results.
  const auth = req.headers.authorization;
  let role = null;
  if (auth?.startsWith('Bearer ')) {
    try { role = jwt.verify(auth.slice(7), JWT_SECRET).role; } catch { /* anon */ }
  }
  const privileged = role === 'admin' || role === 'org_manager' || role === 'judge';
  const published = isResultsPublished(req.params.id);

  if (!privileged && !published) {
    return ok(res, { entries: [], published: false, hidden: true });
  }

  try {
    let entries;
    if (MOCK_MODE) {
      entries = MOCK.leaderboard
        .filter(e => e.properties.eventId === req.params.id)
        .map(flattenEntry);
    } else {
      const limit = Math.min(parseInt(req.query.limit ?? '20', 10), 100);
      const [entriesRes, usersRes] = await Promise.all([
        searchObjects('VanyarLeaderboardEntry', {
          where: { type: 'eq', field: 'eventId', value: req.params.id },
          pageSize: limit,
        }),
        listObjects('VanyarUser', { pageSize: 200 }),
      ]);
      const userName = new Map(arr(usersRes.data).map(flatten).map(u => [u.id, u.name]));
      entries = arr(entriesRes.data).map(flattenEntry)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .map((e, i) => ({
          ...e,
          rank: i + 1,
          userName: userName.get(e.userId) ?? e.userName,
        }));
    }
    ok(res, { entries, published, hidden: false });
  } catch (e) { fail(res, e); }
});

// ── /api/events/:id/teams ─────────────────────────────────────────────────────

app.get('/api/events/:id/teams', async (req, res) => {
  try {
    const result = await searchObjects('VanyarTeam', {
      where: { type: 'eq', field: 'eventId', value: req.params.id },
      pageSize: 50,
    });
    ok(res, arr(result.data).map(flatten));
  } catch (e) { fail(res, e); }
});

// ── /api/leaderboard ─────────────────────────────────────────────────────────

app.get('/api/leaderboard', async (req, res) => {
  if (MOCK_MODE) {
    const limit = parseInt(req.query.limit ?? '10', 10);
    const sorted = [...MOCK.leaderboard]
      .sort((a, b) => b.properties.totalScore - a.properties.totalScore)
      .slice(0, limit)
      .map(flattenEntry);
    return ok(res, sorted);
  }
  try {
    const limit = Math.min(parseInt(req.query.limit ?? '10', 10), 50);
    // Foundry's orderBy isn't always honored on listObjects, so sort
    // server-side. Also resolve userId → name so the UI shows real names
    // instead of opaque IDs, and attach a positional rank.
    const [entriesRes, usersRes] = await Promise.all([
      listObjects('VanyarLeaderboardEntry', { pageSize: 200 }),
      listObjects('VanyarUser', { pageSize: 200 }),
    ]);
    const userName = new Map(arr(usersRes.data).map(flatten).map(u => [u.id, u.name]));
    const entries = arr(entriesRes.data).map(flattenEntry)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, limit)
      .map((e, i) => ({
        ...e,
        rank: i + 1,
        userName: userName.get(e.userId) ?? e.userName,
      }));
    ok(res, entries);
  } catch (e) { fail(res, e); }
});

// ── /api/tracks ───────────────────────────────────────────────────────────────

app.get('/api/tracks', async (req, res) => {
  if (MOCK_MODE) return ok(res, MOCK.tracks.map(flatten));
  try {
    const result = await listObjects('VanyarTrack', { pageSize: 50, orderBy: 'name ASC' });
    ok(res, arr(result.data).map(flatten));
  } catch (e) { fail(res, e); }
});

// ── /api/tracks/:id/register ──────────────────────────────────────────────────
// Participant enrols themselves in a learning track. Calls the Foundry
// register-for-track action to create a VanyarProgress stub so the track
// appears on their dashboard with 0% complete.

app.post('/api/tracks/:id/register', requireAuth, async (req, res) => {
  if (MOCK_MODE) return ok(res, { progressId: `prog_mock_${Date.now()}` });
  try {
    const result = await callAction(ACTION.registerForTrack, {
      user: req.user.userId,
      track: req.params.id,
    });
    ok(res, result);
  } catch (e) { fail(res, e); }
});

// ── /api/tracks/:id/modules ───────────────────────────────────────────────────

app.get('/api/tracks/:id/modules', async (req, res) => {
  try {
    const result = await searchObjects('VanyarTrainingModule', {
      where: { type: 'eq', field: 'trackId', value: req.params.id },
      orderBy: [{ field: 'sortOrder', direction: 'ASC' }],
      pageSize: 50,
    });
    ok(res, arr(result.data).map(flatten));
  } catch (e) { fail(res, e); }
});

// ── /api/modules/:id/complete ─────────────────────────────────────────────────

app.post('/api/modules/:id/complete', requireAuth, async (req, res) => {
  if (MOCK_MODE) return ok(res, { progressId: `prog_mock_${Date.now()}` });
  try {
    const result = await callAction(ACTION.completeModule, {
      user: req.user.userId,
      module: req.params.id,
    });
    ok(res, result);
  } catch (e) { fail(res, e); }
});

// ── /api/submissions (list) ───────────────────────────────────────────────────

app.get('/api/submissions', async (req, res) => {
  if (MOCK_MODE) {
    return ok(res, MOCK.leaderboard.map(e => {
      const f = flattenEntry(e);
      return { ...f, type: 'submission' };
    }));
  }
  try {
    const limit = Math.min(parseInt(req.query.limit ?? '20', 10), 100);
    const result = await listObjects('VanyarSubmission', { pageSize: limit, orderBy: 'submittedAt DESC' });
    const safe = arr(result.data).map(s => {
      const f = flatten(s);
      delete f.fileRef;
      return f;
    });
    ok(res, safe);
  } catch (e) { fail(res, e); }
});

// ── /api/submissions (create) ─────────────────────────────────────────────────

app.post('/api/submissions', requireAuth, async (req, res) => {
  if (MOCK_MODE) return ok(res, { submissionId: `sub_mock_${Date.now()}` });
  try {
    const { challengeId, exerciseId, fileRef, fileName, notes } = req.body ?? {};
    if (!fileRef || !fileName) {
      return res.status(400).json({ ok: false, error: 'fileRef and fileName required' });
    }
    if (!challengeId && !exerciseId) {
      return res.status(400).json({ ok: false, error: 'One of challengeId or exerciseId required' });
    }
    if (challengeId && exerciseId) {
      return res.status(400).json({ ok: false, error: 'Provide either challengeId or exerciseId, not both' });
    }
    // `notes` is not part of the submit-solution action schema; discard it.
    const params = {
      user: req.user.userId,
      fileRef,
      fileName,
      ...(challengeId ? { challenge: challengeId } : { exercise: exerciseId }),
    };
    const result = await callAction(ACTION.submitSolution, params);
    ok(res, result);
  } catch (e) { fail(res, e); }
});

// ── /api/submissions/pending ──────────────────────────────────────────────────
// Judge-facing list: submissions that don't yet have a VanyarScore. Enriched
// with participantName + challengeTitle so the queue UI can render names,
// not raw IDs. Optional ?eventId= narrows to one event (via challenge join,
// since VanyarSubmission itself has no eventId field).

app.get('/api/submissions/pending', requireAuth, async (req, res) => {
  if (!['judge', 'admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ ok: false, error: 'Judge, instructor, or admin role required' });
  }
  if (MOCK_MODE) return ok(res, []);
  try {
    const { eventId } = req.query;
    const [subsRes, scoresRes, usersRes, challengesRes] = await Promise.all([
      listObjects('VanyarSubmission', { pageSize: 200, orderBy: 'submittedAt DESC' }),
      listObjects('VanyarScore', { pageSize: 500 }),
      listObjects('VanyarUser', { pageSize: 200 }),
      listObjects('VanyarChallenge', { pageSize: 200 }),
    ]);
    const scored = new Set(arr(scoresRes.data).map(flatten).map(s => s.submissionId).filter(Boolean));
    const userName = new Map(arr(usersRes.data).map(flatten).map(u => [u.id, u.name]));
    const challenges = arr(challengesRes.data).map(flatten);
    const challengeTitle = new Map(challenges.map(c => [c.id, c.title ?? c.name]));
    const eventChallengeIds = eventId
      ? new Set(challenges.filter(c => c.eventId === eventId).map(c => c.id))
      : null;

    const pending = arr(subsRes.data).map(flatten)
      .filter(s => !scored.has(s.submissionId ?? s.id))
      .filter(s => !eventChallengeIds || eventChallengeIds.has(s.challengeId))
      .map(s => {
        const { fileRef, ...rest } = s;
        return {
          ...rest,
          submissionId: s.submissionId ?? s.id,
          participantName: userName.get(s.userId) ?? s.userId,
          challengeTitle: challengeTitle.get(s.challengeId) ?? s.challengeId,
        };
      });
    ok(res, pending);
  } catch (e) { fail(res, e); }
});

// ── /api/scores ───────────────────────────────────────────────────────────────

app.post('/api/scores', requireAuth, async (req, res) => {
  if (req.user.role !== 'judge' && req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Judge or admin role required' });
  }
  if (MOCK_MODE) return ok(res, { scoreId: `scr_mock_${Date.now()}` });
  try {
    const { submissionId, scoreValue, feedback } = req.body ?? {};
    if (!submissionId || scoreValue === undefined) {
      return res.status(400).json({ ok: false, error: 'submissionId and scoreValue required' });
    }
    if (scoreValue < 0 || scoreValue > 100) {
      return res.status(400).json({ ok: false, error: 'scoreValue must be 0–100' });
    }
    const result = await callAction(ACTION.scoreSubmission, {
      submission: submissionId,
      judge: req.user.userId,
      scoreValue,
      feedback: feedback ?? '',
    });
    ok(res, result);
  } catch (e) { fail(res, e); }
});

// ── /api/users (list) ─────────────────────────────────────────────────────────

app.get('/api/users', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Admin role required' });
  }
  try {
    const result = await listObjects('VanyarUser', { pageSize: 100, orderBy: 'name ASC' });
    ok(res, arr(result.data).map(flatten));
  } catch (e) { fail(res, e); }
});

// ── /api/users/:id ────────────────────────────────────────────────────────────

app.get('/api/users/:id', requireAuth, async (req, res) => {
  try {
    const user = await getObject('VanyarUser', req.params.id);
    const f = flatten(user);
    delete f.email;
    delete f.createdBy;
    ok(res, f);
  } catch (e) { fail(res, e); }
});

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
// Admin-only. Calls the delete-vanyar-user Foundry action, then evicts the
// matching entry from the in-memory portal user map so the email can be
// re-registered without colliding.

app.delete('/api/users/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Admin role required' });
  }
  if (req.user.userId === req.params.id) {
    return res.status(400).json({ ok: false, error: 'Cannot delete your own account' });
  }
  try {
    await callAction(ACTION.deleteVanyarUser, { vanyar_user: req.params.id });
    for (const [email, u] of _users) {
      if (u.userId === req.params.id) { _users.delete(email); persistUsers(); break; }
    }
    ok(res, { deleted: req.params.id });
  } catch (e) { fail(res, e); }
});

// ── /api/users/:id/submissions ────────────────────────────────────────────────
// Returns only the caller's own submissions (or an admin can query any userId).

app.get('/api/users/:id/submissions', requireAuth, async (req, res) => {
  if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Can only view your own submissions' });
  }
  if (MOCK_MODE) {
    return ok(res, MOCK.leaderboard
      .filter(e => e.properties.userId === req.params.id)
      .map(flattenEntry));
  }
  try {
    const limit = Math.min(parseInt(req.query.limit ?? '20', 10), 100);
    const result = await searchObjects('VanyarSubmission', {
      where: { type: 'eq', field: 'userId', value: req.params.id },
      orderBy: [{ field: 'submittedAt', direction: 'DESC' }],
      pageSize: limit,
    });
    const submissions = arr(result.data).map(s => {
      const f = flatten(s);
      delete f.fileRef;
      return f;
    });

    // Enrich with human-readable challenge + event names, and join any
    // VanyarScore the judge has left (so the participant sees score +
    // feedback next to their submission).
    const [challengesRes, eventsRes, scoresRes] = await Promise.all([
      listObjects('VanyarChallenge', { pageSize: 200 }),
      listObjects('VanyarEvent', { pageSize: 200 }),
      listObjects('VanyarScore', { pageSize: 500 }),
    ]);
    const challengeTitle = new Map(
      arr(challengesRes.data).map(flatten).map(c => [c.id, c.title ?? c.name])
    );
    const eventTitle = new Map(
      arr(eventsRes.data).map(flatten).map(e => [e.id, e.title ?? e.name])
    );
    const scoreBySubmission = new Map();
    for (const sc of arr(scoresRes.data).map(flatten)) {
      if (sc.submissionId) scoreBySubmission.set(sc.submissionId, sc);
    }

    const enriched = submissions.map(s => {
      const sub = s.submissionId ?? s.id;
      const sc = scoreBySubmission.get(sub);
      return {
        ...s,
        challengeTitle: challengeTitle.get(s.challengeId) ?? s.challengeTitle,
        eventTitle: eventTitle.get(s.eventId) ?? s.eventTitle,
        score: sc?.value ?? null,
        feedback: sc?.feedback ?? null,
        status: sc ? 'SCORED' : (s.status ?? 'SUBMITTED'),
      };
    });
    ok(res, enriched);
  } catch (e) { fail(res, e); }
});

// ── /api/users/:id/enrolled-events ────────────────────────────────────────────
// Returns a flat list of eventIds the user has a VanyarEnrolment for. Used by
// the participant Events list to render "Registered ✓" vs "Enrol" per row.

app.get('/api/users/:id/enrolled-events', requireAuth, async (req, res) => {
  if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Can only view your own enrolments' });
  }
  if (MOCK_MODE) return ok(res, []);
  try {
    const result = await searchObjects('VanyarEnrolment', {
      where: { type: 'eq', field: 'userId', value: req.params.id },
      pageSize: 500,
    });
    const ids = [...new Set(arr(result.data).map(flatten).map(e => e.eventId).filter(Boolean))];
    ok(res, ids);
  } catch (e) { fail(res, e); }
});

// ── /api/users/:id/completed-modules ──────────────────────────────────────────
// Returns a flat list of moduleIds the user has completed. Used by the module
// viewer to render the ✓ tick on previously completed modules.

app.get('/api/users/:id/completed-modules', requireAuth, async (req, res) => {
  if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Can only view your own progress' });
  }
  if (MOCK_MODE) return ok(res, []);
  try {
    const result = await searchObjects('VanyarProgress', {
      where: { type: 'eq', field: 'userId', value: req.params.id },
      pageSize: 500,
    });
    const ids = [...new Set(arr(result.data).map(flatten).map(p => p.moduleId).filter(Boolean))];
    ok(res, ids);
  } catch (e) { fail(res, e); }
});

// ── /api/users/:id/progress ───────────────────────────────────────────────────
// Aggregates VanyarProgress by track so the dashboard can show per-track bars.

app.get('/api/users/:id/progress', requireAuth, async (req, res) => {
  if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Can only view your own progress' });
  }
  if (MOCK_MODE) return ok(res, []);
  try {
    // 1. All progress records for this user (one per completed module).
    const progressResult = await searchObjects('VanyarProgress', {
      where: { type: 'eq', field: 'userId', value: req.params.id },
      pageSize: 200,
    });
    const progress = arr(progressResult.data).map(flatten);

    // 2. All tracks the portal knows about; we'll join client-side.
    const tracksResult = await listObjects('VanyarTrack', { pageSize: 100 });
    const tracks = arr(tracksResult.data).map(flatten);

    // 3. Module counts per track, so we can compute percentage complete.
    const modulesResult = await listObjects('VanyarTrainingModule', { pageSize: 500 });
    const modules = arr(modulesResult.data).map(flatten);
    const totalPerTrack = modules.reduce((acc, m) => {
      acc[m.trackId] = (acc[m.trackId] ?? 0) + 1;
      return acc;
    }, {});

    // 4. Count DISTINCT completed modules per track. Firing complete-module
    // twice for the same module produces duplicate VanyarProgress rows; raw
    // counting shows "7/4". Group by (trackId, moduleId) before counting.
    const moduleToTrack = Object.fromEntries(modules.map(m => [m.id, m.trackId]));
    const seenPerTrack = {};
    for (const p of progress) {
      const trackId = moduleToTrack[p.moduleId];
      if (!trackId) continue;
      (seenPerTrack[trackId] ??= new Set()).add(p.moduleId);
    }
    const completedPerTrack = Object.fromEntries(
      Object.entries(seenPerTrack).map(([t, set]) => [t, set.size])
    );

    // 5. Return every track with this user's real completion count.
    // Tracks the user hasn't touched show 0/N — still visible so the
    // dashboard doubles as a "tracks I can start" picker. No ontology-level
    // enrolment object exists for tracks (VanyarEnrolment is event-only), so
    // this is the honest answer without a schema change.
    const all = tracks.map(t => {
      const completed = completedPerTrack[t.id] ?? 0;
      const total = totalPerTrack[t.id] ?? t.moduleCount ?? 0;
      return {
        ...t,
        id: t.id,
        title: t.name ?? t.title,
        completed,
        modules: total,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        started: completed > 0,
      };
    });
    // Sort: in-progress tracks first, then untouched.
    all.sort((a, b) => Number(b.started) - Number(a.started) || b.progress - a.progress);
    ok(res, all);
  } catch (e) { fail(res, e); }
});

// ── /api/organisations ────────────────────────────────────────────────────────

app.get('/api/organisations', async (req, res) => {
  try {
    const result = await listObjects('VanyarOrganisation', { pageSize: 50, orderBy: 'name ASC' });
    ok(res, arr(result.data).map(flatten));
  } catch (e) { fail(res, e); }
});

// ── start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[vanyar] backend running  → http://localhost:${PORT}`);
  if (MOCK_MODE) {
    console.log('[vanyar] MOCK MODE — returning sample data, no Foundry credentials needed');
  } else {
    console.log(`[vanyar] Foundry         → ${process.env.FOUNDRY_URL}`);
    console.log(`[vanyar] Ontology RID    → ${process.env.ONTOLOGY_RID}`);
    console.log(`[vanyar] Client ID       → ${process.env.CLIENT_ID ? '✓ set' : '✗ missing'}`);
    console.log(`[vanyar] Client Secret   → ${process.env.CLIENT_SECRET ? '✓ set' : '✗ missing'}`);
  }
});
