// js/pages/admin/dashboard.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { StatCard } from '../../components/card.js';
import { Formatter } from '../../utils/formatter.js';
import { Loader } from '../../components/loader.js';

export async function adminDashboard() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Admin Dashboard</h1><p>Platform overview and statistics</p></div>
        <div id="stats-grid" class="grid-4" style="margin-bottom:1.5rem;">${Loader.cardSkeleton(4)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
          <div class="section-card"><h2>Recent Orders</h2><div id="recent-orders"></div></div>
          <div class="section-card"><h2>Pending Verifications</h2><div id="pending-workers"></div></div>
        </div>
        <div class="section-card" style="margin-top:1.25rem;">
          <h2>Quick Management</h2>
          <div id="quick-links" class="grid-4"></div>
        </div>
      </div>
    `;

    const res = await API.get('/admin/stats', { silent: true });
    const stats = res.stats || res.data || res || {};

    document.getElementById('stats-grid').innerHTML = [
      StatCard({ label:'Total Users',    value: stats.totalUsers    || 0, icon:'👥', color:'#3b82f6' }),
      StatCard({ label:'Total Orders',   value: stats.totalOrders   || 0, icon:'📋', color:'#f59e0b' }),
      StatCard({ label:'Total Revenue',  value: Formatter.currency(stats.totalRevenue || 0), icon:'💰', color:'#22c55e' }),
      StatCard({ label:'Active Workers', value: stats.activeWorkers || 0, icon:'🔧', color:'#a855f7' }),
    ].join('');

    // Recent orders
    const ordersRes = await API.get('/admin/orders', { silent: true });
    const orders = (ordersRes.orders || ordersRes.data || []).slice(0, 5);
    const ordersEl = document.getElementById('recent-orders');
    ordersEl.innerHTML = orders.length ? orders.map(o => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <div>
          <div style="font-size:0.875rem;font-weight:600;color:#f1f5f9;">${o.categoryId?.name || 'Order'}</div>
          <div style="font-size:0.75rem;color:#64748b;">${o.customerId?.name || ''}</div>
        </div>
        <span style="font-size:0.75rem;padding:3px 8px;border-radius:99px;background:rgba(245,158,11,0.1);color:#f59e0b;">${o.status}</span>
      </div>
    `).join('') : '<div style="color:#64748b;font-size:0.85rem;">No orders yet</div>';

    // Pending workers
    const workersRes = await API.get('/admin/users', { silent: true });
    const pending = (workersRes.users || workersRes.data || []).filter(u => u.role==='worker' && u.workerProfile?.verificationStatus==='pending').slice(0,5);
    const workersEl = document.getElementById('pending-workers');
    workersEl.innerHTML = pending.length ? pending.map(w => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <div style="font-size:0.875rem;font-weight:600;color:#f1f5f9;">${w.name}</div>
        <div style="display:flex;gap:6px;">
          <button data-approve="${w._id}" class="btn btn-success btn-sm">Approve</button>
          <button data-reject="${w._id}" class="btn btn-danger btn-sm">Reject</button>
        </div>
      </div>
    `).join('') : '<div style="color:#64748b;font-size:0.85rem;padding:0.5rem 0;">No pending verifications</div>';

    workersEl.querySelectorAll('[data-approve]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await API.patch(`/admin/workers/${btn.dataset.approve}/approve`);
        adminDashboard();
      });
    });
    workersEl.querySelectorAll('[data-reject]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await API.patch(`/admin/workers/${btn.dataset.reject}/reject`);
        adminDashboard();
      });
    });

    document.getElementById('quick-links').innerHTML = [
      { href:'#/admin/users',       icon:'👥', label:'Users' },
      { href:'#/admin/workers',     icon:'🔧', label:'Workers' },
      { href:'#/admin/categories',  icon:'📁', label:'Categories' },
      { href:'#/admin/orders',      icon:'📋', label:'Orders' },
      { href:'#/admin/payments',    icon:'💳', label:'Payments' },
      { href:'#/admin/support',     icon:'🎧', label:'Support' },
      { href:'#/admin/analytics',   icon:'📊', label:'Analytics' },
      { href:'#/admin/audit-logs',  icon:'📜', label:'Audit Logs' },
    ].map(a => `
      <a href="${a.href}" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;text-decoration:none;transition:all 0.15s;" onmouseenter="this.style.background='rgba(245,158,11,0.05)';this.style.borderColor='rgba(245,158,11,0.2)'" onmouseleave="this.style.background='rgba(255,255,255,0.02)';this.style.borderColor='rgba(255,255,255,0.06)'">
        <span style="font-size:1.5rem;">${a.icon}</span>
        <span style="font-size:0.78rem;font-weight:600;color:#94a3b8;">${a.label}</span>
      </a>
    `).join('');
  }, { title: 'Admin Dashboard' });
}
