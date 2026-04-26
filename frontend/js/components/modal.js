// js/components/modal.js — Modal system
const root = () => document.getElementById('modal-root');

export const Modal = {
  show({ title, content, footer, size = '520px', id = 'modal-main', onClose }) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.style.cssText = `
      pointer-events:all;position:absolute;inset:0;
      background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);
      display:flex;align-items:center;justify-content:center;padding:1rem;
      animation:fadeIn 0.2s ease;
    `;

    overlay.innerHTML = `
      <div style="
        background:#1a1d27;border:1px solid rgba(255,255,255,0.08);
        border-radius:16px;width:100%;max-width:${size};max-height:90vh;
        display:flex;flex-direction:column;animation:modalIn 0.25s ease;
        box-shadow:0 20px 60px rgba(0,0,0,0.6);
      ">
        <div style="
          display:flex;align-items:center;justify-content:space-between;
          padding:1.25rem 1.5rem;border-bottom:1px solid rgba(255,255,255,0.07);
        ">
          <h3 style="font-size:1.05rem;font-weight:700;color:#f1f5f9;">${title || ''}</h3>
          <button id="${id}-close" style="
            background:rgba(255,255,255,0.05);border:none;border-radius:7px;
            color:#94a3b8;cursor:pointer;width:30px;height:30px;font-size:1.1rem;
            display:flex;align-items:center;justify-content:center;transition:all 0.15s;
          ">×</button>
        </div>
        <div style="padding:1.5rem;overflow-y:auto;flex:1;" id="${id}-body">${content || ''}</div>
        ${footer ? `<div style="padding:1rem 1.5rem;border-top:1px solid rgba(255,255,255,0.07);">${footer}</div>` : ''}
      </div>
    `;

    const close = () => { overlay.remove(); onClose?.(); };
    overlay.querySelector(`#${id}-close`).addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    root().style.pointerEvents = 'all';
    root().appendChild(overlay);
    return { close, overlay };
  },

  close(id = 'modal-main') {
    document.getElementById(id)?.remove();
    if (!root().children.length) root().style.pointerEvents = 'none';
  },

  closeAll() {
    root().innerHTML = '';
    root().style.pointerEvents = 'none';
  },

  confirm({ title, message, onConfirm, danger = false }) {
    const { close } = this.show({
      title: title || 'Confirm',
      content: `<p style="color:#94a3b8;font-size:0.9rem;">${message}</p>`,
      footer: `
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button id="modal-cancel-btn" style="padding:8px 18px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#94a3b8;cursor:pointer;font-size:0.875rem;">Cancel</button>
          <button id="modal-confirm-btn" style="padding:8px 18px;background:${danger?'#ef4444':'#f59e0b'};border:none;border-radius:8px;color:${danger?'#fff':'#0d0f14'};cursor:pointer;font-weight:600;font-size:0.875rem;">Confirm</button>
        </div>`,
    });
    document.getElementById('modal-cancel-btn')?.addEventListener('click', close);
    document.getElementById('modal-confirm-btn')?.addEventListener('click', () => { close(); onConfirm?.(); });
  },
};
