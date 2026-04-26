// js/components/badge.js — Status/label badges
import { STATUS_COLORS } from '../ui/theme.js';
import { Formatter } from '../utils/formatter.js';

export function Badge(status, customLabel) {
  const key = (status || '').toLowerCase().replace(/ /g,'_');
  const c = STATUS_COLORS[key] || STATUS_COLORS.default;
  const label = customLabel || Formatter.statusLabel(status || 'Unknown');
  return `<span style="
    display:inline-flex;align-items:center;gap:4px;
    padding:3px 10px;border-radius:9999px;font-size:0.72rem;font-weight:600;
    background:${c.bg};color:${c.text};border:1px solid ${c.border};
    text-transform:uppercase;letter-spacing:0.04em;white-space:nowrap;
  "><span style="width:5px;height:5px;border-radius:50%;background:${c.text};display:inline-block;"></span>${label}</span>`;
}

export function RoleBadge(role) {
  const map = {
    admin:    { bg:'rgba(168,85,247,0.12)', text:'#a855f7', border:'rgba(168,85,247,0.3)', label:'Admin' },
    worker:   { bg:'rgba(59,130,246,0.12)', text:'#3b82f6', border:'rgba(59,130,246,0.3)', label:'Worker' },
    customer: { bg:'rgba(34,197,94,0.12)',  text:'#22c55e', border:'rgba(34,197,94,0.3)',  label:'Customer' },
  };
  const c = map[role] || map.customer;
  return `<span style="
    padding:2px 8px;border-radius:9999px;font-size:0.7rem;font-weight:700;
    background:${c.bg};color:${c.text};border:1px solid ${c.border};
  ">${c.label}</span>`;
}

export function VerifiedBadge() {
  return `<span style="
    display:inline-flex;align-items:center;gap:3px;
    padding:2px 8px;border-radius:9999px;font-size:0.7rem;font-weight:700;
    background:rgba(34,197,94,0.12);color:#22c55e;border:1px solid rgba(34,197,94,0.3);
  ">✓ Verified</span>`;
}
