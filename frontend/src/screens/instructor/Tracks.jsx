import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import LoadState from '../../components/LoadState.jsx';

const DIFF_VARIANT = { BEGINNER: 'copper', INTERMEDIATE: 'amber', ADVANCED: 'violet' };

export default function InstructorTracks({ onNavWithCtx }) {
  const { data: tracks, loading, error } = useApi(() => api.tracks());

  return (
    <div>
      <PageHeader
        title="My Tracks"
        subtitle="Tracks you author and manage"
        action={<Button>+ New Track</Button>}
      />

      <LoadState loading={loading} error={error}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {(tracks || []).map(t => (
            <Card key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{t.title}</div>
                  <div style={{ color: 'var(--gl)', fontSize: '0.78em' }}>{t.category || 'Data Science'}</div>
                </div>
                <Badge variant={DIFF_VARIANT[t.difficulty] || 'copper'}>{t.difficulty || 'BEGINNER'}</Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.7em', color: 'var(--gl)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Modules</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--copper)' }}>{t.moduleCount ?? t.modules ?? '—'}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.7em', color: 'var(--gl)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Enrolled</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--amber)' }}>{t.enrolled ?? t.enrolledCount ?? '—'}</div>
                </div>
              </div>

              <ProgressBar
                value={t.completionPct ?? t.progress ?? 0}
                label="Avg completion"
                showPct
              />

              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  size="small"
                  onClick={() => onNavWithCtx?.('instructor-editor', { trackId: t.id, trackTitle: t.title })}
                >
                  Edit Modules
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => onNavWithCtx?.('instructor-progress', { trackId: t.id, trackTitle: t.title })}
                >
                  Progress
                </Button>
              </div>
            </Card>
          ))}
          {!tracks?.length && !loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--gl)', padding: 48 }}>
              No tracks yet — create your first one
            </div>
          )}
        </div>
      </LoadState>
    </div>
  );
}
