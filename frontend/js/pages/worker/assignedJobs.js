// js/pages/worker/assignedJobs.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Badge } from '../../components/badge.js';
import { Toast } from '../../components/toast.js';
import { EmptyState } from '../../components/emptyState.js';
import { Loader } from '../../components/loader.js';
import { DateUtil } from '../../utils/date.js';
import { Modal } from '../../components/modal.js';

export async function assignedJobsPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>My Assigned Jobs</h1></div>
        <div id="jobs-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1rem;">
          ${Loader.cardSkeleton(3)}
        </div>
      </div>
    `;

    const res = await API.get('/orders/my', { silent: true });
    // Show jobs that are assigned, in_progress, accepted (paid), reached, etc.
    const jobs = (res.orders || res.data || []).filter(o =>
      ['assigned','accepted','in_progress','reached','picked_up','on_the_way'].includes(o.status)
    );

    const listEl = document.getElementById('jobs-list');
    if (!jobs.length) { listEl.innerHTML = EmptyState({ icon:'🔧', title:'No assigned jobs', message:'Accept a quote to get assigned.' }); return; }

    listEl.innerHTML = jobs.map(j => {
      const jobName = j.serviceId?.title || j.subcategoryId?.name || j.categoryId?.name || 'Service Job';
      const customer = j.customerId?.name || 'Customer';
      
      // Determine action buttons based on status
      let actionBtns = '';
      if (j.status === 'assigned') {
        actionBtns = `<button data-start="${j._id}" class="btn btn-primary btn-sm">▶ Start Job</button>`;
      } else if (j.status === 'accepted' || j.status === 'in_progress') {
        actionBtns = `<button data-complete="${j._id}" class="btn btn-success btn-sm">✓ Mark Complete</button>`;
      } else if (j.status === 'reached' || j.status === 'on_the_way') {
        actionBtns = `<button data-complete="${j._id}" class="btn btn-success btn-sm">✓ Mark Complete</button>`;
      }

      return `
        <div style="background:#1a1d27;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:1.25rem;">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <div>
              <div style="font-weight:700;color:#f1f5f9;">${jobName}</div>
              <div style="color:#64748b;font-size:0.78rem;">Customer: ${customer} · ${DateUtil.format(j.createdAt)}</div>
            </div>
            ${Badge(j.status)}
          </div>
          <div style="color:#94a3b8;font-size:0.82rem;margin-bottom:12px;">${(j.description||'').slice(0,100)}${j.description?.length>100?'…':''}</div>
          <div style="color:#64748b;font-size:0.78rem;margin-bottom:12px;">📍 ${j.location?.address || '-'}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${actionBtns}
            <a href="#/worker/chat?orderId=${j._id}" class="btn btn-secondary btn-sm">💬 Chat</a>
            <a href="#/worker/tracking?orderId=${j._id}" class="btn btn-secondary btn-sm">📍 Track</a>
          </div>
        </div>
      `;
    }).join('');

    // Start job
    listEl.querySelectorAll('[data-start]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const r = await API.patch(`/orders/${btn.dataset.start}/status`, { status: 'in_progress' });
        if (r.success) { Toast.success('Job started!'); assignedJobsPage(); }
        else Toast.error(r.message || 'Failed to start job');
      });
    });

    // Complete job
    listEl.querySelectorAll('[data-complete]').forEach(btn => {
      btn.addEventListener('click', () => {
        Modal.confirm({
          title: 'Mark as Completed',
          message: 'Confirm you have completed this job?',
          onConfirm: async () => {
            const r = await API.patch(`/orders/${btn.dataset.complete}/status`, { status: 'completed' });
            if (r.success) { Toast.success('Job marked as completed! You can now update your availability.'); assignedJobsPage(); }
            else Toast.error(r.message || 'Failed to complete job');
          }
        });
      });
    });
  }, { title: 'Assigned Jobs' });
}
