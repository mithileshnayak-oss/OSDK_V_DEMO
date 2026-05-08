import { useState } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import LoadState from '../../components/LoadState.jsx';
import { Table, THead, TBody, TR, TH, TD } from '../../components/Table.jsx';

const ROLE_VARIANT = { participant: 'copper', admin: 'danger', instructor: 'amber', judge: 'violet' };
const ROLES = ['ALL', 'participant', 'admin', 'instructor', 'judge'];

const MOCK_USERS = [
  { id: 1, name: 'Arjun Mehta',   email: 'arjun@example.com',   role: 'participant', org: 'IIT Bombay',    joined: '2024-09-01' },
  { id: 2, name: 'Priya Sharma',  email: 'priya@foundry.ai',    role: 'admin',       org: 'Foundry AI',    joined: '2024-01-15' },
  { id: 3, name: 'Rohan Das',     email: 'rohan@foundry.ai',    role: 'instructor',  org: 'Foundry AI',    joined: '2024-03-20' },
  { id: 4, name: 'Ananya Iyer',   email: 'ananya@foundry.ai',   role: 'judge',       org: 'Foundry AI',    joined: '2024-02-10' },
  { id: 5, name: 'Vikram Singh',  email: 'vikram@iitd.ac.in',   role: 'participant', org: 'IIT Delhi',     joined: '2024-10-01' },
  { id: 6, name: 'Sneha Reddy',   email: 'sneha@bits.ac.in',    role: 'participant', org: 'BITS Pilani',   joined: '2024-09-15' },
  { id: 7, name: 'Aditya Kumar',  email: 'aditya@nit.ac.in',    role: 'participant', org: 'NIT Trichy',    joined: '2024-11-01' },
];

export default function AdminUsers() {
  const { data: users, loading, error, refetch } = useApi(() => api.users().catch(() => MOCK_USERS));
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [removingId, setRemovingId] = useState(null);

  async function handleRemove(u) {
    if (!window.confirm(`Remove ${u.name} (${u.email})? This deletes the VanyarUser in Foundry.`)) return;
    setRemovingId(u.id);
    try {
      await api.deleteUser(u.id);
      refetch?.();
    } catch (e) {
      alert(`Failed to remove user: ${e.message}`);
    } finally {
      setRemovingId(null);
    }
  }

  const displayUsers = (users || MOCK_USERS).filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage platform users and roles" />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {ROLES.map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            style={{
              padding: '5px 14px',
              background: roleFilter === r ? 'rgba(184,115,51,0.15)' : 'transparent',
              border: `1px solid ${roleFilter === r ? 'rgba(184,115,51,0.4)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 6,
              color: roleFilter === r ? 'var(--copper)' : 'var(--gl)',
              cursor: 'pointer',
              fontSize: '0.78em',
              fontFamily: "'DM Mono', monospace",
              transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}
          >
            {r}
          </button>
        ))}
        <input
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: 'auto', width: 260, padding: '7px 12px', background: 'var(--ch)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--white)', fontSize: '0.85em', fontFamily: "'DM Mono', monospace" }}
        />
      </div>

      <LoadState loading={loading} error={error}>
        <Card padding="0">
          <Table>
            <THead>
              <TR>
                <TH>User</TH>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Organisation</TH>
                <TH>Joined</TH>
                <TH>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {displayUsers.map(u => (
                <TR key={u.id}>
                  <TD>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #b87333, #9d7de8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75em',
                          fontWeight: 600,
                          color: '#070707',
                          flexShrink: 0,
                        }}
                      >
                        {u.name[0]}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </TD>
                  <TD style={{ color: 'var(--gl)', fontSize: '0.85em' }}>{u.email}</TD>
                  <TD>
                    <select
                      defaultValue={u.role}
                      style={{
                        background: 'var(--ch)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        color: 'var(--white)',
                        fontSize: '0.8em',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {['participant', 'admin', 'instructor', 'judge'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </TD>
                  <TD style={{ color: 'var(--gl)', fontSize: '0.85em' }}>{u.org || u.organisation || '—'}</TD>
                  <TD style={{ color: 'var(--gl)', fontSize: '0.82em' }}>{u.joined ? new Date(u.joined).toLocaleDateString() : '—'}</TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button size="small" variant="ghost">View</Button>
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => handleRemove(u)}
                        disabled={removingId === u.id}
                      >
                        {removingId === u.id ? 'Removing…' : 'Remove'}
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
        <div style={{ marginTop: 10, fontSize: '0.78em', color: 'var(--gm)' }}>
          Showing {displayUsers.length} user{displayUsers.length !== 1 ? 's' : ''}
        </div>
      </LoadState>
    </div>
  );
}
