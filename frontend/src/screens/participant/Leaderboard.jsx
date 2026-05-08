import { useState } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import LoadState from '../../components/LoadState.jsx';
import { Table, THead, TBody, TR, TH, TD } from '../../components/Table.jsx';

const MEDAL = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

const YOU_ID = 'demo-user'; // In real app, comes from auth context

export default function Leaderboard({ eventId, eventTitle }) {
  const [limit, setLimit] = useState(20);

  const { data: raw, loading, error } = useApi(
    () => eventId
      ? api.eventLeaderboard(eventId, limit)
      : api.leaderboard(limit).then(entries => ({ entries, published: true, hidden: false })),
    [eventId, limit]
  );
  const board = raw?.entries ?? [];
  const hidden = raw?.hidden === true;

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        subtitle={eventTitle ? `Rankings for ${eventTitle}` : 'Global rankings across all events'}
      />

      {/* Top 3 podium */}
      {(board || []).length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32, alignItems: 'flex-end' }}>
          {[1, 0, 2].map(pos => {
            const entry = board[pos];
            if (!entry) return null;
            const isFirst = pos === 0;
            return (
              <div
                key={pos}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: '20px 24px',
                  background: 'var(--card-bg)',
                  border: `1px solid ${MEDAL_COLORS[pos]}30`,
                  borderRadius: 12,
                  minWidth: isFirst ? 160 : 130,
                  boxShadow: isFirst ? `0 0 30px ${MEDAL_COLORS[pos]}15` : 'none',
                }}
              >
                <div style={{ fontSize: isFirst ? '2.2em' : '1.8em' }}>{MEDAL[pos]}</div>
                <div style={{ fontWeight: 500, fontSize: isFirst ? '1em' : '0.9em', textAlign: 'center' }}>
                  {entry.userName || entry.name || '—'}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: MEDAL_COLORS[pos],
                    fontSize: isFirst ? '1.4em' : '1.1em',
                    fontWeight: 700,
                  }}
                >
                  {entry.score}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LoadState loading={loading} error={error}>
        {hidden && (
          <Card style={{ textAlign: 'center', padding: '36px 24px', marginBottom: 16 }}>
            <div style={{ fontSize: '1.6em', marginBottom: 10 }}>🔒</div>
            <div style={{ fontSize: '1em', color: 'var(--gp)', marginBottom: 6 }}>Results hidden</div>
            <div style={{ color: 'var(--gl)', fontSize: '0.88em', maxWidth: 420, margin: '0 auto' }}>
              Scores will be visible once the event organiser publishes results.
            </div>
          </Card>
        )}
        {!hidden && <Card padding="0">
          <Table>
            <THead>
              <TR>
                <TH style={{ width: 50 }}>Rank</TH>
                <TH>Participant</TH>
                <TH>Team</TH>
                <TH>Submissions</TH>
                <TH>Score</TH>
              </TR>
            </THead>
            <TBody>
              {(board || []).map((row, i) => {
                const isYou = row.userId === YOU_ID;
                const rank = i + 1;
                return (
                  <TR key={i} highlight={isYou}>
                    <TD>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: rank <= 3 ? MEDAL_COLORS[rank - 1] : 'var(--gm)',
                          fontWeight: rank <= 3 ? 700 : 400,
                        }}
                      >
                        {rank <= 3 ? MEDAL[rank - 1] : `#${rank}`}
                      </span>
                    </TD>
                    <TD>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${MEDAL_COLORS[rank - 1] || '#b87333'}, #9d7de8)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75em',
                            color: '#070707',
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {(row.userName || row.name || '?')[0]}
                        </div>
                        <span style={{ fontWeight: isYou ? 600 : 400 }}>
                          {row.userName || row.name || '—'}
                          {isYou && <span style={{ color: 'var(--copper)', fontSize: '0.78em', marginLeft: 6 }}>You</span>}
                        </span>
                      </div>
                    </TD>
                    <TD style={{ color: 'var(--gl)', fontSize: '0.85em' }}>{row.teamName || '—'}</TD>
                    <TD style={{ color: 'var(--gl)' }}>{row.submissionCount ?? '—'}</TD>
                    <TD>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--copper)', fontSize: '1.05em' }}>
                        {row.score ?? '—'}
                      </span>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </Card>}

        {!hidden && <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            onClick={() => setLimit(l => l + 20)}
            style={{ background: 'none', border: 'none', color: 'var(--copper)', cursor: 'pointer', fontSize: '0.85em' }}
          >
            Load more
          </button>
        </div>}
      </LoadState>
    </div>
  );
}
