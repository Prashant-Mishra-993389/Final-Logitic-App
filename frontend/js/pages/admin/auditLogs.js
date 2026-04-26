// js/pages/admin/auditLogs.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Table } from '../../components/table.js';
import { DateUtil } from '../../utils/date.js';

export async function auditLogsPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Audit Logs</h1></div>
        <div class="section-card"><div id="audit-table"></div></div>
      </div>
    `;

    const res = await API.get('/admin/audit-logs', { silent:true });
    const logs = res.logs || res.data || [];

    document.getElementById('audit-table').innerHTML = Table({
      columns: [
        { key:'action',    label:'Action',   render: v => `<span style="color:#f59e0b;font-weight:600;">${v}</span>` },
        { key:'user',      label:'User',     render: v => v?.name || '-' },
        { key:'targetModel',label:'Target',  render: v => v || '-' },
        { key:'ipAddress', label:'IP',       render: v => v || '-' },
        { key:'createdAt', label:'Time',     render: v => DateUtil.formatDateTime(v) },
      ],
      rows: logs,
      emptyTitle: 'No audit logs',
    });
  }, { title: 'Audit Logs' });
}
