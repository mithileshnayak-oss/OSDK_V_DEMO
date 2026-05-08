export default function MiniChart({ data = [], color = 'copper', height = 60, label }) {
  const max = Math.max(...data.map(d => (typeof d === 'object' ? d.value : d)), 1);

  const colors = {
    copper: '#b87333',
    amber:  '#f0b429',
    violet: '#9d7de8',
    success:'#27ae60',
  };
  const barColor = colors[color] || color;

  return (
    <div>
      {label && <div style={{ fontSize: '0.78em', color: 'var(--gl)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
        {data.map((d, i) => {
          const val = typeof d === 'object' ? d.value : d;
          const lbl = typeof d === 'object' ? d.label : i;
          const pct = (val / max) * 100;
          return (
            <div
              key={i}
              title={`${lbl}: ${val}`}
              style={{
                flex: 1,
                height: `${Math.max(4, pct)}%`,
                background: barColor,
                borderRadius: '3px 3px 0 0',
                opacity: 0.8,
                transition: 'height 0.3s',
                minHeight: 4,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
