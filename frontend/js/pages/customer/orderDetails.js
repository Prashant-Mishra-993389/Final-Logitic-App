// js/pages/customer/orderDetails.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Badge } from '../../components/badge.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';
import { Loader } from '../../components/loader.js';
import { DateUtil } from '../../utils/date.js';
import { Formatter } from '../../utils/formatter.js';
import { Router } from '../../core/router.js';

function getOrderId() {
  const hash = window.location.hash;
  const m = hash.match(/#\/customer\/order\/([^/]+)/);
  return m ? m[1] : null;
}

export async function orderDetailsPage() {
  renderLayout(async (content) => {
    const orderId = getOrderId();
    if (!orderId) { Router.push('#/customer/orders'); return; }

    content.innerHTML = `<div style="padding:1rem;">${Loader.skeleton(8)}</div>`;
    const res = await API.get(`/orders/${orderId}`);
    const order = res.order || res.data;
    if (!order) { content.innerHTML = '<div style="text-align:center;padding:4rem;color:#64748b;">Order not found</div>'; return; }

    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header">
          <div>
            <h1>Order Details</h1>
            <p>Order ID: <code style="color:#f59e0b;font-family:JetBrains Mono,monospace;">${order._id}</code></p>
          </div>
          <div style="display:flex;gap:8px;">
            ${Badge(order.status)}
            ${order.status === 'pending' ? `<button id="cancel-btn" class="btn btn-danger btn-sm">Cancel Order</button>` : ''}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:2fr 1fr;gap:1.25rem;">
          <div>
            <div class="section-card">
              <h2>Service Details</h2>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                ${infoRow('Category',    order.categoryId?.name || '-')}
                ${infoRow('Subcategory', order.subcategoryId?.name || '-')}
                ${infoRow('Service',     order.serviceId?.name || 'Any')}
                ${infoRow('Location',    order.location?.address || '-')}
                ${infoRow('Preferred Date', order.preferredDate ? DateUtil.format(order.preferredDate) : '-')}
                ${infoRow('Created',     DateUtil.formatDateTime(order.createdAt))}
              </div>
              ${order.description ? `<div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;color:#94a3b8;font-size:0.875rem;">${order.description}</div>` : ''}
            </div>

            <div class="section-card">
              <h2>Order Timeline</h2>
              <div id="timeline-container">${renderTimeline(order.timeline || [])}</div>
            </div>

            ${order.attachments?.length ? `
            <div class="section-card">
              <h2>Attachments</h2>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${order.attachments.map(url => `
                  <a href="${url}" target="_blank" style="display:block;width:80px;height:80px;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
                    <img src="${url}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentNode.innerHTML='📄'" />
                  </a>
                `).join('')}
              </div>
            </div>` : ''}
          </div>

          <div>
            <div class="section-card">
              <h2>Worker</h2>
              ${order.providerId ? `
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                  <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#2563eb);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;">
                    ${Formatter.initials(order.providerId.name)}
                  </div>
                  <div>
                    <div style="font-weight:600;color:#f1f5f9;">${order.providerId.name}</div>
                    <div style="font-size:0.75rem;color:#64748b;">${order.providerId.phone || ''}</div>
                  </div>
                </div>
                <div style="display:flex;gap:8px;">
                  <a href="#/customer/chat?orderId=${order._id}" class="btn btn-secondary btn-sm" style="flex:1;justify-content:center;">💬 Chat</a>
                  ${['in_progress','assigned'].includes(order.status) ? `<a href="#/customer/tracking?orderId=${order._id}" class="btn btn-primary btn-sm" style="flex:1;justify-content:center;">📍 Track</a>` : ''}
                </div>
              ` : `<div style="color:#64748b;font-size:0.85rem;">Not assigned yet</div>`}
            </div>

            <div class="section-card">
              <h2>Payment</h2>
              ${order.payment ? `
                <div style="font-size:1.5rem;font-weight:800;color:#22c55e;margin-bottom:8px;">${Formatter.currency(order.payment.amount)}</div>
                ${Badge(order.payment.status)}
              ` : order.acceptedQuote ? `
                <div style="font-size:1.5rem;font-weight:800;color:#f59e0b;margin-bottom:8px;">${Formatter.currency(order.acceptedQuote.amount)}</div>
                <a href="#/customer/payment?orderId=${order._id}" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:8px;">Pay Now</a>
              ` : `<div style="color:#64748b;font-size:0.85rem;">Awaiting quote acceptance</div>`}
            </div>

            ${order.status === 'completed' && !order.review ? `
            <div class="section-card">
              <h2>Rate Service</h2>
              <a href="#/customer/reviews?orderId=${order._id}" class="btn btn-primary" style="width:100%;justify-content:center;">⭐ Leave Review</a>
            </div>` : ''}
          </div>
        </div>
      </div>
    `;

    document.getElementById('cancel-btn')?.addEventListener('click', () => {
      Modal.confirm({
        title: 'Cancel Order',
        message: 'Are you sure you want to cancel this order?',
        danger: true,
        onConfirm: async () => {
          const r = await API.patch(`/orders/${orderId}/cancel`);
          if (r.success) { Toast.success('Order cancelled'); orderDetailsPage(); }
        }
      });
    });
  }, { title: 'Order Details' });
}

function infoRow(label, value) {
  return `<div><div style="font-size:0.75rem;color:#64748b;margin-bottom:3px;">${label}</div><div style="font-size:0.875rem;font-weight:500;color:#f1f5f9;">${value}</div></div>`;
}

function renderTimeline(timeline) {
  if (!timeline.length) return '<div style="color:#64748b;font-size:0.85rem;">No timeline events yet</div>';
  return timeline.map((t, i) => `
    <div class="timeline-item">
      <div class="timeline-dot" style="${i===0?'background:#22c55e;':i===timeline.length-1?'':'background:#3b82f6;'}"></div>
      <div style="font-size:0.85rem;font-weight:600;color:#f1f5f9;">${t.status || t.title || 'Update'}</div>
      <div style="font-size:0.75rem;color:#64748b;margin-top:2px;">${t.note || t.message || ''}</div>
      <div style="font-size:0.72rem;color:#475569;margin-top:2px;">${DateUtil.relative(t.createdAt || t.timestamp)}</div>
    </div>
  `).join('');
}
