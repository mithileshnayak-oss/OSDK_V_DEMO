import { useState } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import LoadState from '../../components/LoadState.jsx';

const STATUS_VARIANT = { ACTIVE: 'amber', PUBLISHED: 'copper', COMPLETED: 'muted', DRAFT: 'muted' };
const FILTERS = ['ALL', 'ACTIVE', 'PUBLISHED', 'COMPLETED'];

export default function Events({ onNavWithCtx, user }) {
  const [filter, setFilter] = useState('ALL');
  const { data: events, loading, error } = useApi(() => api.events());
  const { data: enrolledIds, refetch: refetchEnrolments } = useApi(
    () => user?.userId ? api.userEnrolledEvents(user.userId) : Promise.resolve([]),
    [user?.userId]
  );
  const [enrolling, setEnrolling] = useState(null);
  const [optimistic, setOptimistic] = useState(new Set());

  const enrolled = new Set([...(enrolledIds ?? []), ...optimistic]);
  const filtered = (events || []).filter(e => filter === 'ALL' || e.status === filter);

  const handleEnrol = async (eventId) => {
    setEnrolling(eventId);
    try {
      await api.enrolEvent(eventId);
      setOptimistic(prev => new Set([...prev, eventId]));
      refetchEnrolments?.();
    } catch (e) {
      alert(`Failed to register: ${e.message}`);
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div>
      <PageHeader title="Events" subtitle="Hackathons and competitions you can participate in" />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              background: filter === f ? 'rgba(184,115,51,0.15)' : 'transparent',
              border: `1px solid ${filter === f ? 'rgba(184,115,51,0.4)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 6,
              color: filter === f ? 'var(--copper)' : 'var(--gl)',
              cursor: 'pointer',
              fontSize: '0.8em',
              fontFamily: "'DM Mono', monospace",
              transition: 'all 0.15s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <LoadState loading={loading} error={error}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(ev => (
            <Card key={ev.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: '0.98em' }}>{ev.title}</span>
                  <Badge variant={STATUS_VARIANT[ev.status] || 'muted'}>{ev.status}</Badge>
                </div>
                {ev.description && (
                  <p style={{ color: 'var(--gl)', fontSize: '0.82em', lineHeight: 1.5, marginBottom: 10 }}>
                    {ev.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 20, fontSize: '0.78em', color: 'var(--gm)' }}>
                  {ev.startDate && <span>Start: <span style={{ color: 'var(--gp)' }}>{new Date(ev.startDate).toLocaleDateString()}</span></span>}
                  {ev.endDate && <span>End: <span style={{ color: 'var(--gp)' }}>{new Date(ev.endDate).toLocaleDateString()}</span></span>}
                  {ev.teamSize && <span>Team: <span style={{ color: 'var(--gp)' }}>up to {ev.teamSize}</span></span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={() => onNavWithCtx?.('event-detail', { eventId: ev.id, eventTitle: ev.title })}
                >
                  View Details
                </Button>
                {ev.status !== 'COMPLETED' && (
                  enrolled.has(ev.id) ? (
                    <Badge variant="success">✓ Registered</Badge>
                  ) : (
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={enrolling === ev.id}
                      onClick={() => handleEnrol(ev.id)}
                    >
                      {enrolling === ev.id ? 'Registering…' : 'Enrol'}
                    </Button>
                  )
                )}
                {ev.status === 'ACTIVE' && enrolled.has(ev.id) && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => onNavWithCtx?.('submission', { eventId: ev.id, eventTitle: ev.title })}
                  >
                    Submit
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {filtered.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: 'var(--gl)', padding: 48 }}>
              No events with status "{filter}"
            </div>
          )}
        </div>
      </LoadState>
    </div>
  );
}
