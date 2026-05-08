import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import KPI from '../../components/KPI.jsx';
import Badge from '../../components/Badge.jsx';
import MiniChart from '../../components/MiniChart.jsx';
import { Table, THead, TBody, TR, TH, TD } from '../../components/Table.jsx';

const MOCK_SCORED = [
  { participant: 'Arjun Mehta',   challenge: 'EDA Challenge',    event: 'DataFest 2025', score: 87, date: '2025-04-18', feedback: true },
  { participant: 'Vikram Singh',   challenge: 'EDA Challenge',    event: 'DataFest 2025', score: 72, date: '2025-04-18', feedback: true },
  { participant: 'Sneha Reddy',    challenge: 'Prediction Model', event: 'DataFest 2025', score: 94, date: '2025-04-17', feedback: true },
  { participant: 'Aditya Kumar',   challenge: 'Prediction Model', event: 'DataFest 2025', score: 68, date: '2025-04-17', feedback: true },
  { participant: 'Riya Patel',     challenge: 'EDA Challenge',    event: 'DataFest 2025', score: 91, date: '2025-04-19', feedback: true },
  { participant: 'Kiran Bose',     challenge: 'EDA Challenge',    event: 'ML Sprint',    score: 79, date: '2025-04-10', feedback: false },
  { participant: 'Dev Joshi',      challenge: 'Viz Challenge',    event: 'ML Sprint',    score: 85, date: '2025-04-11', feedback: true },
];

const DIST_DATA = [
  { label: '0-20',  value: 0 },
  { label: '21-40', value: 1 },
  { label: '41-60', value: 0 },
  { label: '61-80', value: 3 },
  { label: '81-100', value: 3 },
];

export default function JudgeHistory() {
  const avgScore = (MOCK_SCORED.reduce((s, r) => s + r.score, 0) / MOCK_SCORED.length).toFixed(1);

  return (
    <div>
      <PageHeader title="Scoring History" subtitle="All submissions you have scored" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <KPI label="Total Scored"   value={MOCK_SCORED.length}  accent="copper" />
        <KPI label="Avg Score Given"value={avgScore}            accent="amber" subtitle="/100" />
        <KPI label="Events Covered" value={new Set(MOCK_SCORED.map(s => s.event)).size} accent="violet" />
        <KPI label="Feedback Rate"  value={`${Math.round(MOCK_SCORED.filter(s => s.feedback).length / MOCK_SCORED.length * 100)}%`} accent="success" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>
        <Card padding="0">
          <Table>
            <THead>
              <TR>
                <TH>Participant</TH>
                <TH>Challenge</TH>
                <TH>Event</TH>
                <TH>Date</TH>
                <TH>Score</TH>
                <TH>Feedback</TH>
              </TR>
            </THead>
            <TBody>
              {MOCK_SCORED.map((row, i) => (
                <TR key={i}>
                  <TD style={{ fontWeight: 500 }}>{row.participant}</TD>
                  <TD style={{ color: 'var(--gl)', fontSize: '0.85em' }}>{row.challenge}</TD>
                  <TD style={{ color: 'var(--gl)', fontSize: '0.85em' }}>{row.event}</TD>
                  <TD style={{ color: 'var(--gl)', fontSize: '0.82em' }}>{row.date}</TD>
                  <TD>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: row.score >= 80 ? 'var(--success)' : row.score >= 60 ? 'var(--amber)' : 'var(--danger)',
                        fontWeight: 600,
                      }}
                    >
                      {row.score}
                    </span>
                  </TD>
                  <TD>
                    {row.feedback
                      ? <Badge variant="success">Given</Badge>
                      : <Badge variant="muted">None</Badge>
                    }
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>

        <Card>
          <div style={{ marginBottom: 20 }}>
            <MiniChart data={DIST_DATA} color="copper" label="Score Distribution" height={80} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72em', color: 'var(--gm)' }}>
              {DIST_DATA.map(d => <span key={d.label}>{d.label}</span>)}
            </div>
          </div>

          <div style={{ fontSize: '0.78em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
            By Event
          </div>
          {Array.from(new Set(MOCK_SCORED.map(s => s.event))).map(ev => {
            const rows = MOCK_SCORED.filter(s => s.event === ev);
            const avg = (rows.reduce((s, r) => s + r.score, 0) / rows.length).toFixed(0);
            return (
              <div key={ev} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85em' }}>
                <span style={{ color: 'var(--gp)' }}>{ev}</span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: 'var(--gl)' }}>{rows.length} scored</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--copper)' }}>avg {avg}</span>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
