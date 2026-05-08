import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import KPI from '../../components/KPI.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import LoadState from '../../components/LoadState.jsx';
import MiniChart from '../../components/MiniChart.jsx';
import { Table, THead, TBody, TR, TH, TD } from '../../components/Table.jsx';

const STATUS_VARIANT = { ACTIVE: 'amber', PUBLISHED: 'copper', COMPLETED: 'muted', DRAFT: 'muted' };

export default function AdminDashboard({ onNav, onNavWithCtx }) {
  const { data: stats, loading, error } = useApi(() => api.stats());
  const { data: events } = useApi(() => api.events());

  const chartData = [12, 28, 19, 34, 41, 38, 52, 47, 61, 55, 70, 64].map((v, i) => ({ value: v, label: `W${i + 1}` }));

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform overview and quick actions"
        action={<Button onClick={() => onNav('admin-events')}>+ Create Event</Button>}
      />

      <LoadState loading={loading} error={error}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 28 }}>
          <KPI label="Total Users"     value={stats?.totalUsers    ?? '—'} accent="copper" />
          <KPI label="Active Events"   value={stats?.activeEvents  ?? '—'} accent="amber"  />
          <KPI label="Submissions"     value={stats?.submissions   ?? '—'} accent="violet" />
          <KPI label="Organisations"   value={stats?.organisations ?? '—'} accent="success" />
          <KPI label="Tracks"          value={stats?.tracks        ?? '—'} accent="copper" />
        </div>
      </LoadState>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <Card>
          <MiniChart data={chartData} color="copper" label="Submissions (12 weeks)" height={80} />
        </Card>
        <Card>
          <MiniChart data={chartData.map(d => ({ ...d, value: Math.round(d.value * 0.7) }))} color="amber" label="New Enrolments (12 weeks)" height={80} />
        </Card>
      </div>

      {/* Recent events */}
      <Card padding="0">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Recent Events</div>
          <button onClick={() => onNav('admin-events')} style={{ background: 'none', border: 'none', color: 'var(--copper)', fontSize: '0.78em', cursor: 'pointer' }}>Manage all →</button>
        </div>
        <Table>
          <THead>
            <TR><TH>Title</TH><TH>Status</TH><TH>End Date</TH><TH>Actions</TH></TR>
          </THead>
          <TBody>
            {(events || []).slice(0, 5).map(ev => (
              <TR key={ev.id}>
                <TD style={{ fontWeight: 500 }}>{ev.title}</TD>
                <TD><Badge variant={STATUS_VARIANT[ev.status]}>{ev.status}</Badge></TD>
                <TD style={{ color: 'var(--gl)', fontSize: '0.85em' }}>{ev.endDate ? new Date(ev.endDate).toLocaleDateString() : '—'}</TD>
                <TD>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => onNavWithCtx?.('event-detail', { eventId: ev.id, eventTitle: ev.title })}
                    >
                      Manage
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
