import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import KPI from '../../components/KPI.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import LoadState from '../../components/LoadState.jsx';
import { Table, THead, TBody, TR, TH, TD } from '../../components/Table.jsx';

function statusVariant(s) {
  return s === 'SCORED' ? 'success' : s === 'PENDING' ? 'amber' : 'muted';
}

export default function Dashboard({ onNav, user }) {
  const { data: stats, loading, error } = useApi(() => api.myStats());
  const { data: events } = useApi(() => api.events('ACTIVE'));
  const { data: mySubmissions } = useApi(
    () => user?.userId ? api.userSubmissions(user.userId, 5) : Promise.resolve([]),
    [user?.userId]
  );
  const { data: myTracks } = useApi(
    () => user?.userId ? api.userProgress(user.userId) : Promise.resolve([]),
    [user?.userId]
  );

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back — your training overview" />

      <LoadState loading={loading} error={error}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 28 }}>
          <KPI label="Active Events"     value={stats?.activeEvents    ?? '—'} accent="amber"  icon="◎" />
          <KPI label="Modules Completed" value={stats?.modulesCompleted ?? '—'} accent="copper" icon="◈" />
          <KPI label="Submissions"       value={stats?.submissions      ?? '—'} accent="violet" icon="◻" />
          <KPI label="Avg Score"         value={stats?.avgScore         ? `${stats.avgScore}` : '—'} subtitle="/ 100" accent="success" icon="◆" />
        </div>
      </LoadState>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Active Events */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: '0.8em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Active Events</div>
            <button onClick={() => onNav('events')} style={{ background: 'none', border: 'none', color: 'var(--copper)', fontSize: '0.78em', cursor: 'pointer' }}>View all →</button>
          </div>
          {events?.length ? events.slice(0, 3).map(ev => (
            <div key={ev.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.88em', fontWeight: 500 }}>{ev.title}</span>
                <Badge variant="amber">ACTIVE</Badge>
              </div>
              <div style={{ color: 'var(--gl)', fontSize: '0.78em' }}>
                Ends {ev.endDate ? new Date(ev.endDate).toLocaleDateString() : 'TBD'}
              </div>
            </div>
          )) : (
            <div style={{ color: 'var(--gl)', fontSize: '0.85em', padding: '12px 0' }}>No active events</div>
          )}
        </Card>

        {/* Enrolled Tracks */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: '0.8em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>My Tracks</div>
            <button onClick={() => onNav('training')} style={{ background: 'none', border: 'none', color: 'var(--copper)', fontSize: '0.78em', cursor: 'pointer' }}>View all →</button>
          </div>
          {myTracks?.length ? myTracks.slice(0, 3).map(t => (
            <div key={t.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.85em' }}>{t.title}</span>
                <span style={{ fontSize: '0.78em', color: 'var(--gl)' }}>{t.completed}/{t.modules}</span>
              </div>
              <ProgressBar value={t.progress} showPct />
            </div>
          )) : (
            <div style={{ color: 'var(--gl)', fontSize: '0.85em', padding: '12px 0' }}>
              No tracks available. Visit Training to browse the catalogue.
            </div>
          )}
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card padding="0">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Recent Submissions</div>
          <button onClick={() => onNav('my-submissions')} style={{ background: 'none', border: 'none', color: 'var(--copper)', fontSize: '0.78em', cursor: 'pointer' }}>View all →</button>
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Challenge</TH>
              <TH>Event</TH>
              <TH>Date</TH>
              <TH>Score</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {mySubmissions?.length ? mySubmissions.map(s => (
              <TR key={s.id}>
                <TD>{s.challengeTitle ?? s.challengeId ?? '—'}</TD>
                <TD style={{ color: 'var(--gl)' }}>{s.eventTitle ?? s.eventId ?? '—'}</TD>
                <TD style={{ color: 'var(--gl)', fontSize: '0.85em' }}>
                  {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}
                </TD>
                <TD style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--copper)' }}>
                  {s.score != null ? s.score : '—'}
                </TD>
                <TD><Badge variant={statusVariant(s.status)}>{s.status ?? 'PENDING'}</Badge></TD>
              </TR>
            )) : (
              <TR>
                <TD colSpan={5} style={{ color: 'var(--gl)', textAlign: 'center', padding: 24 }}>
                  No submissions yet.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
