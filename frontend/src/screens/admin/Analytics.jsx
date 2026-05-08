import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import KPI from '../../components/KPI.jsx';
import MiniChart from '../../components/MiniChart.jsx';
import LoadState from '../../components/LoadState.jsx';

const ENROLMENT_DATA  = [8, 15, 22, 19, 34, 28, 41, 38, 52, 47, 60, 55].map((v, i) => ({ value: v, label: `W${i + 1}` }));
const SUBMISSION_DATA = [4, 9, 18, 12, 27, 22, 35, 31, 44, 40, 53, 48].map((v, i) => ({ value: v, label: `W${i + 1}` }));
const SCORE_DATA      = [72, 68, 75, 71, 79, 74, 82, 78, 85, 81, 87, 84].map((v, i) => ({ value: v, label: `W${i + 1}` }));

export default function Analytics() {
  const { data: stats, loading, error } = useApi(() => api.stats());

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Platform performance and engagement metrics" />

      <LoadState loading={loading} error={error}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 28 }}>
          <KPI label="Total Users"      value={stats?.totalUsers    ?? '—'} accent="copper" />
          <KPI label="Active Events"    value={stats?.activeEvents  ?? '—'} accent="amber"  />
          <KPI label="Total Submissions"value={stats?.submissions   ?? '—'} accent="violet" />
          <KPI label="Avg Score"        value={stats?.avgScore      ? `${stats.avgScore}` : '—'} subtitle="/100" accent="success" />
          <KPI label="Tracks"           value={stats?.tracks        ?? '—'} accent="copper" />
          <KPI label="Orgs"             value={stats?.organisations ?? '—'} accent="amber"  />
        </div>
      </LoadState>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        <Card>
          <MiniChart data={ENROLMENT_DATA} color="copper" label="Enrolments (12 weeks)" height={100} />
        </Card>
        <Card>
          <MiniChart data={SUBMISSION_DATA} color="amber" label="Submissions (12 weeks)" height={100} />
        </Card>
        <Card>
          <MiniChart data={SCORE_DATA} color="success" label="Avg Score (12 weeks)" height={100} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card>
          <div style={{ fontSize: '0.78em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
            Score Distribution
          </div>
          <MiniChart
            data={[
              { label: '0-20',  value: 4  },
              { label: '21-40', value: 8  },
              { label: '41-60', value: 14 },
              { label: '61-80', value: 38 },
              { label: '81-100',value: 36 },
            ]}
            color="violet"
            height={80}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72em', color: 'var(--gm)' }}>
            {['0-20', '21-40', '41-60', '61-80', '81-100'].map(l => <span key={l}>{l}</span>)}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '0.78em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
            Platform Summary
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Avg sessions / user', value: '3.2 / week', color: 'var(--copper)' },
              { label: 'Module completion rate', value: '68%', color: 'var(--amber)' },
              { label: 'Submission acceptance', value: '91%', color: 'var(--success)' },
              { label: 'Top scorer avg',  value: '94.7', color: 'var(--violet)' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--gl)', fontSize: '0.85em' }}>{row.label}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: row.color, fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
