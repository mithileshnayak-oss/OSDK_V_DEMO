import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { api } from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import DropZone from '../../components/DropZone.jsx';
import LoadState from '../../components/LoadState.jsx';
import Badge from '../../components/Badge.jsx';

const MOCK_MODULES = [
  { id: 1, title: 'Introduction & Setup',       type: 'VIDEO',    completed: true  },
  { id: 2, title: 'Core Concepts',              type: 'PDF',      completed: true  },
  { id: 3, title: 'Hands-on Exercise 1',        type: 'EXERCISE', completed: true  },
  { id: 4, title: 'Advanced Techniques',        type: 'VIDEO',    completed: false },
  { id: 5, title: 'Case Study Analysis',        type: 'PDF',      completed: false },
  { id: 6, title: 'Final Project',              type: 'EXERCISE', completed: false },
];

const TYPE_ICON = { VIDEO: '▶', PDF: '📄', EXERCISE: '◻', QUIZ: '?' };

export default function ModuleViewer({ trackId, trackTitle, user }) {
  const { data: modules, loading, error } = useApi(
    () => trackId ? api.trackModules(trackId) : Promise.resolve(MOCK_MODULES),
    [trackId]
  );
  const { data: completedIds } = useApi(
    () => user?.userId ? api.userCompletedModules(user.userId) : Promise.resolve([]),
    [user?.userId]
  );

  const displayModules = modules || MOCK_MODULES;
  const [activeId, setActiveId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [completed, setCompleted] = useState(() => new Set(MOCK_MODULES.filter(m => m.completed).map(m => m.id)));
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState(null);
  const [submittingExercise, setSubmittingExercise] = useState(false);
  const [exerciseStatus, setExerciseStatus] = useState(null); // 'submitted' | error string

  // Seed completion ticks from Foundry once the per-user list arrives.
  // Preserves any optimistic toggles the user has made during this session.
  useEffect(() => {
    if (!Array.isArray(completedIds)) return;
    setCompleted(prev => {
      const next = new Set(prev);
      for (const id of completedIds) next.add(id);
      return next;
    });
  }, [completedIds]);

  const toggleComplete = async (mod) => {
    const moduleId = mod.id;
    // If already completed, just toggle local state (no API uncompletion).
    if (completed.has(moduleId)) {
      setCompleted(prev => {
        const next = new Set(prev);
        next.delete(moduleId);
        return next;
      });
      return;
    }

    const isMock = typeof moduleId === 'number'; // mock modules have numeric ids; real ones are strings/RIDs
    if (isMock) {
      setCompleted(prev => new Set(prev).add(moduleId));
      return;
    }

    setCompleting(true);
    setCompleteError(null);
    try {
      await api.completeModule(moduleId);
      setCompleted(prev => new Set(prev).add(moduleId));
    } catch (e) {
      setCompleteError(e.message || 'Failed to mark complete');
    } finally {
      setCompleting(false);
    }
  };

  const activeModule = displayModules.find(m => m.id === (activeId ?? displayModules.find(m => !completed.has(m.id))?.id ?? displayModules[0]?.id));

  const submitExercise = async () => {
    if (!activeModule || !uploadedFile) return;
    setSubmittingExercise(true);
    setExerciseStatus(null);
    try {
      const fileRef = `local:${uploadedFile.name}:${uploadedFile.size}:${Date.now()}`;
      await api.submit({
        exerciseId: activeModule.id,
        fileRef,
        fileName: uploadedFile.name,
      });
      setExerciseStatus('submitted');
      setUploadedFile(null);
      // Auto-mark the module complete once the exercise is submitted.
      if (!completed.has(activeModule.id)) {
        try {
          await api.completeModule(activeModule.id);
          setCompleted(prev => new Set(prev).add(activeModule.id));
        } catch { /* non-fatal */ }
      }
    } catch (e) {
      setExerciseStatus(e.message || 'Failed to submit exercise');
    } finally {
      setSubmittingExercise(false);
    }
  };

  return (
    <div>
      <PageHeader title={trackTitle || 'Module Viewer'} subtitle="Work through each module at your own pace" />
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'flex-start' }}>
        {/* Module list sidebar */}
        <Card padding="0" style={{ position: 'sticky', top: 20 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.78em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Modules · {completed.size}/{displayModules.length}
          </div>
          <LoadState loading={loading} error={error}>
            {displayModules.map((mod, idx) => {
              const isCompleted = completed.has(mod.id);
              const isActive = activeModule?.id === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveId(mod.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '10px 14px',
                    background: isActive ? 'rgba(184,115,51,0.1)' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '2px solid var(--copper)' : '2px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: isActive ? 'var(--white)' : isCompleted ? 'var(--gl)' : 'var(--gp)',
                    fontSize: '0.82em',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ color: isCompleted ? 'var(--success)' : 'var(--gm)', fontSize: '0.9em', flexShrink: 0 }}>
                    {isCompleted ? '✓' : `${idx + 1}.`}
                  </span>
                  <span style={{ flex: 1, lineHeight: 1.3 }}>{mod.title}</span>
                  <span style={{ fontSize: '0.85em', opacity: 0.5 }}>{TYPE_ICON[mod.type] || '○'}</span>
                </button>
              );
            })}
          </LoadState>
        </Card>

        {/* Content area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {activeModule ? (
            <>
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: '1.1em', fontWeight: 500, marginBottom: 4 }}>{activeModule.title}</div>
                    <Badge variant={activeModule.type === 'EXERCISE' ? 'amber' : 'copper'}>
                      {activeModule.type || 'VIDEO'}
                    </Badge>
                  </div>
                  {completed.has(activeModule.id) && <Badge variant="success">COMPLETED</Badge>}
                </div>

                {/* Content placeholder */}
                {activeModule.type === 'VIDEO' && (
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      background: 'var(--ch)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 12,
                      color: 'var(--gm)',
                    }}
                  >
                    <div style={{ fontSize: '2.5em', opacity: 0.4 }}>▶</div>
                    <div style={{ fontSize: '0.85em' }}>Video content loads here</div>
                    <div style={{ fontSize: '0.75em', color: 'var(--gl)' }}>Integrate with Foundry Media or external CDN</div>
                  </div>
                )}

                {activeModule.type === 'PDF' && (
                  <div
                    style={{
                      width: '100%',
                      minHeight: 320,
                      background: 'var(--ch)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 12,
                      color: 'var(--gm)',
                    }}
                  >
                    <div style={{ fontSize: '2.5em', opacity: 0.4 }}>📄</div>
                    <div style={{ fontSize: '0.85em' }}>PDF/Document viewer</div>
                    <div style={{ fontSize: '0.75em', color: 'var(--gl)' }}>Integrate with PDF.js or Foundry File Storage</div>
                  </div>
                )}

                {activeModule.type === 'EXERCISE' && (
                  <div>
                    <div style={{ color: 'var(--gl)', fontSize: '0.85em', marginBottom: 16, lineHeight: 1.6 }}>
                      Complete the exercise and upload your solution file below.
                      Accepted formats: .ipynb, .py, .csv, .zip
                    </div>
                    <DropZone
                      accept=".ipynb,.py,.csv,.zip"
                      label="Drop your solution here or click to browse"
                      onFile={setUploadedFile}
                    />
                  </div>
                )}

                <div style={{ marginTop: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant={completed.has(activeModule.id) ? 'ghost' : 'primary'}
                    disabled={completing}
                    onClick={() => toggleComplete(activeModule)}
                  >
                    {completing
                      ? 'Saving…'
                      : completed.has(activeModule.id)
                        ? '✓ Completed'
                        : 'Mark Complete'}
                  </Button>
                  {activeModule.type === 'EXERCISE' && uploadedFile && (
                    <Button
                      variant="secondary"
                      disabled={submittingExercise}
                      onClick={submitExercise}
                    >
                      {submittingExercise ? 'Submitting…' : 'Submit Exercise'}
                    </Button>
                  )}
                  {exerciseStatus === 'submitted' && (
                    <span style={{ color: 'var(--success)', fontSize: '0.82em' }}>✓ Exercise submitted</span>
                  )}
                  {exerciseStatus && exerciseStatus !== 'submitted' && (
                    <span style={{ color: 'var(--danger)', fontSize: '0.82em' }}>{exerciseStatus}</span>
                  )}
                  {completeError && (
                    <span style={{ color: 'var(--danger)', fontSize: '0.82em' }}>{completeError}</span>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div style={{ color: 'var(--gl)', textAlign: 'center', padding: '40px 0' }}>
                Select a module to begin
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
