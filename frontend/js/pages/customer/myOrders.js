// js/pages/customer/myOrders.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Badge } from '../../components/badge.js';
import { SearchInput, FilterSelect } from '../../components/search.js';
import { Pagination, bindPagination } from '../../components/pagination.js';
import { EmptyState } from '../../components/emptyState.js';
import { Loader } from '../../components/loader.js';
import { DateUtil } from '../../utils/date.js';
import { Formatter } from '../../utils/formatter.js';

export async function myOrdersPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header">
          <div><h1>My Orders</h1><p>Track and manage your service requests</p></div>
          <a href="#/customer/create-order" class="btn btn-primary">+ New Order</a>
        </div>
        <div class="section-card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:1rem;flex-wrap:wrap;">
            <div id="search-wrap"></div>
            <div id="filter-wrap"></div>
          </div>
          <div id="orders-list"></div>
          <div id="pagination"></div>
        </div>
      </div>
    `;

    document.getElementById('search-wrap').appendChild(
      SearchInput({ placeholder: 'Search orders...', onSearch: (q) => { searchQ = q; loadOrders(); } })
    );
    document.getElementById('filter-wrap').appendChild(
      FilterSelect({
        label: 'All Statuses', options: [
          { value:'requested', label:'Requested' }, { value:'quote_pending', label:'Quote Pending' },
          { value:'assigned', label:'Assigned' }, { value:'in_progress', label:'In Progress' },
          { value:'completed', label:'Completed' }, { value:'cancelled', label:'Cancelled' },
        ], onChange: (v) => { filterStatus = v; currentPage = 1; loadOrders(); }
      })
    );

    let currentPage = 1, searchQ = '', filterStatus = '';

    async function loadOrders() {
      document.getElementById('orders-list').innerHTML = `<div style="padding:1rem;">${Loader.skeleton(5)}</div>`;
      const res = await API.get('/orders/my', { silent: true });
      let orders = res.orders || res.data || [];

      if (searchQ)      orders = orders.filter(o => JSON.stringify(o).toLowerCase().includes(searchQ.toLowerCase()));
      if (filterStatus) orders = orders.filter(o => o.status === filterStatus);

      const pageSize = 10;
      const total    = orders.length;
      const totalPgs = Math.ceil(total / pageSize);
      const paged    = orders.slice((currentPage-1)*pageSize, currentPage*pageSize);

      const listEl = document.getElementById('orders-list');
      if (!paged.length) {
        listEl.innerHTML = EmptyState({ icon:'📦', title:'No orders found', message:'Try adjusting your filters' });
      } else {
        listEl.innerHTML = paged.map(o => `
          <a href="#/customer/order/${o._id}" style="
            display:flex;align-items:center;justify-content:space-between;
            padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.05);
            text-decoration:none;gap:12px;
          " onmouseenter="this.style.opacity='0.85'" onmouseleave="this.style.opacity='1'">
            <div style="flex:1;min-width:0;">
              <div style="font-weight:600;color:#f1f5f9;font-size:0.9rem;margin-bottom:3px;">
                ${o.categoryId?.name || 'Service'} — ${o.subcategoryId?.name || ''}
              </div>
              <div style="color:#64748b;font-size:0.78rem;">${DateUtil.format(o.createdAt)} · ${o.location?.address || ''}</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
              ${o.budget ? `<span style="color:#f59e0b;font-weight:600;font-size:0.85rem;">${Formatter.currency(o.budget)}</span>` : ''}
              ${Badge(o.status)}
            </div>
          </a>
        `).join('');
      }

      document.getElementById('pagination').innerHTML = Pagination({ page: currentPage, totalPages: totalPgs, onPageChange: null });
      bindPagination('#pagination', (p) => { currentPage = p; loadOrders(); });
    }

    loadOrders();
  }, { title: 'My Orders' });
}
