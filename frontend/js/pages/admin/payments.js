// js/pages/admin/payments.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Table } from '../../components/table.js';
import { Badge } from '../../components/badge.js';
import { Formatter } from '../../utils/formatter.js';
import { DateUtil } from '../../utils/date.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';

export async function adminPaymentsPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Payments</h1></div>
        <div class="section-card"><div id="pay-table"></div></div>
      </div>
    `;

    const res = await API.get('/admin/payments', { silent:true });
    const payments = res.payments || res.data || [];

    document.getElementById('pay-table').innerHTML = Table({
      columns: [
        { key:'_id',       label:'ID',        render: v => `<code style="font-size:0.75rem;color:#f59e0b;">${v.slice(-8)}</code>` },
        { key:'orderId',     label:'Job',     render: v => v?.serviceId?.title || v?.subcategoryId?.name || v?.categoryId?.name || 'Service Job' },
        { key:'orderId',     label:'Customer',  render: v => v?.customerId?.name || '-' },
        { key:'amount',    label:'Amount',    render: v => `<span style="font-weight:700;color:#22c55e;">${Formatter.currency(v)}</span>` },
        { key:'status',    label:'Status',    render: v => Badge(v) },
        { key:'method',    label:'Method',    render: v => v || 'Razorpay' },
        { key:'createdAt', label:'Date',      render: v => DateUtil.formatDateTime(v) },
        { key:'_id',       label:'Actions',   render: (id,row) => ['paid', 'success'].includes(row.status) ? `<button data-refund="${id}" class="btn btn-danger btn-sm">Refund</button>` : '' },
      ],
      rows: payments,
      emptyTitle: 'No payments yet',
    });

    document.querySelectorAll('[data-refund]').forEach(btn => {
      btn.addEventListener('click', () => Modal.confirm({
        title:'Process Refund', message:'Initiate a refund for this payment?', danger:true,
        onConfirm: async () => {
          const r = await API.post(`/payments/${btn.dataset.refund}/refund`);
          if (r.success) { Toast.success('Refund initiated'); adminPaymentsPage(); }
        }
      }));
    });
  }, { title: 'Payments' });
}
