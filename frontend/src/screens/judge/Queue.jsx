import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import LoadState from '../../components/LoadState.jsx';

export default function JudgeQueue({ eventId, eventTitle }) {
  const { data: pending, loading, error, refetch } = useApi(
    () => api.pendingSubmissions(eventId),
    [eventId]
  );

  const [selectedId, setSelectedId] = useState(null);
  const [score, setScore] = useState(75);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const queue = pending || [];
  const selected = queue.find(s => s.submissionId === selectedId) || queue[0] || null;

  // When the queue loads/refreshes, keep the selection valid.
  useEffect(() => {
    if (queue.length && !queue.find(s => s.submissionId === selectedId)) {
      setSelectedId(queue[0].submissionId);
    }
  }, [queue, selectedId]);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.score({
        submissionId: selected.submissionId,
        scoreValue: score,
        feedback,
      });
      setScore(75);
      setFeedback('');
      setSelectedId(null);
      refetch?.();
    } catch (e) {
      setSubmitError(e.message || 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Scoring Queue"
        subtitle={eventTitle ? `Reviewing submissions for ${eventTitle}` : 'Review and score submissions'}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Submission list */}
        <div>
          <div style={{ fontSize: '0.78em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
            Pending ({queue.length})
          </div>
          <LoadState loading={loading} error={error}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {queue.map(sub => {
                const isSelected = selected?.submissionId === sub.submissionId;
                return (
                  <button
                    key={sub.submissionId}
                    onClick={() => setSelectedId(sub.submissionId)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 4,
                      padding: '10px 12px',
                      background: isSelected ? 'rgba(184,115,51,0.1)' : 'var(--card-bg)',
                      border: `1px solid ${isSelected ? 'rgba(184,115,51,0.35)' : 'var(--card-border)'}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85em', fontWeight: 500, color: 'var(--white)' }}>{sub.participantName}</span>
                      <Badge variant="amber" style={{ fontSize: '0.65em' }}>Pending</Badge>
                    </div>
                    <span style={{ fontSize: '0.75em', color: 'var(--gl)' }}>{sub.challengeTitle}</span>
                    <span style={{ fontSize: '0.72em', color: 'var(--gm)' }}>
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}
                    </span>
                  </button>
                );
              })}
              {!queue.length && !loading && (
                <div style={{ padding: 16, color: 'var(--gl)', fontSize: '0.85em', textAlign: 'center' }}>
                  No pending submissions
                </div>
              )}
            </div>
          </LoadState>
        </div>

        {/* Scoring form */}
        <div>
          {selected ? (
            <Card style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ fontSize: '1em', fontWeight: 500, marginBottom: 6 }}>{selected.participantName}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Badge variant="copper">{selected.challengeTitle}</Badge>
                  <span style={{ color: 'var(--gl)', fontSize: '0.8em' }}>
                    Submitted {selected.submittedAt ? new Date(selected.submittedAt).toLocaleString() : '—'}
                  </span>
                </div>
              </div>

              {/* File */}
              <div
                style={{
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.3em', opacity: 0.6 }}>📄</span>
                  <div>
                    <div style={{ fontSize: '0.88em' }}>{selected.fileName ?? '—'}</div>
                    <div style={{ fontSize: '0.75em', color: 'var(--gl)' }}>Click to preview in Foundry</div>
                  </div>
                </div>
                <Button size="small" variant="ghost">Open</Button>
              </div>

              {/* Score slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ fontSize: '0.78em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Score</label>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '1.6em',
                      color: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--amber)' : 'var(--danger)',
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {score}<span style={{ fontSize: '0.5em', color: 'var(--gl)', marginLeft: 2 }}>/100</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={score}
                  onChange={e => setScore(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: '#b87333',
                    height: 6,
                    cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72em', color: 'var(--gm)', marginTop: 4 }}>
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={5}
                  placeholder="Provide constructive feedback on approach, methodology, accuracy, and presentation…"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'var(--ch)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: 'var(--white)',
                    fontSize: '0.88em',
                    resize: 'vertical',
                    fontFamily: "'DM Mono', monospace",
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {submitError && (
                <div style={{ padding: '10px 14px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, color: 'var(--danger)', fontSize: '0.82em' }}>
                  {submitError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Score'}
                </Button>
                <Button variant="secondary">Skip</Button>
              </div>
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gl)' }}>
                All submissions scored for this event
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
