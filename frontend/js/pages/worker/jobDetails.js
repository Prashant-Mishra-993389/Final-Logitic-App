// js/pages/worker/jobDetails.js
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
  const m = hash.match(/#\/worker\/job\/([^/]+)/);
  return m ? m[1] : null;
}

export async function workerJobDetailsPage() {
  renderLayout(async (content) => {
    const orderId = getOrderId();
    if (!orderId) { Router.push('#/worker/assigned-jobs'); return; }

    content.innerHTML = `<div style="padding:1rem;">${Loader.skeleton(8)}</div>`;
    const res = await API.get(`/orders/${orderId}`);
    const order = res.order || res.data;
    if (!order) { content.innerHTML = '<div style="text-align:center;padding:4rem;color:#64748b;">Job not found</div>'; return; }

    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header">
          <div>
            <h1>Job Details</h1>
            <p>Order ID: <code style="color:#f59e0b;font-family:JetBrains Mono,monospace;">${order._id}</code></p>
          </div>
          <div style="display:flex;gap:8px;">
            ${Badge(order.status)}
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
                ${infoRow('Scheduled',   order.scheduledAt ? DateUtil.formatDateTime(order.scheduledAt) : '-')}
                ${infoRow('Created',     DateUtil.formatDateTime(order.createdAt))}
              </div>
              ${order.description ? `<div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;color:#94a3b8;font-size:0.875rem;">${order.description}</div>` : ''}
            </div>

            <div class="section-card">
              <h2>Customer Details</h2>
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <div style="width:48px;height:48px;border-radius:50%;background:rgba(245,158,11,0.1);color:#f59e0b;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.2rem;">
                  ${Formatter.initials(order.customerId?.name || 'C')}
                </div>
                <div>
                  <div style="font-weight:700;color:#f1f5f9;font-size:1rem;">${order.customerId?.name || 'Customer'}</div>
                  <div style="font-size:0.82rem;color:#64748b;">${order.customerId?.phone || ''}</div>
                </div>
              </div>
              <div style="display:flex;gap:8px;">
                <a href="tel:${order.customerId?.phone}" class="btn btn-secondary btn-sm" style="flex:1;justify-content:center;">📞 Call</a>
                <a href="#/worker/chat?orderId=${order._id}" class="btn btn-primary btn-sm" style="flex:1;justify-content:center;">💬 Chat</a>
              </div>
            </div>

            ${order.answers?.length ? `
            <div class="section-card">
              <h2>Requirement Details</h2>
              <div style="display:grid;gap:10px;">
                ${order.answers.map(a => `
                  <div>
                    <div style="font-size:0.75rem;color:#64748b;">${a.label}</div>
                    <div style="font-size:0.875rem;color:#f1f5f9;font-weight:500;">${a.value}</div>
                  </div>
                `).join('')}
              </div>
            </div>` : ''}
          </div>

          <div>
            <div class="section-card">
              <h2>Actions</h2>
              <div style="display:grid;gap:10px;">
                ${order.status === 'assigned' ? `
                  <button id="start-job-btn" class="btn btn-primary" style="width:100%;justify-content:center;">▶ Start Job</button>
                ` : ''}
                ${['accepted','in_progress','reached','on_the_way'].includes(order.status) ? `
                  <button id="complete-job-btn" class="btn btn-success" style="width:100%;justify-content:center;">✓ Complete Job</button>
                ` : ''}
                <a href="#/worker/tracking?orderId=${order._id}" class="btn btn-secondary" style="width:100%;justify-content:center;">📍 Tracking Page</a>
              </div>
            </div>

            <div class="section-card">
              <h2>Payment Status</h2>
              <div style="font-size:1.5rem;font-weight:800;color:${order.payment ? '#22c55e' : '#f59e0b'};margin-bottom:8px;">
                ${Formatter.currency(order.finalPrice || order.budget || 0)}
              </div>
              ${order.payment ? Badge('paid') : Badge('payment_pending')}
            </div>

            <div class="section-card">
              <h2>Job Timeline</h2>
              <div id="timeline-container">${renderTimeline(order.timeline || [])}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('start-job-btn')?.addEventListener('click', async () => {
      const r = await API.patch(`/orders/${orderId}/status`, { status: 'in_progress' });
      if (r.success) { Toast.success('Job started!'); workerJobDetailsPage(); }
    });

    document.getElementById('complete-job-btn')?.addEventListener('click', () => {
      Modal.confirm({
        title: 'Complete Job',
        message: 'Are you sure you want to mark this job as completed?',
        onConfirm: async () => {
          const r = await API.patch(`/orders/${orderId}/status`, { status: 'completed' });
          if (r.success) { Toast.success('Job completed!'); workerJobDetailsPage(); }
        }
      });
    });
  }, { title: 'Job Details' });
}

function infoRow(label, value) {
  return `<div><div style="font-size:0.75rem;color:#64748b;margin-bottom:3px;">${label}</div><div style="font-size:0.875rem;font-weight:500;color:#f1f5f9;">${value}</div></div>`;
}

function renderTimeline(timeline) {
  if (!timeline.length) return '<div style="color:#64748b;font-size:0.85rem;">No updates yet</div>';
  return timeline.map((t, i) => `
    <div class="timeline-item">
      <div class="timeline-dot" style="${i===0?'background:#22c55e;':i===timeline.length-1?'':'background:#3b82f6;'}"></div>
      <div style="font-size:0.85rem;font-weight:600;color:#f1f5f9;">${t.status || t.title || 'Update'}</div>
      <div style="font-size:0.75rem;color:#64748b;margin-top:2px;">${t.note || t.message || ''}</div>
      <div style="font-size:0.72rem;color:#475569;margin-top:2px;">${DateUtil.relative(t.at || t.timestamp || t.createdAt)}</div>
    </div>
  `).join('');
}
