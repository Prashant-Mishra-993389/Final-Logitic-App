// js/ui/theme.js — Design tokens for OneKeep dark theme

export const THEME = {
  colors: {
    bgPrimary:    '#090d14',
    bgSecondary:  '#101622',
    bgCard:       '#161e2d',
    bgCardHover:  '#1c2638',
    bgSidebar:    '#0d121c',
    bgInput:      '#161e2d',
    bgInputFocus:  '#1c2638',

    accent:       '#38bdf8',
    accentHover:  '#0284c7',
    accentLight:  'rgba(56,189,248,0.12)',
    accentGlow:   'rgba(56,189,248,0.25)',
    
    gradient:     'linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%)',

    blue:         '#3b82f6',
    blueLight:    'rgba(59,130,246,0.12)',
    success:      '#2dd4bf',
    successLight: 'rgba(45,212,191,0.12)',
    danger:       '#ef4444',
    dangerLight:  'rgba(239,68,68,0.12)',
    warning:      '#f59e0b',
    warningLight: 'rgba(245,158,11,0.12)',

    textPrimary:  '#f8fafc',
    textSecondary:'#94a3b8',
    textMuted:    '#64748b',

    border:       'rgba(255,255,255,0.07)',
    borderHover:  'rgba(255,255,255,0.12)',
    borderFocus:  'rgba(56,189,248,0.4)',
  },
  spacing: {
    sidebarWidth:       '260px',
    sidebarCollapsed:   '64px',
    navbarHeight:       '70px',
    contentPadding:     '1.5rem',
  },
};

export const STATUS_COLORS = {
  pending:    { bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b',  border: 'rgba(245,158,11,0.3)'  },
  active:     { bg: 'rgba(56,189,248,0.12)',  text: '#38bdf8',  border: 'rgba(56,189,248,0.3)'  },
  completed:  { bg: 'rgba(45,212,191,0.12)',  text: '#2dd4bf',  border: 'rgba(45,212,191,0.3)'   },
  cancelled:  { bg: 'rgba(239,68,68,0.12)',   text: '#ef4444',  border: 'rgba(239,68,68,0.3)'   },
  default:    { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8',  border: 'rgba(100,116,139,0.3)' },
};