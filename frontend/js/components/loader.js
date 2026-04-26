// js/components/loader.js — Loading states
export const Loader = {
  spinner(size = 32, color = '#f59e0b') {
    return `<div style="width:${size}px;height:${size}px;border:3px solid rgba(245,158,11,0.2);border-top-color:${color};border-radius:50%;animation:spin 0.8s linear infinite;"></div>`;
  },

  page() {
    const el = document.createElement('div');
    el.style.cssText = 'display:flex;align-items:center;justify-content:center;min-height:60vh;flex-direction:column;gap:1rem;';
    el.innerHTML = `${this.spinner(44)}<div style="color:#64748b;font-size:0.875rem;">Loading...</div>`;
    return el;
  },

  skeleton(rows = 3) {
    const base = 'background:linear-gradient(90deg,#1a1d27 25%,#1f2233 50%,#1a1d27 75%);background-size:1000px 100%;animation:shimmer 1.5s infinite;border-radius:6px;';
    return `<div style="display:flex;flex-direction:column;gap:12px;padding:16px;">
      ${Array.from({ length: rows }, (_, i) => `
        <div style="${base}height:${i===0?'20px':'14px'};width:${i===0?'60%':['90%','75%','85%'][i%3]};"></div>
      `).join('')}
    </div>`;
  },

  cardSkeleton(count = 3) {
    return Array.from({ length: count }, () => `
      <div style="background:#1a1d27;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px;">
        ${this.skeleton(4)}
      </div>
    `).join('');
  },

  inline() {
    return `<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#f59e0b;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;"></span>`;
  },
};
