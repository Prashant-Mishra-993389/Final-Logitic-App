// js/pages/worker/earnings.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { StatCard } from '../../components/card.js';
import { Formatter } from '../../utils/formatter.js';
import { DateUtil } from '../../utils/date.js';
import { EmptyState } from '../../components/emptyState.js';
import { Loader } from '../../components/loader.js';

export async function earningsPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Earnings</h1></div>
        <div id="stats" class="grid-4" style="margin-bottom:1.5rem;">${Loader.cardSkeleton(4)}</div>
        <div class="section-card"><h2>Payment History</h2><div id="payment-list"></div></div>
      </div>
    `;

    const [quotesRes, paymentsRes] = await Promise.all([
      API.get('/quotes/my', { silent: true }),
      API.get('/payments/order/all', { silent: true }),
    ]);

    const quotes   = quotesRes.quotes   || quotesRes.data   || [];
    const payments = paymentsRes.payments || paymentsRes.data || [];

    const accepted = quotes.filter(q => q.status === 'accepted');
    const total    = accepted.reduce((s, q) => s + (q.totalAmount||0), 0);
    const paid     = payments.filter(p => p.status === 'success').reduce((s, p) => s + (p.amount||0), 0);

    document.getElementById('stats').innerHTML = [
      StatCard({ label:'Total Billed',    value: Formatter.currency(total),   icon:'💼', color:'#f59e0b' }),
      StatCard({ label:'Received',        value: Formatter.currency(paid),    icon:'💰', color:'#22c55e' }),
      StatCard({ label:'Jobs Won',        value: accepted.length,             icon:'🏆', color:'#3b82f6' }),
      StatCard({ label:'Quotes Sent',     value: quotes.length,               icon:'💬', color:'#a855f7' }),
    ].join('');

    const listEl = document.getElementById('payment-list');
    
    // Combine payments and accepted quotes for a complete view
    // We want to show what was paid and what is pending
    if (!payments.length && !accepted.length) { 
      listEl.innerHTML = EmptyState({ icon:'💰', title:'No earnings yet', message: 'Your completed jobs and payments will appear here.' }); 
      return; 
    }

    let html = '';

    // 1. Show Actual Payments first
    if (payments.length) {
      html += '<h3 style="font-size:0.9rem;color:#94a3b8;margin-bottom:1rem;text-transform:uppercase;letter-spacing:0.05em;">Received Payments</h3>';
      html += payments.map(p => {
        const order = p.orderId || {};
        const jobName = order.serviceId?.title || order.subcategoryId?.name || order.categoryId?.name || 'Service Job';
        const customer = order.customerId?.name || 'Customer';
        return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.1);border-radius:10px;margin-bottom:10px;">
          <div>
            <div style="font-weight:600;color:#f1f5f9;font-size:0.875rem;">${jobName}</div>
            <div style="color:#64748b;font-size:0.75rem;">From: ${customer} · ${DateUtil.format(p.createdAt)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1.1rem;font-weight:700;color:#22c55e;">+ ${Formatter.currency(p.amount)}</div>
            <div style="font-size:0.65rem;color:#64748b;text-transform:uppercase;">${p.status}</div>
          </div>
        </div>
        `;
      }).join('');
    }

    // 2. Show Pending Quotes (Accepted but not yet paid)
    const unpaidAccepted = accepted.filter(q => !payments.some(p => p.orderId?._id === q.orderId?._id));
    if (unpaidAccepted.length) {
      html += '<h3 style="font-size:0.9rem;color:#94a3b8;margin-top:1.5rem;margin-bottom:1rem;text-transform:uppercase;letter-spacing:0.05em;">Pending Payments</h3>';
      html += unpaidAccepted.map(q => {
        const order = q.orderId || {};
        const jobName = order.serviceId?.title || order.subcategoryId?.name || order.categoryId?.name || 'Service Job';
        const customer = order.customerId?.name || 'Customer';
        return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:10px;margin-bottom:10px;">
          <div>
            <div style="font-weight:600;color:#f1f5f9;font-size:0.875rem;">${jobName}</div>
            <div style="color:#64748b;font-size:0.75rem;">Client: ${customer} · Accepted: ${DateUtil.format(q.updatedAt)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1.1rem;font-weight:700;color:#94a3b8;">${Formatter.currency(q.totalAmount)}</div>
            <div style="font-size:0.65rem;color:#f59e0b;text-transform:uppercase;">unpaid</div>
          </div>
        </div>
        `;
      }).join('');
    }

    listEl.innerHTML = html;
  }, { title: 'Earnings' });
}
