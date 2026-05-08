import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import LoadState from '../../components/LoadState.jsx';

export default function Organisations() {
  const { data: orgs, loading, error } = useApi(() => api.organisations());

  return (
    <div>
      <PageHeader
        title="Organisations"
        subtitle="Institutional partners and their members"
        action={<Button>+ Add Organisation</Button>}
      />

      <LoadState loading={loading} error={error}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {(orgs || []).map(org => (
            <Card key={org.id} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: 'var(--ch)',
                    border: '1px solid rgba(184,115,51,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2em',
                    fontWeight: 700,
                    color: 'var(--copper)',
                    fontFamily: "'Bebas Neue', cursive",
                    flexShrink: 0,
                  }}
                >
                  {(org.name || org.shortName || '?')[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95em' }}>{org.name}</div>
                  {org.type && <div style={{ color: 'var(--gl)', fontSize: '0.78em', marginTop: 2 }}>{org.type}</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.7em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Members</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--copper)', fontSize: '1.3em' }}>
                    {org.memberCount ?? org.members ?? '—'}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.7em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Events</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--amber)', fontSize: '1.3em' }}>
                    {org.eventCount ?? org.events ?? '—'}
                  </div>
                </div>
              </div>

              {org.location && (
                <div style={{ fontSize: '0.8em', color: 'var(--gm)' }}>📍 {org.location}</div>
              )}

              <Button size="small" variant="secondary" style={{ alignSelf: 'flex-start' }}>
                Manage
              </Button>
            </Card>
          ))}
          {!orgs?.length && !loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--gl)', padding: 48 }}>
              No organisations yet
            </div>
          )}
        </div>
      </LoadState>
    </div>
  );
}
