// js/pages/customer/dashboard.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Auth } from '../../core/auth.js';
import { StatCard } from '../../components/card.js';
import { Badge } from '../../components/badge.js';
import { Formatter } from '../../utils/formatter.js';
import { DateUtil } from '../../utils/date.js';
import { Loader } from '../../components/loader.js';

export async function customerDashboard() {
  renderLayout(async (content) => {
    const user = Auth.getUser();
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header">
          <div>
            <h1>Good ${greeting()}, ${user?.name?.split(' ')[0] || 'User'} 👋</h1>
            <p>Here's what's happening with your orders</p>
          </div>
          <a href="#/customer/create-order" class="btn btn-primary">+ New Order</a>
        </div>
        <div id="stats-grid" class="grid-4" style="margin-bottom:1.5rem;">
          ${Loader.cardSkeleton(4)}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
          <div class="section-card"><h2>Recent Orders</h2><div id="recent-orders">${Loader.skeleton(4)}</div></div>
          <div class="section-card"><h2>Quick Actions</h2><div id="quick-actions"></div></div>
        </div>
      </div>
    `;

    // Load orders
    const [ordersRes, notifRes] = await Promise.all([
      API.get('/orders/my', { silent: true }),
      API.get('/notifications/my', { silent: true }),
    ]);

    const orders   = ordersRes.orders || ordersRes.data || [];
    const unread   = (notifRes.notifications || notifRes.data || []).filter(n => !n.isRead).length;
    const pending  = orders.filter(o => o.status === 'pending').length;
    const active   = orders.filter(o => ['confirmed','assigned','in_progress'].includes(o.status)).length;
    const done     = orders.filter(o => o.status === 'completed').length;

    document.getElementById('stats-grid').innerHTML = [
      StatCard({ label:'Total Orders',    value: orders.length, icon:'📋', color:'#f59e0b' }),
      StatCard({ label:'Active',          value: active,        icon:'⚡', color:'#3b82f6' }),
      StatCard({ label:'Completed',       value: done,          icon:'✅', color:'#22c55e' }),
      StatCard({ label:'Notifications',   value: unread,        icon:'🔔', color:'#a855f7' }),
    ].join('');

    // Recent orders
    const recentEl = document.getElementById('recent-orders');
    if (!orders.length) {
      recentEl.innerHTML = `<div style="text-align:center;padding:2rem;color:#64748b;">
        <div style="font-size:2rem;margin-bottom:8px;">📦</div>
        <div>No orders yet. <a href="#/customer/create-order" style="color:#f59e0b;">Create one!</a></div>
      </div>`;
    } else {
      recentEl.innerHTML = orders.slice(0, 5).map(o => `
        <a href="#/customer/order/${o._id}" style="
          display:flex;align-items:center;justify-content:space-between;
          padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);
          text-decoration:none;transition:opacity 0.15s;
        " onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'">
          <div>
            <div style="font-size:0.875rem;font-weight:600;color:#f1f5f9;">${o.categoryId?.name || 'Service Order'}</div>
            <div style="font-size:0.75rem;color:#64748b;margin-top:2px;">${DateUtil.relative(o.createdAt)}</div>
          </div>
          ${Badge(o.status)}
        </a>
      `).join('');
    }

    // Quick actions
    document.getElementById('quick-actions').innerHTML = [
      { href:'#/customer/create-order', icon:'➕', label:'New Service Request', color:'#f59e0b' },
      { href:'#/customer/orders',       icon:'📋', label:'View All Orders',     color:'#3b82f6' },
      { href:'#/customer/tracking',     icon:'📍', label:'Track Order',         color:'#22c55e' },
      { href:'#/customer/support',      icon:'🎧', label:'Get Support',         color:'#a855f7' },
    ].map(a => `
      <a href="${a.href}" style="
        display:flex;align-items:center;gap:12px;padding:12px;
        background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);
        border-radius:10px;text-decoration:none;margin-bottom:8px;transition:all 0.15s;
      " onmouseenter="this.style.background='rgba(255,255,255,0.05)'" onmouseleave="this.style.background='rgba(255,255,255,0.02)'">
        <div style="width:36px;height:36px;border-radius:9px;background:${a.color}22;
          display:flex;align-items:center;justify-content:center;font-size:1rem;">${a.icon}</div>
        <span style="font-size:0.875rem;font-weight:500;color:#f1f5f9;">${a.label}</span>
        <span style="margin-left:auto;color:#64748b;font-size:0.8rem;">→</span>
      </a>
    `).join('');
  }, { title: 'Dashboard' });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
