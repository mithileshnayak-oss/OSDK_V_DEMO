import { useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import { Table, THead, TBody, TR, TH, TD } from '../../components/Table.jsx';

const MOCK_EXERCISES = [
  { id: 1, title: 'Pandas Data Wrangling',     track: 'Python for Data Science', type: 'NOTEBOOK', points: 100, submissions: 42 },
  { id: 2, title: 'EDA on Titanic Dataset',    track: 'Python for Data Science', type: 'NOTEBOOK', points: 150, submissions: 38 },
  { id: 3, title: 'Linear Regression',         track: 'ML Fundamentals',         type: 'NOTEBOOK', points: 200, submissions: 29 },
  { id: 4, title: 'SQL Window Functions',       track: 'SQL & Analytics',         type: 'QUERY',    points: 100, submissions: 51 },
  { id: 5, title: 'Dashboard with Matplotlib', track: 'Python for Data Science', type: 'NOTEBOOK', points: 125, submissions: 35 },
];

const TYPE_VARIANT = { NOTEBOOK: 'copper', QUERY: 'amber', SCRIPT: 'violet' };

export default function InstructorExercises() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', track: '', type: 'NOTEBOOK', points: 100, instructions: '' });

  const startEdit = (ex) => {
    setEditId(ex.id);
    setForm({ title: ex.title, track: ex.track, type: ex.type, points: ex.points, instructions: '' });
    setShowForm(true);
  };

  return (
    <div>
      <PageHeader
        title="Exercises"
        subtitle="Create and manage coding exercises"
        action={
          <Button onClick={() => { setEditId(null); setForm({ title: '', track: '', type: 'NOTEBOOK', points: 100, instructions: '' }); setShowForm(true); }}>
            + New Exercise
          </Button>
        }
      />

      {showForm && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ fontWeight: 500, fontSize: '0.9em' }}>{editId ? 'Edit Exercise' : 'New Exercise'}</div>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--gl)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Title</label>
              <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} style={{ width: '100%', padding: '9px 12px', background: 'var(--ch)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--white)', fontSize: '0.88em', fontFamily: "'DM Mono', monospace" }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Track</label>
              <input value={form.track} onChange={e => setForm(f => ({...f, track: e.target.value}))} style={{ width: '100%', padding: '9px 12px', background: 'var(--ch)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--white)', fontSize: '0.88em', fontFamily: "'DM Mono', monospace" }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} style={{ width: '100%', padding: '9px 12px', background: 'var(--ch)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--white)', fontSize: '0.88em', fontFamily: "'DM Mono', monospace" }}>
                {['NOTEBOOK', 'QUERY', 'SCRIPT', 'REPORT'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Instructions</label>
            <textarea rows={4} value={form.instructions} onChange={e => setForm(f => ({...f, instructions: e.target.value}))} style={{ width: '100%', padding: '9px 12px', background: 'var(--ch)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--white)', fontSize: '0.88em', resize: 'vertical', fontFamily: "'DM Mono', monospace" }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button>Save Exercise</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card padding="0">
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Track</TH>
              <TH>Type</TH>
              <TH>Points</TH>
              <TH>Submissions</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {MOCK_EXERCISES.map(ex => (
              <TR key={ex.id}>
                <TD style={{ fontWeight: 500 }}>{ex.title}</TD>
                <TD style={{ color: 'var(--gl)', fontSize: '0.85em' }}>{ex.track}</TD>
                <TD><Badge variant={TYPE_VARIANT[ex.type] || 'copper'}>{ex.type}</Badge></TD>
                <TD style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--amber)' }}>{ex.points}</TD>
                <TD style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--gp)' }}>{ex.submissions}</TD>
                <TD>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button size="small" variant="secondary" onClick={() => startEdit(ex)}>Edit</Button>
                    <Button size="small" variant="ghost">Clone</Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
