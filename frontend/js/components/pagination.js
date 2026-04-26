// js/components/pagination.js
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return '';
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    const active = i === page;
    pages.push(`<button data-page="${i}" style="
      padding:6px 12px;border-radius:7px;font-size:0.8rem;font-weight:${active?700:400};
      background:${active?'#f59e0b':'rgba(255,255,255,0.05)'};
      color:${active?'#0d0f14':'#94a3b8'};border:1px solid ${active?'#f59e0b':'rgba(255,255,255,0.08)'};
      cursor:pointer;transition:all 0.15s;
    ">${i}</button>`);
  }
  return `<div id="pagination-container" style="display:flex;align-items:center;gap:6px;justify-content:center;padding:1rem 0;">
    <button data-page="${page-1}" ${page<=1?'disabled':''} style="
      padding:6px 10px;border-radius:7px;font-size:0.8rem;
      background:rgba(255,255,255,0.05);color:#94a3b8;
      border:1px solid rgba(255,255,255,0.08);cursor:pointer;opacity:${page<=1?0.4:1};
    ">‹</button>
    ${pages.join('')}
    <button data-page="${page+1}" ${page>=totalPages?'disabled':''} style="
      padding:6px 10px;border-radius:7px;font-size:0.8rem;
      background:rgba(255,255,255,0.05);color:#94a3b8;
      border:1px solid rgba(255,255,255,0.08);cursor:pointer;opacity:${page>=totalPages?0.4:1};
    ">›</button>
    <span style="color:#64748b;font-size:0.8rem;margin-left:8px;">Page ${page} of ${totalPages}</span>
  </div>`;
}

export function bindPagination(container, onPageChange) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled) return;
    const p = parseInt(btn.dataset.page);
    if (!isNaN(p)) onPageChange(p);
  });
}
