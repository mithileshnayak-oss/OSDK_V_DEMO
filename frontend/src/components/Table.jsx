export function Table({ children, style }) {
  return (
    <div style={{ overflowX: 'auto', ...style }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88em' }}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }) {
  return <thead>{children}</thead>;
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children, onClick, highlight }) {
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: highlight ? 'rgba(184,115,51,0.08)' : 'transparent',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => !highlight && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
      onMouseLeave={e => !highlight && (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </tr>
  );
}

export function TH({ children, style }) {
  return (
    <th
      style={{
        padding: '10px 14px',
        textAlign: 'left',
        color: 'var(--gl)',
        fontSize: '0.8em',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontWeight: 500,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </th>
  );
}

export function TD({ children, style, colSpan }) {
  return (
    <td
      colSpan={colSpan}
      style={{
        padding: '11px 14px',
        color: 'var(--white)',
        verticalAlign: 'middle',
        ...style,
      }}
    >
      {children}
    </td>
  );
}
