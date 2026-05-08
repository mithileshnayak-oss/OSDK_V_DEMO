export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
      <div>
        <h1
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: '2.2em',
            letterSpacing: '0.08em',
            color: 'var(--white)',
            lineHeight: 1,
            marginBottom: subtitle ? 6 : 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: 'var(--gl)', fontSize: '0.88em', marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
