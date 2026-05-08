import { useState } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import KPI from '../../components/KPI.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import LoadState from '../../components/LoadState.jsx';
import { Table, THead, TBody, TR, TH, TD } from '../../components/Table.jsx';

const STATUS_VARIANT = { ACTIVE: 'amber', PUBLISHED: 'copper', COMPLETED: 'muted', DRAFT: 'muted' };

const EMPTY_FORM = { title: '', eventType: 'HACKATHON', startDate: '', endDate: '', description: '' };

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--ch)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: 'var(--white)',
  fontSize: '0.88em',
  fontFamily: "'DM Mono', monospace",
};

export default function AdminEvents({ onNavWithCtx }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: events, loading, error } = useApi(() => api.events(), [refreshKey]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const [rowError, setRowError] = useState(null);
  const [publishingResultsId, setPublishingResultsId] = useState(null);
  const [resultsPublished, setResultsPublished] = useState(new Set()); // eventIds

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = async () => {
    setBusy(true);
    setFormError(null);
    try {
      await api.createEvent({
        name: form.title,
        eventType: form.eventType,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description,
      });
      setForm(EMPTY_FORM);
      setShowCreate(false);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setFormError(e.message || 'Failed to create event');
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async (id) => {
    setPublishingId(id);
    setRowError(null);
    try {
      await api.publishEvent(id);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setRowError(`Publish failed: ${e.message}`);
    } finally {
      setPublishingId(null);
    }
  };

  const handlePublishResults = async (id) => {
    setPublishingResultsId(id);
    setRowError(null);
    const already = resultsPublished.has(id);
    try {
      if (already) {
        await api.unpublishResults(id);
        setResultsPublished(prev => { const n = new Set(prev); n.delete(id); return n; });
      } else {
        await api.publishResults(id);
        setResultsPublished(prev => new Set(prev).add(id));
      }
    } catch (e) {
      setRowError(`Publish results failed: ${e.message}`);
    } finally {
      setPublishingResultsId(null);
    }
  };

  const filtered = (events || []).filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    active: (events || []).filter(e => e.status === 'ACTIVE').length,
    published: (events || []).filter(e => e.status === 'PUBLISHED').length,
    completed: (events || []).filter(e => e.status === 'COMPLETED').length,
    draft: (events || []).filter(e => e.status === 'DRAFT').length,
  };

  const canSubmit = form.title && form.eventType && form.startDate && form.endDate && !busy;

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="Manage hackathons and competitions"
        action={<Button onClick={() => setShowCreate(true)}>+ Create Event</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <KPI label="Active"    value={counts.active}    accent="amber" />
        <KPI label="Published" value={counts.published} accent="copper" />
        <KPI label="Completed" value={counts.completed} accent="success" />
        <KPI label="Draft"     value={counts.draft}     accent="muted" />
      </div>

      {/* Create event form */}
      {showCreate && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: '0.88em', fontWeight: 500 }}>Create New Event</div>
            <button onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); setFormError(null); }} style={{ background: 'none', border: 'none', color: 'var(--gl)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Title</label>
              <input value={form.title} onChange={setField('title')} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Type</label>
              <select value={form.eventType} onChange={setField('eventType')} style={inputStyle}>
                <option value="HACKATHON">Hackathon</option>
                <option value="TRAINING">Training</option>
                <option value="COMPETITION">Competition</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Start Date</label>
              <input type="date" value={form.startDate} onChange={setField('startDate')} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>End Date</label>
              <input type="date" value={form.endDate} onChange={setField('endDate')} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={{ display: 'block', fontSize: '0.78em', color: 'var(--gl)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Description</label>
            <textarea rows={3} value={form.description} onChange={setField('description')} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          {formError && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, color: 'var(--danger)', fontSize: '0.82em' }}>
              {formError}
            </div>
          )}
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <Button disabled={!canSubmit} onClick={handleCreate}>
              {busy ? 'Creating…' : 'Create as Draft'}
            </Button>
            <Button variant="secondary" onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); setFormError(null); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Search events…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 320, padding: '9px 14px', background: 'var(--ch)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--white)', fontSize: '0.88em', fontFamily: "'DM Mono', monospace" }}
        />
      </div>

      {rowError && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, color: 'var(--danger)', fontSize: '0.82em' }}>
          {rowError}
        </div>
      )}

      <LoadState loading={loading} error={error}>
        <Card padding="0">
          <Table>
            <THead>
              <TR>
                <TH>Title</TH>
                <TH>Status</TH>
                <TH>Start</TH>
                <TH>End</TH>
                <TH>Participants</TH>
                <TH>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map(ev => (
                <TR key={ev.id}>
                  <TD style={{ fontWeight: 500 }}>{ev.title}</TD>
                  <TD><Badge variant={STATUS_VARIANT[ev.status]}>{ev.status}</Badge></TD>
                  <TD style={{ color: 'var(--gl)', fontSize: '0.85em' }}>{ev.startDate ? new Date(ev.startDate).toLocaleDateString() : '—'}</TD>
                  <TD style={{ color: 'var(--gl)', fontSize: '0.85em' }}>{ev.endDate ? new Date(ev.endDate).toLocaleDateString() : '—'}</TD>
                  <TD style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--copper)' }}>
                    {ev.participantCount ?? '—'}
                  </TD>
                  <TD>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => onNavWithCtx?.('event-detail', { eventId: ev.id, eventTitle: ev.title })}
                      >
                        Manage
                      </Button>
                      {ev.status === 'DRAFT' && (
                        <Button
                          size="small"
                          disabled={publishingId === ev.id}
                          onClick={() => handlePublish(ev.id)}
                        >
                          {publishingId === ev.id ? 'Publishing…' : 'Publish'}
                        </Button>
                      )}
                      {(ev.status === 'ACTIVE' || ev.status === 'COMPLETED') && (
                        <Button
                          size="small"
                          variant={resultsPublished.has(ev.id) ? 'ghost' : 'primary'}
                          disabled={publishingResultsId === ev.id}
                          onClick={() => handlePublishResults(ev.id)}
                        >
                          {publishingResultsId === ev.id
                            ? '…'
                            : resultsPublished.has(ev.id)
                              ? '✓ Results published'
                              : 'Publish results'}
                        </Button>
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
              {filtered.length === 0 && !loading && (
                <TR><TD style={{ textAlign: 'center', color: 'var(--gl)', padding: '32px 0' }} colSpan="6">No events found</TD></TR>
              )}
            </TBody>
          </Table>
        </Card>
      </LoadState>
    </div>
  );
}
