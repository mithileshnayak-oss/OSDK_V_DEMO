const VARIANTS = {
  default:  { bg: 'rgba(184,115,51,0.15)',  color: '#b87333',  border: 'rgba(184,115,51,0.3)'  },
  copper:   { bg: 'rgba(184,115,51,0.15)',  color: '#b87333',  border: 'rgba(184,115,51,0.3)'  },
  amber:    { bg: 'rgba(240,180,41,0.11)',  color: '#f0b429',  border: 'rgba(240,180,41,0.28)' },
  violet:   { bg: 'rgba(157,125,232,0.1)', color: '#9d7de8',  border: 'rgba(157,125,232,0.26)'},
  success:  { bg: 'rgba(39,174,96,0.12)',  color: '#27ae60',  border: 'rgba(39,174,96,0.3)'   },
  warning:  { bg: 'rgba(230,126,34,0.12)', color: '#e67e22',  border: 'rgba(230,126,34,0.3)'  },
  danger:   { bg: 'rgba(231,76,60,0.12)',  color: '#e74c3c',  border: 'rgba(231,76,60,0.3)'   },
  muted:    { bg: 'rgba(255,255,255,0.05)', color: '#858585', border: 'rgba(255,255,255,0.1)' },
};

export default function Badge({ children, variant = 'default', style }) {
  const v = VARIANTS[variant] || VARIANTS.default;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '0.78em',
        fontWeight: 500,
        letterSpacing: '0.04em',
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
