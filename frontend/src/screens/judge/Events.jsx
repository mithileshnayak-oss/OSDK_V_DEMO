import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import LoadState from '../../components/LoadState.jsx';

const STATUS_VARIANT = { ACTIVE: 'amber', PUBLISHED: 'copper', COMPLETED: 'muted' };

const MOCK_PENDING = { 1: 14, 2: 7, 3: 0 };

export default function JudgeEvents({ onNavWithCtx }) {
  const { data: events, loading, error } = useApi(() => api.events());

  const assignedEvents = (events || []).filter(e => e.status === 'ACTIVE' || e.status === 'COMPLETED');

  return (
    <div>
      <PageHeader title="Assigned Events" subtitle="Events where you are a judge" />

      <LoadState loading={loading} error={error}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {assignedEvents.map((ev, idx) => {
            const pending = MOCK_PENDING[idx] ?? Math.floor(Math.random() * 20);
            return (
              <Card key={ev.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontWeight: 500, fontSize: '1em' }}>{ev.title}</span>
                    <Badge variant={STATUS_VARIANT[ev.status]}>{ev.status}</Badge>
                    {pending > 0 && (
                      <Badge variant="danger">{pending} pending</Badge>
                    )}
                    {pending === 0 && (
                      <Badge variant="success">All scored</Badge>
                    )}
                  </div>
                  {ev.description && (
                    <p style={{ color: 'var(--gl)', fontSize: '0.82em', lineHeight: 1.5, marginBottom: 8 }}>
                      {ev.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 20, fontSize: '0.78em', color: 'var(--gm)' }}>
                    {ev.endDate && <span>Deadline: <span style={{ color: 'var(--gp)' }}>{new Date(ev.endDate).toLocaleDateString()}</span></span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  {pending > 0 ? (
                    <Button onClick={() => onNavWithCtx?.('judge-queue', { eventId: ev.id, eventTitle: ev.title })}>
                      Score ({pending})
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => onNavWithCtx?.('judge-history', { eventId: ev.id })}>
                      History
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
          {!assignedEvents.length && !loading && (
            <div style={{ textAlign: 'center', color: 'var(--gl)', padding: 48 }}>
              No events assigned yet
            </div>
          )}
        </div>
      </LoadState>
    </div>
  );
}
