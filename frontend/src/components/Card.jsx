import { useState } from 'react';

export default function Card({ children, style, onClick, hover = true, padding = '20px' }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: 'var(--card-bg)',
        border: `1px solid ${hovered ? 'var(--card-hover-border)' : 'var(--card-border)'}`,
        borderRadius: 12,
        padding,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? '0 0 0 1px rgba(184,115,51,0.1)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
