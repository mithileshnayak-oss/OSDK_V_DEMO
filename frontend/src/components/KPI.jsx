import Card from './Card.jsx';

export default function KPI({ label, value, subtitle, icon, accent = 'copper', style }) {
  const accentColor = {
    copper: 'var(--copper)',
    amber:  'var(--amber)',
    violet: 'var(--violet)',
    success:'var(--success)',
    danger: 'var(--danger)',
  }[accent] || 'var(--copper)';

  return (
    <Card style={{ minWidth: 140, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '0.78em', color: 'var(--gl)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
          {label}
        </div>
        {icon && <span style={{ fontSize: '1.2em', opacity: 0.6 }}>{icon}</span>}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '2em',
          fontWeight: 700,
          color: accentColor,
          lineHeight: 1,
          marginBottom: subtitle ? 6 : 0,
        }}
      >
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.78em', color: 'var(--gl)', marginTop: 4 }}>{subtitle}</div>
      )}
    </Card>
  );
}
