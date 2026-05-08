import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import LoadState from '../../components/LoadState.jsx';
import MiniChart from '../../components/MiniChart.jsx';
import { Table, THead, TBody, TR, TH, TD } from '../../components/Table.jsx';

const DIFF_VARIANT = { BEGINNER: 'copper', INTERMEDIATE: 'amber', ADVANCED: 'violet' };

export default function AdminTraining() {
  const { data: tracks, loading, error } = useApi(() => api.tracks());

  const completionData = (tracks || []).map(t => ({
    label: t.title?.slice(0, 10),
    value: t.completionPct ?? t.progress ?? 0,
  }));

  return (
    <div>
      <PageHeader
        title="Training"
        subtitle="Track and module administration"
        action={<Button>+ New Track</Button>}
      />

      {completionData.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <MiniChart data={completionData} color="copper" label="Average Completion % by Track" height={100} />
        </Card>
      )}

      <LoadState loading={loading} error={error}>
        <Card padding="0">
          <Table>
            <THead>
              <TR>
                <TH>Track</TH>
                <TH>Difficulty</TH>
                <TH>Modules</TH>
                <TH>Enrolled</TH>
                <TH>Completion</TH>
                <TH>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {(tracks || []).map(t => (
                <TR key={t.id}>
                  <TD>
                    <div style={{ fontWeight: 500 }}>{t.title}</div>
                    {t.category && <div style={{ color: 'var(--gl)', fontSize: '0.78em' }}>{t.category}</div>}
                  </TD>
                  <TD>
                    <Badge variant={DIFF_VARIANT[t.difficulty] || 'copper'}>
                      {t.difficulty || 'BEGINNER'}
                    </Badge>
                  </TD>
                  <TD style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--gp)' }}>
                    {t.moduleCount ?? t.modules ?? '—'}
                  </TD>
                  <TD style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--copper)' }}>
                    {t.enrolled ?? t.enrolledCount ?? '—'}
                  </TD>
                  <TD style={{ width: 160 }}>
                    <ProgressBar value={t.completionPct ?? t.progress ?? 0} showPct height={5} />
                  </TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button size="small" variant="secondary">Edit</Button>
                      <Button size="small" variant="ghost">Archive</Button>
                    </div>
                  </TD>
                </TR>
              ))}
              {!tracks?.length && !loading && (
                <TR><TD style={{ textAlign: 'center', color: 'var(--gl)', padding: '32px 0' }} colSpan="6">No tracks</TD></TR>
              )}
            </TBody>
          </Table>
        </Card>
      </LoadState>
    </div>
  );
}
