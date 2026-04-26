// js/pages/customer/quotes.js — Quote comparison page
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Badge } from '../../components/badge.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';
import { Loader } from '../../components/loader.js';
import { EmptyState } from '../../components/emptyState.js';
import { Formatter } from '../../utils/formatter.js';
import { DateUtil } from '../../utils/date.js';
import { RatingStars } from '../../components/ratingStars.js';

function getOrderId() {
  const m = window.location.hash.match(/orderId=([^&]+)/);
  return m ? m[1] : null;
}

export async function quotesPage() {
  renderLayout(async (content) => {
    const orderId = getOrderId();

    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header">
          <div><h1>Quotes</h1><p>Review and accept worker quotes for your orders</p></div>
        </div>
        ${orderId ? '' : `
        <div class="section-card" style="margin-bottom:1rem;">
          <select id="order-select" style="
            width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
            border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;
          ">
            <option value="">Loading your orders...</option>
          </select>
        </div>`}
        <div id="quotes-container"></div>
      </div>
    `;

    // If no orderId, load orders picker
    if (!orderId) {
      const res = await API.get('/orders/my', { silent: true });
      const orders = (res.orders || res.data || []).filter(o => ['requested', 'quote_pending', 'quoted', 'assigned'].includes(o.status));
      const sel = document.getElementById('order-select');
      sel.innerHTML = `<option value="">-- Select Order --</option>` +
        orders.map(o => `<option value="${o._id}">${o.categoryId?.name} — ${DateUtil.format(o.createdAt)}</option>`).join('');
      sel.addEventListener('change', () => loadQuotes(sel.value));
    } else {
      loadQuotes(orderId);
    }

    async function loadQuotes(oId) {
      if (!oId) return;
      const container = document.getElementById('quotes-container');
      container.innerHTML = `<div style="padding:1rem;">${Loader.skeleton(4)}</div>`;
      const res = await API.get(`/quotes/order/${oId}`, { silent: true });
      const quotes = res.quotes || res.data || [];

      if (!quotes.length) {
        container.innerHTML = EmptyState({ icon:'💬', title:'No quotes yet', message:'Workers will send quotes once they review your order. Check back soon.' });
        return;
      }

      container.innerHTML = `<div class="grid-2">${quotes.map(q => quoteCard(q, oId)).join('')}</div>`;

      // Bind accept/reject
      container.querySelectorAll('[data-accept]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const qId = btn.dataset.accept;
          const r = await API.patch(`/quotes/${qId}/status`, { status: 'accepted' });
          if (r.success) { Toast.success('Quote accepted! Proceed to payment.'); loadQuotes(oId); }
        });
      });
      container.querySelectorAll('[data-reject]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const qId = btn.dataset.reject;
          Modal.confirm({ title:'Reject Quote', message:'Reject this quote?', danger:true,
            onConfirm: async () => {
              const r = await API.patch(`/quotes/${qId}/status`, { status: 'rejected' });
              if (r.success) { Toast.info('Quote rejected'); loadQuotes(oId); }
            }
          });
        });
      });
    }
  }, { title: 'Quotes' });
}

function quoteCard(q, orderId) {
  const isAccepted = q.status === 'accepted';
  const isPending  = q.status === 'pending';
  return `
    <div style="
      background:#1a1d27;border:1px solid ${isAccepted ? '#22c55e' : 'rgba(255,255,255,0.07)'};
      border-radius:14px;padding:1.25rem;position:relative;
      ${isAccepted ? 'box-shadow:0 0 20px rgba(34,197,94,0.1);' : ''}
    ">
      ${isAccepted ? '<div style="position:absolute;top:12px;right:12px;background:#22c55e;color:#fff;font-size:0.7rem;font-weight:700;padding:3px 8px;border-radius:99px;">✓ ACCEPTED</div>' : ''}
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:1rem;">
        <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#2563eb);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:0.9rem;">
          ${Formatter.initials(q.providerId?.name || '?')}
        </div>
        <div>
          <div style="font-weight:600;color:#f1f5f9;">${q.providerId?.name || 'Worker'}</div>
          <div style="font-size:0.75rem;color:#64748b;">${RatingStars(q.providerId?.rating || 0, 5, 12)}</div>
        </div>
      </div>
      <div style="font-size:2rem;font-weight:800;color:#f59e0b;margin-bottom:6px;">${Formatter.currency(q.totalAmount)}</div>
      ${q.estimatedTimeText ? `<div style="font-size:0.8rem;color:#64748b;margin-bottom:8px;">⏱ Est. ${q.estimatedTimeText}</div>` : ''}
      ${q.notes ? `<div style="font-size:0.82rem;color:#94a3b8;background:rgba(255,255,255,0.03);border-radius:8px;padding:10px;margin-bottom:12px;">"${q.notes}"</div>` : ''}
      <div style="font-size:0.72rem;color:#64748b;margin-bottom:12px;">${DateUtil.relative(q.createdAt)}</div>
      ${isPending ? `
        <div style="display:flex;gap:8px;">
          <button data-reject="${q._id}" class="btn btn-danger btn-sm" style="flex:1;justify-content:center;">✕ Reject</button>
          <button data-accept="${q._id}" class="btn btn-success btn-sm" style="flex:1;justify-content:center;">✓ Accept</button>
        </div>
      ` : Badge(q.status)}
    </div>
  `;
}
