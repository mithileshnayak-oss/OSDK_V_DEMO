import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import LoadState from '../../components/LoadState.jsx';

const DIFF_VARIANT = { BEGINNER: 'copper', INTERMEDIATE: 'amber', ADVANCED: 'violet' };

export default function Training({ onNav, onNavWithCtx, user }) {
  const { data: tracks, loading, error } = useApi(
    () => user?.userId ? api.userProgress(user.userId) : api.tracks(),
    [user?.userId]
  );

  return (
    <div>
      <PageHeader title="Training" subtitle="Browse and continue your learning tracks" />
      <LoadState loading={loading} error={error}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {(tracks || []).map(track => (
            <Card
              key={track.id}
              onClick={() => onNavWithCtx?.('module-viewer', { trackId: track.id, trackTitle: track.title })}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.95em', fontWeight: 500, marginBottom: 4 }}>{track.title}</div>
                  <div style={{ color: 'var(--gl)', fontSize: '0.8em' }}>
                    {track.moduleCount || track.modules || 0} modules
                  </div>
                </div>
                <Badge variant={DIFF_VARIANT[track.difficulty] || 'copper'}>
                  {track.difficulty || 'BEGINNER'}
                </Badge>
              </div>

              {track.description && (
                <p style={{ color: 'var(--gl)', fontSize: '0.82em', lineHeight: 1.5 }}>
                  {track.description}
                </p>
              )}

              <ProgressBar
                value={track.progress ?? track.completionPct ?? 0}
                label={`${track.enrolled ?? track.enrolledCount ?? 0} enrolled`}
                showPct
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78em', color: 'var(--gm)' }}>
                <span>{track.category || 'Data Science'}</span>
                <span style={{ color: track.progress === 100 ? 'var(--success)' : 'var(--copper)' }}>
                  {track.progress === 100 ? 'Completed ✓' : track.started ? 'Continue →' : 'Start →'}
                </span>
              </div>
            </Card>
          ))}
          {!tracks?.length && !loading && (
            <div style={{ color: 'var(--gl)', gridColumn: '1/-1', padding: 32, textAlign: 'center' }}>
              No tracks available
            </div>
          )}
        </div>
      </LoadState>
    </div>
  );
}
