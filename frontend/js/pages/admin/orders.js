// js/pages/admin/orders.js — Admin order management
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Table } from '../../components/table.js';
import { Badge } from '../../components/badge.js';
import { SearchInput, FilterSelect } from '../../components/search.js';
import { DateUtil } from '../../utils/date.js';
import { Formatter } from '../../utils/formatter.js';

export async function adminOrdersPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Orders</h1></div>
        <div class="section-card">
          <div style="display:flex;gap:10px;margin-bottom:1rem;flex-wrap:wrap;">
            <div id="search-wrap"></div><div id="status-filter"></div>
          </div>
          <div id="orders-table"></div>
        </div>
      </div>
    `;

    let all = [], q = '', sf = '';
    document.getElementById('search-wrap').appendChild(SearchInput({ placeholder:'Search orders...', onSearch: v => { q=v; render(); } }));
    document.getElementById('status-filter').appendChild(FilterSelect({ label:'All Statuses',
      options: ['pending','confirmed','assigned','in_progress','completed','cancelled'].map(s => ({ value:s, label:s.replace('_',' ') })),
      onChange: v => { sf=v; render(); }
    }));

    const res = await API.get('/admin/orders', { silent: true });
    all = res.orders || res.data || [];

    function render() {
      let data = all;
      if (q)  data = data.filter(o => JSON.stringify(o).toLowerCase().includes(q.toLowerCase()));
      if (sf) data = data.filter(o => o.status === sf);
      document.getElementById('orders-table').innerHTML = Table({
        columns: [
          { key:'_id',        label:'Order ID',   render: v => `<code style="font-size:0.75rem;color:#f59e0b;">${v.slice(-8)}</code>` },
          { key:'customerId',   label:'Customer',   render: v => v?.name || '-' },
          { key:'categoryId',   label:'Service',    render: (v,r) => `${v?.name||'-'}<br/><span style="font-size:0.72rem;color:#64748b;">${r.subcategory?.name||''}</span>` },
          { key:'providerId',     label:'Worker',     render: v => v?.name || '<span style="color:#64748b;">Unassigned</span>' },
          { key:'status',     label:'Status',     render: v => Badge(v) },
          { key:'budget',     label:'Budget',     render: v => v ? Formatter.currency(v) : '-' },
          { key:'createdAt',  label:'Date',       render: v => DateUtil.format(v) },
        ],
        rows: data,
        emptyTitle: 'No orders found',
      });
    }

    render();
  }, { title: 'Orders' });
}
