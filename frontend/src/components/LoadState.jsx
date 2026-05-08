export default function LoadState({ loading, error, children }) {
  if (loading) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <div style={{ color: 'var(--copper)', fontSize: '0.88em', letterSpacing: '0.08em' }}>
          Loading...
        </div>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--copper)',
                opacity: 0.6,
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 0.8; transform: scale(1.2); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '32px 24px',
          background: 'rgba(231,76,60,0.06)',
          border: '1px solid rgba(231,76,60,0.2)',
          borderRadius: 10,
          textAlign: 'center',
        }}
      >
        <div style={{ color: '#e74c3c', fontSize: '0.9em', marginBottom: 8 }}>⚠ Backend unavailable</div>
        <div style={{ color: 'var(--gl)', fontSize: '0.8em' }}>
          Start with: <code style={{ color: 'var(--amber)', fontFamily: "'JetBrains Mono', monospace" }}>node server.js --mock</code>
        </div>
        <div style={{ color: 'var(--gm)', fontSize: '0.75em', marginTop: 8 }}>{error}</div>
      </div>
    );
  }

  return children;
}
