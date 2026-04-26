// js/pages/admin/analytics.js — Admin analytics with Chart.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { StatCard } from '../../components/card.js';
import { Formatter } from '../../utils/formatter.js';
import { Loader } from '../../components/loader.js';

export async function analyticsPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Analytics</h1></div>
        <div id="stats-grid" class="grid-4" style="margin-bottom:1.5rem;">${Loader.cardSkeleton(4)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
          <div class="section-card">
            <h2>Orders by Status</h2>
            <canvas id="orders-chart" height="200"></canvas>
          </div>
          <div class="section-card">
            <h2>Revenue Overview</h2>
            <canvas id="revenue-chart" height="200"></canvas>
          </div>
        </div>
      </div>
    `;

    const [statsRes, ordersRes, paymentsRes] = await Promise.all([
      API.get('/admin/stats', { silent: true }),
      API.get('/admin/orders', { silent: true }),
      API.get('/admin/payments', { silent: true }),
    ]);

    const stats    = statsRes.stats || statsRes.data || statsRes || {};
    const orders   = ordersRes.orders   || ordersRes.data   || [];
    const payments = paymentsRes.payments || paymentsRes.data || [];

    const totalRev = payments.filter(p => ['paid', 'success'].includes(p.status)).reduce((s,p) => s + (p.amount||0), 0);

    document.getElementById('stats-grid').innerHTML = [
      StatCard({ label:'Total Users',   value: stats.totalUsers   || 0,                  icon:'👥', color:'#3b82f6' }),
      StatCard({ label:'Total Orders',  value: orders.length,                            icon:'📋', color:'#f59e0b' }),
      StatCard({ label:'Total Revenue', value: Formatter.currency(totalRev),            icon:'💰', color:'#22c55e' }),
      StatCard({ label:'Payments Made', value: payments.filter(p=>['paid', 'success'].includes(p.status)).length, icon:'💳', color:'#a855f7' }),
    ].join('');

    // Orders by status chart
    const statusCounts = {};
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status]||0) + 1; });

    if (typeof Chart !== 'undefined') {
      new Chart(document.getElementById('orders-chart'), {
        type: 'doughnut',
        data: {
          labels: Object.keys(statusCounts).map(s => s.replace('_',' ')),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ['#f59e0b','#3b82f6','#a855f7','#06b6d4','#22c55e','#ef4444'],
            borderWidth: 0,
          }]
        },
        options: { plugins: { legend: { labels: { color:'#94a3b8', font:{ size:11 } } } }, cutout:'65%' }
      });

      // Revenue by month (simple grouping)
      const byMonth = {};
      payments.filter(p => p.status==='paid').forEach(p => {
        const m = new Date(p.createdAt).toLocaleDateString('en-IN',{month:'short',year:'2-digit'});
        byMonth[m] = (byMonth[m]||0) + (p.amount||0);
      });

      new Chart(document.getElementById('revenue-chart'), {
        type: 'bar',
        data: {
          labels: Object.keys(byMonth),
          datasets: [{ label:'Revenue (₹)', data:Object.values(byMonth), backgroundColor:'rgba(245,158,11,0.6)', borderColor:'#f59e0b', borderWidth:1, borderRadius:6 }]
        },
        options: {
          plugins: { legend: { labels: { color:'#94a3b8', font:{size:11} } } },
          scales: {
            x: { ticks: { color:'#64748b' }, grid: { color:'rgba(255,255,255,0.05)' } },
            y: { ticks: { color:'#64748b', callback: v => '₹'+Formatter.number(v) }, grid: { color:'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }
  }, { title: 'Analytics' });
}
