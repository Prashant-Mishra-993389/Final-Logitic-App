// js/pages/admin/support.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Table } from '../../components/table.js';
import { Badge } from '../../components/badge.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';
import { DateUtil } from '../../utils/date.js';

export async function adminSupportPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Support Tickets</h1></div>
        <div class="section-card"><div id="support-table"></div></div>
      </div>
    `;

    async function load() {
      const res = await API.get('/support', { silent:true });
      const tickets = res.tickets || res.data || [];

      document.getElementById('support-table').innerHTML = Table({
        columns: [
          { key:'subject',   label:'Subject',    render: v => `<span style="font-weight:600;color:#f1f5f9;">${v}</span>` },
          { key:'userId',    label:'User',       render: v => v?.name || '-' },
          { key:'categoryId',  label:'Category',   render: v => v || '-' },
          { key:'status',    label:'Status',     render: v => Badge(v) },
          { key:'createdAt', label:'Created',    render: v => DateUtil.format(v) },
          { key:'_id',       label:'Actions',    render: (id,row) => `
            <div style="display:flex;gap:6px;">
              <button data-view="${id}" class="btn btn-secondary btn-sm">View</button>
              ${row.status !== 'closed' ? `<button data-reply="${id}" class="btn btn-primary btn-sm">Reply</button>` : ''}
              ${row.status !== 'closed' ? `<button data-close="${id}" class="btn btn-danger btn-sm">Close</button>` : ''}
            </div>
          `},
        ],
        rows: tickets,
        emptyTitle: 'No support tickets',
      });

      document.getElementById('support-table').querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const r = await API.get(`/support/${btn.dataset.view}`, { silent:true });
          const t = r.ticket || r.data;
          Modal.show({
            title: `Ticket: ${t?.subject || ''}`,
            content: `
              <div style="margin-bottom:12px;"><span style="color:#64748b;font-size:0.8rem;">From:</span> <span style="color:#f1f5f9;">${t?.by?.name||'-'} (${t?.by?.email||''})</span></div>
              <div style="background:#13161e;border-radius:8px;padding:12px;color:#94a3b8;font-size:0.875rem;">${t?.description||'-'}</div>
            `,
          });
        });
      });

      document.getElementById('support-table').querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
          Modal.show({
            title: 'Close Ticket & Reply',
            content: `
              <div style="margin-bottom:12px;">
                <label style="display:block;margin-bottom:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Admin Reply / Resolution Note</label>
                <textarea id="reply-text" rows="4" placeholder="Enter resolution details or reply to user..." style="width:100%;padding:10px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-family:inherit;outline:none;resize:vertical;"></textarea>
              </div>
            `,
            footer: `
              <div style="display:flex;gap:8px;justify-content:flex-end;">
                <button id="reply-cancel" class="btn btn-secondary btn-sm">Cancel</button>
                <button id="reply-submit" class="btn btn-primary btn-sm">Reply & Close</button>
              </div>
            `
          });
          document.getElementById('reply-cancel').addEventListener('click', () => Modal.closeAll());
          document.getElementById('reply-submit').addEventListener('click', async () => {
            const note = document.getElementById('reply-text').value.trim();
            const payload = { status: 'closed' };
            if (note) payload.resolutionNotes = note;
            const r = await API.patch(`/support/${btn.dataset.close}/status`, payload);
            if (r.success) { Toast.success('Ticket closed with reply'); Modal.closeAll(); load(); }
          });
        });
      });

      document.getElementById('support-table').querySelectorAll('[data-reply]').forEach(btn => {
        btn.addEventListener('click', () => {
          Modal.show({
            title: 'Reply to Ticket',
            content: `
              <div style="margin-bottom:12px;">
                <label style="display:block;margin-bottom:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Admin Reply</label>
                <textarea id="reply-only-text" rows="4" placeholder="Enter reply to user..." style="width:100%;padding:10px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-family:inherit;outline:none;resize:vertical;"></textarea>
              </div>
            `,
            footer: `
              <div style="display:flex;gap:8px;justify-content:flex-end;">
                <button id="reply-only-cancel" class="btn btn-secondary btn-sm">Cancel</button>
                <button id="reply-only-submit" class="btn btn-primary btn-sm">Send Reply</button>
              </div>
            `
          });
          document.getElementById('reply-only-cancel').addEventListener('click', () => Modal.closeAll());
          document.getElementById('reply-only-submit').addEventListener('click', async () => {
            const note = document.getElementById('reply-only-text').value.trim();
            if (!note) return Toast.error('Reply cannot be empty');
            const payload = { status: 'in_progress', resolutionNotes: note };
            const r = await API.patch(`/support/${btn.dataset.reply}/status`, payload);
            if (r.success) { Toast.success('Reply sent'); Modal.closeAll(); load(); }
          });
        });
      });
    }

    load();
  }, { title: 'Support' });
}
