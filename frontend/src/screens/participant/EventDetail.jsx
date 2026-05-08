import { useState } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import LoadState from '../../components/LoadState.jsx';
import { Table, THead, TBody, TR, TH, TD } from '../../components/Table.jsx';

const STATUS_VARIANT = { ACTIVE: 'amber', PUBLISHED: 'copper', COMPLETED: 'muted' };

export default function EventDetail({ eventId, eventTitle, onNavWithCtx, onNav, user }) {
  const [enrolling, setEnrolling] = useState(false);
  const [optimisticEnrolled, setOptimisticEnrolled] = useState(false);
  const [enrolError, setEnrolError] = useState(null);
  const { data: enrolledIds } = useApi(
    () => user?.userId ? api.userEnrolledEvents(user.userId) : Promise.resolve([]),
    [user?.userId]
  );
  const enrolled = optimisticEnrolled || (enrolledIds ?? []).includes(eventId);

  const handleEnrol = async () => {
    setEnrolling(true);
    setEnrolError(null);
    try {
      await api.enrolEvent(eventId);
      setOptimisticEnrolled(true);
    } catch (e) {
      setEnrolError(e.message || 'Failed to register');
    } finally {
      setEnrolling(false);
    }
  };

  const { data: event, loading: loadingEv, error: errEv } = useApi(
    () => eventId ? api.event(eventId) : Promise.resolve(null),
    [eventId]
  );
  const { data: challenges, loading: loadingCh, error: errCh } = useApi(
    () => eventId ? api.eventChallenges(eventId) : Promise.resolve([]),
    [eventId]
  );
  const { data: lbRaw } = useApi(
    () => eventId ? api.eventLeaderboard(eventId, 5) : Promise.resolve({ entries: [], hidden: false }),
    [eventId]
  );
  const leaderboard = lbRaw?.entries ?? [];
  const lbHidden = lbRaw?.hidden === true;

  const ev = event || {};
  const chs = challenges || [];

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <button
          onClick={() => onNav('events')}
          style={{ background: 'none', border: 'none', color: 'var(--copper)', cursor: 'pointer', fontSize: '0.82em' }}
        >
          ← Back to Events
        </button>
      </div>

      <LoadState loading={loadingEv} error={errEv}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: '2.2em', letterSpacing: '0.08em' }}>
              {ev.title || eventTitle}
            </h1>
            {ev.status && <Badge variant={STATUS_VARIANT[ev.status]}>{ev.status}</Badge>}
          </div>
          {ev.description && (
            <p style={{ color: 'var(--gl)', fontSize: '0.88em', lineHeight: 1.6, maxWidth: 640 }}>{ev.description}</p>
          )}
          <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: '0.8em', color: 'var(--gm)' }}>
            {ev.startDate && <span>Starts: <span style={{ color: 'var(--gp)' }}>{new Date(ev.startDate).toLocaleDateString()}</span></span>}
            {ev.endDate && <span>Ends: <span style={{ color: 'var(--gp)' }}>{new Date(ev.endDate).toLocaleDateString()}</span></span>}
            {ev.teamSize && <span>Max team: <span style={{ color: 'var(--gp)' }}>{ev.teamSize}</span></span>}
          </div>

          {ev.status && ev.status !== 'COMPLETED' && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button
                disabled={enrolling || enrolled}
                onClick={handleEnrol}
              >
                {enrolled ? '✓ Registered' : enrolling ? 'Registering…' : 'Register for event'}
              </Button>
              {enrolError && (
                <span style={{ color: 'var(--danger)', fontSize: '0.82em' }}>{enrolError}</span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Challenges */}
          <div>
            <div style={{ fontSize: '0.78em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
              Challenges
            </div>
            <LoadState loading={loadingCh} error={errCh}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chs.map(ch => (
                  <Card key={ch.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{ch.title}</div>
                        {ch.description && (
                          <p style={{ color: 'var(--gl)', fontSize: '0.82em', lineHeight: 1.5 }}>{ch.description}</p>
                        )}
                      </div>
                      {ch.points && (
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--amber)', fontSize: '0.9em', flexShrink: 0 }}>
                          {ch.points} pts
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {ch.datasetRef && ch.datasetRef !== '—' && (
                        <Button
                          size="small"
                          variant="ghost"
                          onClick={() => api.downloadChallengeDataset(ch.id, ch.datasetRef.split('/').pop())
                            .catch(e => alert(`Download failed: ${e.message}`))}
                        >
                          ⬇ Download Dataset
                        </Button>
                      )}
                      <Button
                        size="small"
                        onClick={() => onNavWithCtx?.('submission', { eventId, eventTitle, challengeId: ch.id, challengeTitle: ch.title })}
                      >
                        Submit Solution
                      </Button>
                    </div>
                  </Card>
                ))}
                {chs.length === 0 && (
                  <div style={{ color: 'var(--gl)', padding: 24, textAlign: 'center' }}>No challenges yet</div>
                )}
              </div>
            </LoadState>
          </div>

          {/* Mini leaderboard */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: '0.78em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Leaderboard</div>
              <button
                onClick={() => onNavWithCtx?.('leaderboard', { eventId, eventTitle })}
                style={{ background: 'none', border: 'none', color: 'var(--copper)', fontSize: '0.78em', cursor: 'pointer' }}
              >
                Full →
              </button>
            </div>
            {lbHidden ? (
              <Card style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ fontSize: '1.4em', marginBottom: 6 }}>🔒</div>
                <div style={{ color: 'var(--gl)', fontSize: '0.82em' }}>
                  Hidden until results published
                </div>
              </Card>
            ) : <Card padding="0">
              <Table>
                <THead>
                  <TR><TH>#</TH><TH>Name</TH><TH>Score</TH></TR>
                </THead>
                <TBody>
                  {(leaderboard || []).slice(0, 5).map((row, i) => (
                    <TR key={i}>
                      <TD style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--gm)' }}>
                        {i + 1}
                      </TD>
                      <TD style={{ fontSize: '0.85em' }}>{row.userName || row.name || '—'}</TD>
                      <TD style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--copper)' }}>
                        {row.score ?? '—'}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </Card>}
          </div>
        </div>
      </LoadState>
    </div>
  );
}
