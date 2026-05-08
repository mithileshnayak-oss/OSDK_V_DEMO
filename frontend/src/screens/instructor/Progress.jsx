import { useState } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import LoadState from '../../components/LoadState.jsx';
import { Table, THead, TBody, TR, TH, TD } from '../../components/Table.jsx';

const MOCK_PROGRESS = [
  { name: 'Arjun Mehta',   email: 'arjun@example.com',  modulesCompleted: 8, totalModules: 12, lastActive: '2025-04-18', avgScore: 87 },
  { name: 'Vikram Singh',  email: 'vikram@iitd.ac.in',   modulesCompleted: 5, totalModules: 12, lastActive: '2025-04-17', avgScore: 72 },
  { name: 'Sneha Reddy',   email: 'sneha@bits.ac.in',    modulesCompleted: 12, totalModules: 12, lastActive: '2025-04-19', avgScore: 94 },
  { name: 'Aditya Kumar',  email: 'aditya@nit.ac.in',    modulesCompleted: 3, totalModules: 12, lastActive: '2025-04-10', avgScore: 68 },
  { name: 'Riya Patel',    email: 'riya@vit.ac.in',      modulesCompleted: 10, totalModules: 12, lastActive: '2025-04-18', avgScore: 91 },
  { name: 'Kiran Bose',    email: 'kiran@jnu.ac.in',     modulesCompleted: 7, totalModules: 12, lastActive: '2025-04-16', avgScore: 79 },
];

export default function InstructorProgress({ trackTitle }) {
  const { data: tracks } = useApi(() => api.tracks());
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_PROGRESS.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Student Progress"
        subtitle={trackTitle ? `Progress for ${trackTitle}` : 'Monitor learning progress across your tracks'}
      />

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={selectedTrack}
          onChange={e => setSelectedTrack(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--ch)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--white)', fontSize: '0.85em', fontFamily: "'DM Mono', monospace" }}
        >
          <option value="all">All Tracks</option>
          {(tracks || []).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <input
          placeholder="Search students…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--ch)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--white)', fontSize: '0.85em', fontFamily: "'DM Mono', monospace", width: 220 }}
        />
        <div style={{ color: 'var(--gl)', fontSize: '0.8em', marginLeft: 'auto' }}>
          {filtered.length} students
        </div>
      </div>

      <Card padding="0">
        <Table>
          <THead>
            <TR>
              <TH>Student</TH>
              <TH>Progress</TH>
              <TH>Modules</TH>
              <TH>Avg Score</TH>
              <TH>Last Active</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((p, i) => (
              <TR key={i}>
                <TD>
                  <div>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ color: 'var(--gl)', fontSize: '0.78em' }}>{p.email}</div>
                  </div>
                </TD>
                <TD style={{ width: 200 }}>
                  <ProgressBar
                    value={p.modulesCompleted}
                    max={p.totalModules}
                    showPct
                    height={5}
                    color={p.modulesCompleted === p.totalModules ? 'success' : 'copper'}
                  />
                </TD>
                <TD style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--copper)', fontSize: '0.9em' }}>
                  {p.modulesCompleted}/{p.totalModules}
                </TD>
                <TD style={{ fontFamily: "'JetBrains Mono', monospace", color: p.avgScore >= 80 ? 'var(--success)' : p.avgScore >= 60 ? 'var(--amber)' : 'var(--danger)' }}>
                  {p.avgScore}
                </TD>
                <TD style={{ color: 'var(--gl)', fontSize: '0.82em' }}>
                  {new Date(p.lastActive).toLocaleDateString()}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
