// ============================================================
// Vanyar API Client
// OSDK integration point — replace fetch calls with OSDK client when ready
//
// import { createClient } from '@osdk/client';
// import { $ontologyRid } from './ontology/index.js';
// const client = createClient('https://your-foundry-stack.com', $ontologyRid, () => token);
// ============================================================

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token is stored in memory (not localStorage) for XSS safety
let _token = null;

export function setToken(t) { _token = t; }
export function clearToken() { _token = null; }
export function getToken() { return _token; }

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const r = await fetch(BASE + path, { ...opts, headers });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  const json = await r.json();
  if (!json.ok) throw new Error(json.error || 'API error');
  return json.data;
}

async function apiDownload(path, filename) {
  const r = await fetch(BASE + path, {
    headers: _token ? { Authorization: `Bearer ${_token}` } : {},
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`${r.status} ${r.statusText}: ${text || 'download failed'}`);
  }
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const api = {
  // ── Auth ─────────────────────────────────────────────────────────────────

  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  // Dev-only: server issues a JWT for the requested role without credentials.
  demoLogin: (role) => apiFetch('/auth/demo', { method: 'POST', body: JSON.stringify({ role }) }),

  // ── Stats ─────────────────────────────────────────────────────────────────
  // OSDK: aggregate VanyarUser, Event, Track, Submission counts
  stats: () => apiFetch('/stats'),

  // Per-user KPIs for the participant dashboard. Requires auth.
  myStats: () => apiFetch('/stats/me'),

  // ── Events ────────────────────────────────────────────────────────────────
  // OSDK: client.objectSet(Event).where(f => status ? f.status.eq(status) : true).fetchAll()
  events: (status) => apiFetch('/events' + (status ? `?status=${status}` : '')),

  // OSDK: client.objectSet(Event).where(f => f.id.eq(id)).fetchOne()
  event: (id) => apiFetch(`/events/${id}`),

  // OSDK: client.actions.createEvent(body)
  createEvent: (body) => apiFetch('/events', { method: 'POST', body: JSON.stringify(body) }),

  // OSDK: client.actions.publishEvent({ event: id })
  publishEvent: (id) => apiFetch(`/events/${id}/publish`, { method: 'POST' }),

  // Unhide the event's leaderboard for participants. Admin or org manager only.
  publishResults:   (id) => apiFetch(`/events/${id}/publish-results`, { method: 'POST' }),
  unpublishResults: (id) => apiFetch(`/events/${id}/publish-results`, { method: 'DELETE' }),
  resultsStatus:    (id) => apiFetch(`/events/${id}/results-status`),

  // OSDK: client.actions.registerForEvent({ user, event: id })
  enrolEvent: (id) => apiFetch(`/events/${id}/enrol`, { method: 'POST' }),

  // OSDK: client.objectSet(Challenge).where(f => f.eventId.eq(id)).fetchAll()
  eventChallenges: (id) => apiFetch(`/events/${id}/challenges`),

  // OSDK: client.objectSet(LeaderboardEntry).where(f => f.eventId.eq(id)).orderBy(f => f.rank.asc()).take(limit)
  eventLeaderboard: (id, limit = 20) => apiFetch(`/events/${id}/leaderboard?limit=${limit}`),

  // OSDK: client.objectSet(Team).where(f => f.eventId.eq(id)).fetchAll()
  eventTeams: (id) => apiFetch(`/events/${id}/teams`),

  // ── Leaderboard ───────────────────────────────────────────────────────────
  // OSDK: client.objectSet(LeaderboardEntry).orderBy(f => f.totalScore.desc()).take(limit)
  leaderboard: (limit = 10) => apiFetch(`/leaderboard?limit=${limit}`),

  // ── Tracks & Modules ──────────────────────────────────────────────────────
  // OSDK: client.objectSet(Track).fetchAll()
  tracks: () => apiFetch('/tracks'),

  // OSDK: client.objectSet(TrainingModule).where(f => f.trackId.eq(id)).orderBy(f => f.sortOrder.asc()).fetchAll()
  trackModules: (id) => apiFetch(`/tracks/${id}/modules`),

  // OSDK: client.actions.completeModule({ user, module: id })
  completeModule: (id) => apiFetch(`/modules/${id}/complete`, { method: 'POST' }),

  // ── Submissions ───────────────────────────────────────────────────────────
  // OSDK: client.objectSet(Submission).orderBy(f => f.submittedAt.desc()).take(limit)
  submissions: (limit = 20) => apiFetch(`/submissions?limit=${limit}`),

  // Judge-scoped: unscored submissions, enriched with participant + challenge names.
  pendingSubmissions: (eventId) =>
    apiFetch('/submissions/pending' + (eventId ? `?eventId=${eventId}` : '')),

  // OSDK: client.actions.submitSolution(body)
  submit: (body) => apiFetch('/submissions', { method: 'POST', body: JSON.stringify(body) }),

  // ── Scores ────────────────────────────────────────────────────────────────
  // OSDK: client.actions.scoreSubmission(body)
  score: (body) => apiFetch('/scores', { method: 'POST', body: JSON.stringify(body) }),

  // ── Users & Orgs ──────────────────────────────────────────────────────────
  // OSDK: client.objectSet(VanyarUser).where(f => f.id.eq(id)).fetchOne()
  user: (id) => apiFetch(`/users/${id}`),

  // OSDK: client.objectSet(VanyarUser).fetchAll()
  users: () => apiFetch('/users'),

  // OSDK: client.actions.deleteVanyarUser({ vanyarUser: id })
  deleteUser: (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }),

  // OSDK: client.objectSet(Organisation).fetchAll()
  organisations: () => apiFetch('/organisations'),

  // ── Per-user scoped queries ───────────────────────────────────────────────
  // OSDK: client.objectSet(Submission).where(f => f.userId.eq(userId)).fetchAll()
  userSubmissions: (userId, limit = 20) => apiFetch(`/users/${userId}/submissions?limit=${limit}`),

  // OSDK: joins VanyarProgress + VanyarTrack + VanyarTrainingModule for this user
  userProgress: (userId) => apiFetch(`/users/${userId}/progress`),

  // Flat list of moduleIds the user has completed.
  userCompletedModules: (userId) => apiFetch(`/users/${userId}/completed-modules`),

  // Flat list of eventIds the user is enrolled in.
  userEnrolledEvents: (userId) => apiFetch(`/users/${userId}/enrolled-events`),

  // Triggers a browser download for the challenge's starter dataset.
  downloadChallengeDataset: (challengeId, filename) =>
    apiDownload(`/challenges/${challengeId}/dataset`, filename),

  // Track enrollment — creates VanyarProgress stub via register-for-track action
  registerForTrack: (trackId) => apiFetch(`/tracks/${trackId}/register`, { method: 'POST' }),
};
