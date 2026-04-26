// js/components/emptyState.js
export function EmptyState({ icon = '📭', title = 'Nothing here', message = '', action }) {
  return `<div style="
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:4rem 2rem;text-align:center;gap:1rem;min-height:300px;
  ">
    <div style="font-size:3.5rem;opacity:0.4;">${icon}</div>
    <h3 style="font-size:1.1rem;font-weight:600;color:#94a3b8;">${title}</h3>
    ${message ? `<p style="color:#64748b;font-size:0.875rem;max-width:320px;">${message}</p>` : ''}
    ${action ? `<button id="${action.id || 'empty-action-btn'}" class="btn btn-primary" style="margin-top:0.5rem;">${action.label}</button>` : ''}
  </div>`;
}
