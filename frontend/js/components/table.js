// js/components/table.js — Data table component
import { Loader } from './loader.js';
import { EmptyState } from './emptyState.js';

export function Table({ columns, rows, loading, emptyIcon, emptyTitle, onRowClick }) {
  if (loading) return `<div style="padding:2rem;">${Loader.skeleton(5)}</div>`;
  if (!rows || !rows.length) return EmptyState({ icon: emptyIcon || '📋', title: emptyTitle || 'No records found' });

  const thead = columns.map(c =>
    `<th style="padding:10px 14px;text-align:left;font-size:0.75rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap;">${c.label}</th>`
  ).join('');

  const tbody = rows.map((row, ri) => {
    const tds = columns.map(c => {
      const val = typeof c.render === 'function' ? c.render(row[c.key], row) : (row[c.key] ?? '-');
      return `<td style="padding:12px 14px;font-size:0.85rem;color:#f1f5f9;border-top:1px solid rgba(255,255,255,0.05);white-space:nowrap;">${val}</td>`;
    }).join('');
    return `<tr data-row="${ri}" style="transition:background 0.15s;${onRowClick?'cursor:pointer;':''}" 
      onmouseenter="this.style.background='rgba(255,255,255,0.03)'" 
      onmouseleave="this.style.background=''"
    >${tds}</tr>`;
  }).join('');

  return `<div style="overflow-x:auto;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
    <table style="width:100%;border-collapse:collapse;font-family:Inter,sans-serif;">
      <thead style="background:#13161e;">
        <tr>${thead}</tr>
      </thead>
      <tbody>${tbody}</tbody>
    </table>
  </div>`;
}

export function bindTableRowClick(tableHtml, rows, onRowClick) {
  // Used after rendering to attach click handlers
  const container = typeof tableHtml === 'string' ? null : tableHtml;
  if (!container) return;
  container.querySelectorAll('tbody tr[data-row]').forEach(tr => {
    tr.addEventListener('click', () => {
      const idx = parseInt(tr.dataset.row);
      onRowClick(rows[idx], idx);
    });
  });
}
