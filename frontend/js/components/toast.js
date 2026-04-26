// js/components/toast.js — Toast notification system
export const Toast = {
  show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const colors = {
      success: { bg: '#22c55e', icon: '✓' },
      error:   { bg: '#ef4444', icon: '✕' },
      warning: { bg: '#f59e0b', icon: '⚠' },
      info:    { bg: '#3b82f6', icon: 'ℹ' },
    };
    const c = colors[type] || colors.info;
    const toast = document.createElement('div');
    toast.style.cssText = `
      pointer-events:all;display:flex;align-items:center;gap:10px;
      background:#1a1d27;border:1px solid rgba(255,255,255,0.08);
      border-left:3px solid ${c.bg};border-radius:10px;
      padding:12px 16px;min-width:280px;max-width:380px;
      box-shadow:0 8px 32px rgba(0,0,0,0.4);
      animation:toastIn 0.3s ease forwards;
      font-family:Inter,sans-serif;font-size:0.875rem;color:#f1f5f9;
    `;
    toast.innerHTML = `
      <span style="color:${c.bg};font-weight:700;font-size:1rem;">${c.icon}</span>
      <span style="flex:1">${message}</span>
      <button class="toast-close-btn" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:1rem;padding:0;line-height:1;">×</button>
    `;
    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  success: (msg) => Toast.show(msg, 'success'),
  error:   (msg) => Toast.show(msg, 'error'),
  warning: (msg) => Toast.show(msg, 'warning'),
  info:    (msg) => Toast.show(msg, 'info'),
};
