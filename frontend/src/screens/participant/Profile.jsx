import { useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';

const MOCK_USER = {
  id: 'demo-user',
  name: 'Arjun Mehta',
  email: 'arjun@example.com',
  organisation: 'IIT Bombay',
  role: 'participant',
  joinedAt: '2024-09-01',
  stats: {
    eventsParticipated: 4,
    totalSubmissions: 18,
    avgScore: 84.2,
    tracksEnrolled: 5,
    modulesCompleted: 34,
  },
  badges: ['Early Adopter', 'Top 10 — DataFest 2024', 'ML Sprint Finalist'],
};

export default function Profile({ user }) {
  const [editMode, setEditMode] = useState(false);
  const u = { ...MOCK_USER, ...user };
  const [form, setForm] = useState({ name: u.name, email: u.email, organisation: u.organisation });

  return (
    <div>
      <PageHeader
        title="Profile"
        action={
          <Button
            variant={editMode ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setEditMode(e => !e)}
          >
            {editMode ? 'Save Changes' : 'Edit Profile'}
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Profile card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #b87333, #9d7de8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8em',
                fontWeight: 700,
                color: '#070707',
                margin: '0 auto 16px',
                boxShadow: '0 0 24px rgba(184,115,51,0.2)',
              }}
            >
              {u.name[0]}
            </div>

            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                {['name', 'email', 'organisation'].map(field => (
                  <div key={field}>
                    <label style={{ fontSize: '0.72em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                      {field}
                    </label>
                    <input
                      value={form[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--ch)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        color: 'var(--white)',
                        fontSize: '0.85em',
                        fontFamily: "'DM Mono', monospace",
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div style={{ fontWeight: 500, fontSize: '1.05em', marginBottom: 4 }}>{u.name}</div>
                <div style={{ color: 'var(--gl)', fontSize: '0.82em', marginBottom: 6 }}>{u.email}</div>
                <div style={{ color: 'var(--copper)', fontSize: '0.8em' }}>{u.organisation}</div>
                <div style={{ color: 'var(--gm)', fontSize: '0.75em', marginTop: 8 }}>
                  Joined {new Date(u.joinedAt).toLocaleDateString()}
                </div>
              </>
            )}
          </Card>

          {/* Badges */}
          <Card>
            <div style={{ fontSize: '0.78em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              Achievements
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {u.badges.map((b, i) => (
                <Badge key={i} variant={['copper', 'amber', 'violet'][i % 3]}>{b}</Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            {[
              { label: 'Events', value: u.stats.eventsParticipated, accent: 'amber' },
              { label: 'Submissions', value: u.stats.totalSubmissions, accent: 'copper' },
              { label: 'Avg Score', value: u.stats.avgScore.toFixed(1), accent: 'success' },
              { label: 'Tracks', value: u.stats.tracksEnrolled, accent: 'violet' },
              { label: 'Modules Done', value: u.stats.modulesCompleted, accent: 'copper' },
            ].map(s => (
              <Card key={s.label}>
                <div style={{ fontSize: '0.72em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.8em', color: `var(--${s.accent})`, lineHeight: 1 }}>
                  {s.value}
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <div style={{ fontSize: '0.78em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
              Track Progress
            </div>
            {[
              { title: 'Python for Data Science', progress: 72 },
              { title: 'ML Fundamentals',         progress: 35 },
              { title: 'SQL & Analytics',         progress: 90 },
              { title: 'Deep Learning Basics',    progress: 12 },
            ].map(t => (
              <div key={t.title} style={{ marginBottom: 14 }}>
                <ProgressBar value={t.progress} label={t.title} showPct />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
