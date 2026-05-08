import { useState } from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'default',
  onClick,
  disabled,
  style,
  type = 'button',
}) {
  const [hovered, setHovered] = useState(false);

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    border: 'none',
    borderRadius: 8,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.18s',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    letterSpacing: '0.02em',
  };

  const sizes = {
    default: { padding: '9px 18px', fontSize: '0.9em' },
    small:   { padding: '5px 12px', fontSize: '0.8em' },
    large:   { padding: '12px 24px', fontSize: '1em'  },
  };

  const variants = {
    primary: {
      background: hovered ? '#d48940' : '#b87333',
      color: '#070707',
      border: 'none',
    },
    secondary: {
      background: hovered ? 'rgba(184,115,51,0.1)' : 'transparent',
      color: '#b87333',
      border: '1px solid rgba(184,115,51,0.4)',
    },
    ghost: {
      background: hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
      color: '#cac8c0',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    danger: {
      background: hovered ? '#c0392b' : '#e74c3c',
      color: '#fff',
      border: 'none',
    },
    amber: {
      background: hovered ? '#d4a017' : 'rgba(240,180,41,0.15)',
      color: '#f0b429',
      border: '1px solid rgba(240,180,41,0.3)',
    },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...base, ...sizes[size] || sizes.default, ...variants[variant] || variants.primary, ...style }}
    >
      {children}
    </button>
  );
}
