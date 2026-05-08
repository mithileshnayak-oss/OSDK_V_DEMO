import { useState } from 'react';

const NAV = {
  participant: [
    { id: 'dashboard',      label: 'Dashboard',    icon: '⬡' },
    { id: 'training',       label: 'Training',     icon: '◈' },
    { id: 'events',         label: 'Events',       icon: '◎' },
    { id: 'leaderboard',    label: 'Leaderboard',  icon: '◆' },
    { id: 'my-submissions', label: 'Submissions',  icon: '◻' },
    { id: 'profile',        label: 'Profile',      icon: '○' },
  ],
  admin: [
    { id: 'admin-dashboard',    label: 'Dashboard',      icon: '⬡' },
    { id: 'admin-events',       label: 'Events',         icon: '◎' },
    { id: 'admin-users',        label: 'Users',          icon: '○' },
    { id: 'admin-orgs',         label: 'Organisations',  icon: '◈' },
    { id: 'admin-training',     label: 'Training',       icon: '◻' },
    { id: 'admin-analytics',    label: 'Analytics',      icon: '◆' },
  ],
  instructor: [
    { id: 'instructor-tracks',    label: 'Tracks',    icon: '◈' },
    { id: 'instructor-editor',    label: 'Editor',    icon: '◻' },
    { id: 'instructor-exercises', label: 'Exercises', icon: '◎' },
    { id: 'instructor-progress',  label: 'Progress',  icon: '◆' },
  ],
  judge: [
    { id: 'judge-events',   label: 'Events',   icon: '◎' },
    { id: 'judge-queue',    label: 'Queue',    icon: '◻' },
    { id: 'judge-history',  label: 'History',  icon: '◆' },
  ],
  org_manager: [
    { id: 'org-dashboard', label: 'Dashboard', icon: '⬡' },
    { id: 'org-events',    label: 'Events',    icon: '◎' },
    { id: 'org-users',     label: 'Members',   icon: '○' },
    { id: 'org-training',  label: 'Training',  icon: '◻' },
    { id: 'org-analytics', label: 'Reports',   icon: '◆' },
  ],
};

const ROLE_LABELS = {
  participant: 'PARTICIPANT',
  admin: 'ADMIN',
  instructor: 'INSTRUCTOR',
  judge: 'JUDGE',
  org_manager: 'ORG MANAGER',
};

const ROLE_COLORS = {
  participant: '#b87333',
  admin: '#e74c3c',
  instructor: '#f0b429',
  judge: '#9d7de8',
  org_manager: '#27ae60',
};

export default function Sidebar({ screen, role, onNav, onLogout, user }) {
  const [collapsed, setCollapsed] = useState(false);
  const navItems = NAV[role] || NAV.participant;
  const width = collapsed ? 60 : 220;

  return (
    <div
      style={{
        width,
        minWidth: width,
        background: 'var(--off)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
      }}
    >
      {/* Logo + collapse button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '18px 0' : '18px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          minHeight: 62,
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                background: 'var(--black)',
                border: '1px solid rgba(184,115,51,0.4)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Bebas Neue', cursive",
                fontSize: '1.1em',
                color: 'var(--copper)',
                letterSpacing: '0.05em',
              }}
            >
              V
            </div>
            <span
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: '1.3em',
                letterSpacing: '0.12em',
                color: 'var(--white)',
              }}
            >
              VANYAR
            </span>
          </div>
        )}
        {collapsed && (
          <div
            style={{
              width: 30,
              height: 30,
              background: 'var(--black)',
              border: '1px solid rgba(184,115,51,0.4)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Bebas Neue', cursive",
              fontSize: '1.1em',
              color: 'var(--copper)',
            }}
          >
            V
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--gm)',
              cursor: 'pointer',
              fontSize: '1em',
              padding: 4,
              borderRadius: 4,
            }}
          >
            ◁
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--gm)',
            cursor: 'pointer',
            padding: '8px 0',
            fontSize: '0.9em',
            width: '100%',
          }}
        >
          ▷
        </button>
      )}

      {/* Role badge */}
      {!collapsed && (
        <div
          style={{
            padding: '8px 16px',
            fontSize: '0.68em',
            letterSpacing: '0.12em',
            color: ROLE_COLORS[role],
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            fontWeight: 500,
          }}
        >
          {ROLE_LABELS[role]}
        </div>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {navItems.map(item => {
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: collapsed ? '10px 0' : '10px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? 'var(--nav-active-bg)' : 'transparent',
                border: 'none',
                borderLeft: active ? '2px solid var(--copper)' : '2px solid transparent',
                color: active ? 'var(--nav-active-text)' : 'var(--gl)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontSize: '0.88em',
                letterSpacing: '0.02em',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.color = 'var(--gp)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--gl)';
                }
              }}
            >
              <span style={{ fontSize: '1em', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User + logout at bottom */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: collapsed ? '12px 0' : '12px 16px',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #b87333, #9d7de8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78em',
                fontWeight: 600,
                color: '#070707',
                flexShrink: 0,
              }}
            >
              {user?.name?.[0] || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82em', color: 'var(--gp)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Demo User'}
              </div>
              <div style={{ fontSize: '0.72em', color: 'var(--gm)' }}>{ROLE_LABELS[role]}</div>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          title="Logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            width: '100%',
            padding: collapsed ? '8px 0' : '8px 10px',
            background: 'none',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 6,
            color: 'var(--gm)',
            cursor: 'pointer',
            fontSize: '0.8em',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(231,76,60,0.4)';
            e.currentTarget.style.color = '#e74c3c';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
            e.currentTarget.style.color = 'var(--gm)';
          }}
        >
          <span>↩</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
