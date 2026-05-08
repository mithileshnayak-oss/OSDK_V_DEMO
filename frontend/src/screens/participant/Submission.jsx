import { useState } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import DropZone from '../../components/DropZone.jsx';
import LoadState from '../../components/LoadState.jsx';

export default function Submission({ eventId, eventTitle, challengeId, challengeTitle, onNav }) {
  const { data: events, loading, error } = useApi(() => api.events('ACTIVE'));
  const [selectedEvent, setSelectedEvent] = useState(eventId || '');
  const [selectedChallenge, setSelectedChallenge] = useState(challengeId || '');
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { data: challenges } = useApi(
    () => selectedEvent ? api.eventChallenges(selectedEvent) : Promise.resolve([]),
    [selectedEvent]
  );

  const handleSubmit = async () => {
    if (!confirming) { setConfirming(true); return; }
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Real Foundry needs a media-upload RID; the demo backend accepts any
      // fileRef string, so we synthesise one from the file metadata.
      const fileRef = `local:${file.name}:${file.size}:${Date.now()}`;
      await api.submit({
        challengeId: selectedChallenge,
        fileRef,
        fileName: file.name,
        notes,
      });
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e.message || 'Submission failed');
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <PageHeader title="Submission" />
        <Card style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: '2.5em', marginBottom: 16 }}>✓</div>
          <div style={{ fontSize: '1.1em', fontWeight: 500, color: 'var(--success)', marginBottom: 8 }}>
            Submission Received!
          </div>
          <div style={{ color: 'var(--gl)', fontSize: '0.88em', marginBottom: 24 }}>
            Your solution has been submitted and is pending review.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Button onClick={() => { setSubmitted(false); setConfirming(false); setFile(null); }}>
              Submit Another
            </Button>
            <Button variant="secondary" onClick={() => onNav('my-submissions')}>
              View My Submissions
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Submit Solution" subtitle="Upload your solution for a challenge" />
      <div style={{ maxWidth: 600 }}>
        <LoadState loading={loading} error={error}>
          <Card style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Event selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8em', color: 'var(--gl)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Event
              </label>
              <select
                value={selectedEvent}
                onChange={e => { setSelectedEvent(e.target.value); setSelectedChallenge(''); }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--ch)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: selectedEvent ? 'var(--white)' : 'var(--gm)',
                  fontSize: '0.88em',
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                <option value="">Select an event…</option>
                {(events || []).map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>

            {/* Challenge selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8em', color: 'var(--gl)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Challenge
              </label>
              <select
                value={selectedChallenge}
                onChange={e => setSelectedChallenge(e.target.value)}
                disabled={!selectedEvent}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--ch)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: selectedChallenge ? 'var(--white)' : 'var(--gm)',
                  fontSize: '0.88em',
                  fontFamily: "'DM Mono', monospace",
                  opacity: selectedEvent ? 1 : 0.5,
                }}
              >
                <option value="">Select a challenge…</option>
                {(challenges || []).map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.title}</option>
                ))}
              </select>
            </div>

            {/* File upload */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8em', color: 'var(--gl)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Solution File
              </label>
              <DropZone
                accept=".ipynb,.py,.csv,.zip,.html,.pdf"
                label="Drop your solution file here"
                onFile={setFile}
              />
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8em', color: 'var(--gl)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Describe your approach, assumptions, or any notes for the judge…"
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--ch)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: 'var(--white)',
                  fontSize: '0.88em',
                  resize: 'vertical',
                  fontFamily: "'DM Mono', monospace",
                }}
              />
            </div>

            {confirming && (
              <div style={{ padding: '14px 16px', background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.25)', borderRadius: 8 }}>
                <div style={{ color: 'var(--amber)', fontSize: '0.88em', marginBottom: 4 }}>Confirm submission?</div>
                <div style={{ color: 'var(--gl)', fontSize: '0.8em' }}>
                  Once submitted, you can re-submit but the judge will see all attempts.
                </div>
              </div>
            )}

            {submitError && (
              <div style={{ padding: '10px 14px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, color: 'var(--danger)', fontSize: '0.82em' }}>
                {submitError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                disabled={!selectedEvent || !selectedChallenge || !file || submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Submitting…' : confirming ? 'Confirm & Submit' : 'Submit Solution'}
              </Button>
              {confirming && !submitting && (
                <Button variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
              )}
            </div>
          </Card>
        </LoadState>
      </div>
    </div>
  );
}
