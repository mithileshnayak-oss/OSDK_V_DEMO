export default function ProgressBar({ value = 0, max = 100, label, showPct = true, height = 6, color = 'copper' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const gradients = {
    copper: 'linear-gradient(90deg, #b87333, #d48940)',
    amber:  'linear-gradient(90deg, #f0b429, #d48940)',
    violet: 'linear-gradient(90deg, #9d7de8, #b87333)',
    success:'linear-gradient(90deg, #27ae60, #2ecc71)',
    danger: 'linear-gradient(90deg, #c04800, #e74c3c)',
  };

  return (
    <div>
      {(label || showPct) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.8em', color: 'var(--gl)' }}>
          {label && <span>{label}</span>}
          {showPct && <span style={{ color: 'var(--copper)', fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          background: 'rgba(255,255,255,0.07)',
          borderRadius: height,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: gradients[color] || gradients.copper,
            borderRadius: height,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}
