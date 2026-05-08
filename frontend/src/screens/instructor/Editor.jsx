import { useState } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import DropZone from '../../components/DropZone.jsx';
import LoadState from '../../components/LoadState.jsx';

const MOCK_MODULES = [
  { id: 1, title: 'Introduction & Setup',  type: 'VIDEO',    order: 1 },
  { id: 2, title: 'Core Concepts',         type: 'PDF',      order: 2 },
  { id: 3, title: 'Hands-on Exercise 1',   type: 'EXERCISE', order: 3 },
  { id: 4, title: 'Advanced Techniques',   type: 'VIDEO',    order: 4 },
  { id: 5, title: 'Final Project',         type: 'EXERCISE', order: 5 },
];

const CONTENT_TYPES = ['VIDEO', 'PDF', 'EXERCISE', 'QUIZ', 'READING'];

export default function InstructorEditor({ trackId, trackTitle }) {
  const { data: modules, loading, error } = useApi(
    () => trackId ? api.trackModules(trackId) : Promise.resolve(MOCK_MODULES),
    [trackId]
  );

  const displayModules = modules || MOCK_MODULES;
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'VIDEO', duration: '' });
  const [dragOver, setDragOver] = useState(null);

  const selected = displayModules.find(m => m.id === selectedId);

  const loadModule = (mod) => {
    setSelectedId(mod.id);
    setForm({
      title: mod.title || '',
      description: mod.description || '',
      type: mod.type || 'VIDEO',
      duration: mod.duration || '',
    });
  };

  return (
    <div>
      <PageHeader
        title={trackTitle ? `Edit: ${trackTitle}` : 'Module Editor'}
        subtitle="Drag to reorder modules, click to edit content"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
        {/* Module list */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: '0.78em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Modules</div>
            <Button size="small" variant="secondary" onClick={() => {
              setSelectedId('new');
              setForm({ title: '', description: '', type: 'VIDEO', duration: '' });
            }}>
              + Add
            </Button>
          </div>

          <LoadState loading={loading} error={error}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {displayModules.map((mod, idx) => (
                <div
                  key={mod.id}
                  draggable
                  onDragOver={e => { e.preventDefault(); setDragOver(mod.id); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={() => setDragOver(null)}
                  onClick={() => loadModule(mod)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    background: selectedId === mod.id ? 'rgba(184,115,51,0.1)' : dragOver === mod.id ? 'rgba(255,255,255,0.04)' : 'var(--card-bg)',
                    border: `1px solid ${selectedId === mod.id ? 'rgba(184,115,51,0.35)' : 'var(--card-border)'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ color: 'var(--gm)', fontSize: '0.75em', cursor: 'grab', flexShrink: 0 }}>⠿</span>
                  <span style={{ color: 'var(--gm)', fontSize: '0.72em', flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span style={{ flex: 1, fontSize: '0.83em', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {mod.title}
                  </span>
                  <Badge variant={mod.type === 'EXERCISE' ? 'amber' : 'copper'} style={{ fontSize: '0.65em' }}>
                    {mod.type?.slice(0, 3)}
                  </Badge>
                </div>
              ))}
            </div>
          </LoadState>
        </div>

        {/* Edit form */}
        <Card>
          {selected || selectedId === 'new' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ fontSize: '0.88em', fontWeight: 500, color: 'var(--gl)' }}>
                {selectedId === 'new' ? 'New Module' : `Editing: ${selected?.title}`}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--ch)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--white)', fontSize: '0.88em', fontFamily: "'DM Mono', monospace" }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--ch)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--white)', fontSize: '0.88em', resize: 'vertical', fontFamily: "'DM Mono', monospace" }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Content Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--ch)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--white)', fontSize: '0.88em', fontFamily: "'DM Mono', monospace" }}
                  >
                    {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Duration (min)</label>
                  <input
                    value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    type="number"
                    placeholder="15"
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--ch)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--white)', fontSize: '0.88em', fontFamily: "'DM Mono', monospace" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Content Upload</label>
                <DropZone accept=".mp4,.pdf,.ipynb,.zip,.html" label="Upload module content" />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button>Save Module</Button>
                {selectedId !== 'new' && (
                  <Button variant="danger" size="small">Delete</Button>
                )}
                <Button variant="ghost" onClick={() => setSelectedId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gl)' }}>
              <div style={{ fontSize: '0.88em' }}>Select a module to edit</div>
              <div style={{ fontSize: '0.78em', marginTop: 8, color: 'var(--gm)' }}>or click + Add to create a new one</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
