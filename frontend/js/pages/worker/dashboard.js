// js/pages/worker/dashboard.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Auth } from '../../core/auth.js';
import { StatCard } from '../../components/card.js';
import { Badge } from '../../components/badge.js';
import { Formatter } from '../../utils/formatter.js';
import { DateUtil } from '../../utils/date.js';
import { Loader } from '../../components/loader.js';

export async function workerDashboard() {
  renderLayout(async (content) => {
    const user = Auth.getUser();
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header">
          <div><h1>Worker Dashboard</h1><p>Manage your jobs and earnings</p></div>
          <a href="#/worker/available-jobs" class="btn btn-primary">Browse Jobs</a>
        </div>
        <div id="stats-grid" class="grid-4" style="margin-bottom:1.5rem;">${Loader.cardSkeleton(4)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
          <div class="section-card"><h2>Recent Assignments</h2><div id="recent-jobs"></div></div>
          <div class="section-card"><h2>Quick Actions</h2><div id="quick-actions"></div></div>
        </div>
      </div>
    `;

    const res = await API.get('/orders/my', { silent: true });
    const orders = res.orders || res.data || [];
    const active   = orders.filter(o => ['assigned','in_progress'].includes(o.status)).length;
    const done     = orders.filter(o => o.status === 'completed').length;
    const pending  = orders.filter(o => o.status === 'pending').length;

    // Get quotes for earnings estimate
    const qRes = await API.get('/quotes/my', { silent: true });
    const accepted = (qRes.quotes || qRes.data || []).filter(q => q.status === 'accepted');
    const earnings = accepted.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    document.getElementById('stats-grid').innerHTML = [
      StatCard({ label:'Active Jobs',  value: active,               icon:'⚡', color:'#3b82f6' }),
      StatCard({ label:'Completed',    value: done,                 icon:'✅', color:'#22c55e' }),
      StatCard({ label:'Pending Bids', value: pending,              icon:'💬', color:'#f59e0b' }),
      StatCard({ label:'Est. Earnings',value: Formatter.currency(earnings), icon:'💰', color:'#a855f7' }),
    ].join('');

    const jobsEl = document.getElementById('recent-jobs');
    const recent = orders.slice(0, 5);
    if (!recent.length) {
      jobsEl.innerHTML = `<div style="text-align:center;padding:2rem;color:#64748b;font-size:0.85rem;">No jobs yet. <a href="#/worker/available-jobs" style="color:#f59e0b;">Browse available jobs</a></div>`;
    } else {
      jobsEl.innerHTML = recent.map(o => `
        <a href="#/worker/job/${o._id}" style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-decoration:none;" onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'">
          <div>
            <div style="font-size:0.875rem;font-weight:600;color:#f1f5f9;">${o.serviceId?.title || o.subcategoryId?.name || o.categoryId?.name || 'Service Job'}</div>
            <div style="font-size:0.75rem;color:#64748b;">Customer: ${o.customerId?.name || 'User'} · ${DateUtil.relative(o.createdAt)}</div>
          </div>
          ${Badge(o.status)}
        </a>
      `).join('');
    }

    document.getElementById('quick-actions').innerHTML = [
      { href:'#/worker/available-jobs', icon:'📦', label:'Browse Available Jobs', color:'#f59e0b' },
      { href:'#/worker/assigned-jobs',  icon:'🔧', label:'My Assigned Jobs',      color:'#3b82f6' },
      { href:'#/worker/earnings',       icon:'💰', label:'View Earnings',         color:'#22c55e' },
      { href:'#/worker/documents',      icon:'📄', label:'Upload Documents',      color:'#a855f7' },
    ].map(a => `
      <a href="${a.href}" style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;text-decoration:none;margin-bottom:8px;transition:all 0.15s;" onmouseenter="this.style.background='rgba(255,255,255,0.05)'" onmouseleave="this.style.background='rgba(255,255,255,0.02)'">
        <div style="width:36px;height:36px;border-radius:9px;background:${a.color}22;display:flex;align-items:center;justify-content:center;font-size:1rem;">${a.icon}</div>
        <span style="font-size:0.875rem;font-weight:500;color:#f1f5f9;">${a.label}</span>
        <span style="margin-left:auto;color:#64748b;">→</span>
      </a>
    `).join('');
  }, { title: 'Dashboard' });
}
