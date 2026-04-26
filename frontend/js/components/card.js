// js/components/card.js — Card component
export function Card({ title, subtitle, content, footer, accent, badge, icon, onClick }) {
  const div = document.createElement('div');
  div.style.cssText = `
    background:#1a1d27;border:1px solid rgba(255,255,255,0.07);border-radius:14px;
    padding:1.25rem;transition:all 0.2s;position:relative;overflow:hidden;
    ${accent ? `border-top:3px solid ${accent};` : ''}
    ${onClick ? 'cursor:pointer;' : ''}
  `;
  if (onClick) {
    div.addEventListener('mouseenter', () => { div.style.borderColor = 'rgba(245,158,11,0.25)'; div.style.transform = 'translateY(-1px)'; div.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; });
    div.addEventListener('mouseleave', () => { div.style.borderColor = 'rgba(255,255,255,0.07)'; div.style.transform = ''; div.style.boxShadow = ''; });
    div.addEventListener('click', onClick);
  }
  div.innerHTML = `
    ${title || subtitle || icon || badge ? `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:${content?'12px':'0'};">
      <div style="display:flex;align-items:center;gap:10px;">
        ${icon ? `<span style="font-size:1.4rem;">${icon}</span>` : ''}
        <div>
          ${title ? `<div style="font-weight:600;color:#f1f5f9;font-size:0.95rem;">${title}</div>` : ''}
          ${subtitle ? `<div style="color:#64748b;font-size:0.8rem;margin-top:2px;">${subtitle}</div>` : ''}
        </div>
      </div>
      ${badge ? `<div>${badge}</div>` : ''}
    </div>` : ''}
    ${content ? `<div>${content}</div>` : ''}
    ${footer ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);">${footer}</div>` : ''}
  `;
  return div;
}

export function StatCard({ label, value, icon, trend, color = '#f59e0b' }) {
  return `<div style="
    background:#1a1d27;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:1.25rem;
    border-left:3px solid ${color};transition:all 0.2s;
  ">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <span style="color:#64748b;font-size:0.8rem;font-weight:500;">${label}</span>
      <span style="font-size:1.3rem;">${icon || ''}</span>
    </div>
    <div style="font-size:1.75rem;font-weight:800;color:#f1f5f9;line-height:1;">${value}</div>
    ${trend ? `<div style="margin-top:6px;font-size:0.75rem;color:${trend.up?'#22c55e':'#ef4444'};">${trend.up?'↑':'↓'} ${trend.value}</div>` : ''}
  </div>`;
}
