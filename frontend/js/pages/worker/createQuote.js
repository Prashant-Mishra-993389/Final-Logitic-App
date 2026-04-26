// js/pages/worker/createQuote.js — Worker quote management
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Badge } from '../../components/badge.js';
import { EmptyState } from '../../components/emptyState.js';
import { Formatter } from '../../utils/formatter.js';
import { DateUtil } from '../../utils/date.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';

export async function createQuotePage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>My Quotes</h1><p>Track all your submitted quotes</p></div>
        <div id="quotes-grid"></div>
      </div>
    `;

    const res = await API.get('/quotes/my', { silent: true });
    const quotes = res.quotes || res.data || [];

    const container = document.getElementById('quotes-grid');
    if (!quotes.length) { container.innerHTML = EmptyState({ icon:'💬', title:'No quotes yet', message:'Browse available jobs and submit your first quote.' }); return; }

    container.innerHTML = `<div class="grid-2">${quotes.map(q => `
      <div style="background:#1a1d27;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:1.25rem;">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <div>
            <div style="font-weight:700;color:#f1f5f9;">${q.orderId?.serviceId?.title || q.orderId?.subcategoryId?.name || q.orderId?.categoryId?.name || 'Job'} (for ${q.orderId?.customerId?.name || 'Customer'})</div>
            <div style="color:#64748b;font-size:0.75rem;">${DateUtil.relative(q.createdAt)}</div>
          </div>
          ${Badge(q.status)}
        </div>
        <div style="font-size:1.5rem;font-weight:800;color:#f59e0b;margin-bottom:6px;">${Formatter.currency(q.totalAmount)}</div>
        ${q.estimatedTimeText ? `<div style="color:#64748b;font-size:0.8rem;margin-bottom:8px;">⏱ ${q.estimatedTimeText}</div>` : ''}
        ${q.notes ? `<div style="color:#94a3b8;font-size:0.8rem;margin-bottom:10px;">"${q.notes}"</div>` : ''}
        ${q.status === 'pending' ? `
        <div style="display:flex;gap:8px;">
          <button data-del="${q._id}" class="btn btn-danger btn-sm">Delete</button>
        </div>` : ''}
      </div>
    `).join('')}</div>`;

    container.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        Modal.confirm({ title:'Delete Quote', message:'Remove this quote?', danger:true,
          onConfirm: async () => {
            const r = await API.delete(`/quotes/${btn.dataset.del}`);
            if (r.success) { Toast.success('Quote deleted'); createQuotePage(); }
          }
        });
      });
    });
  }, { title: 'My Quotes' });
}
