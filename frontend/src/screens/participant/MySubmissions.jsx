import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import LoadState from '../../components/LoadState.jsx';
import { Table, THead, TBody, TR, TH, TD } from '../../components/Table.jsx';

const STATUS_VARIANT = {
  SCORED: 'success',
  PENDING: 'amber',
  REJECTED: 'danger',
  SUBMITTED: 'copper',
};

export default function MySubmissions({ user }) {
  const { data: submissions, loading, error } = useApi(
    () => user?.userId ? api.userSubmissions(user.userId, 50) : api.submissions(50),
    [user?.userId]
  );

  return (
    <div>
      <PageHeader title="My Submissions" subtitle="All your challenge submissions and their status" />
      <LoadState loading={loading} error={error}>
        <Card padding="0">
          <Table>
            <THead>
              <TR>
                <TH>#</TH>
                <TH>Challenge</TH>
                <TH>Event</TH>
                <TH>Submitted</TH>
                <TH>Score</TH>
                <TH>Status</TH>
                <TH>Feedback</TH>
              </TR>
            </THead>
            <TBody>
              {(submissions || []).map((s, i) => (
                <TR key={s.id || i}>
                  <TD style={{ color: 'var(--gm)', fontSize: '0.82em' }}>{i + 1}</TD>
                  <TD style={{ fontWeight: 500 }}>{s.challengeTitle || s.challenge || '—'}</TD>
                  <TD style={{ color: 'var(--gl)', fontSize: '0.85em' }}>{s.eventTitle || s.event || '—'}</TD>
                  <TD style={{ color: 'var(--gl)', fontSize: '0.82em', whiteSpace: 'nowrap' }}>
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : s.date || '—'}
                  </TD>
                  <TD>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--copper)' }}>
                      {s.score !== null && s.score !== undefined ? `${s.score}/100` : '—'}
                    </span>
                  </TD>
                  <TD>
                    <Badge variant={STATUS_VARIANT[s.status] || 'muted'}>{s.status || 'SUBMITTED'}</Badge>
                  </TD>
                  <TD style={{ color: 'var(--gl)', fontSize: '0.82em', maxWidth: 360, lineHeight: 1.4 }}>
                    {s.feedback || <span style={{ opacity: 0.4 }}>—</span>}
                  </TD>
                </TR>
              ))}
              {!submissions?.length && (
                <TR>
                  <TD style={{ textAlign: 'center', color: 'var(--gl)', padding: '32px 0' }} colSpan="7">
                    No submissions yet
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
        </Card>
      </LoadState>
    </div>
  );
}
