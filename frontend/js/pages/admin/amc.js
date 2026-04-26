// js/pages/admin/amc.js — AMC Plans CRUD
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Table } from '../../components/table.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';
import { Formatter } from '../../utils/formatter.js';

export async function adminAmcPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>AMC Plans</h1><button id="add-amc-btn" class="btn btn-primary">+ Add Plan</button></div>
        <div class="section-card"><div id="amc-table"></div></div>
      </div>
    `;

    async function load() {
      const res = await API.get('/amc', { silent:true });
      const plans = res.plans || res.data || [];
      document.getElementById('amc-table').innerHTML = Table({
        columns: [
          { key:'name',        label:'Plan Name',    render: v => `<span style="font-weight:600;color:#f1f5f9;">${v}</span>` },
          { key:'price',       label:'Price',        render: v => Formatter.currency(v) },
          { key:'duration',    label:'Duration',     render: v => `${v} month(s)` },
          { key:'description', label:'Description',  render: v => (v||'').slice(0,60) },
          { key:'_id',         label:'Actions',      render: (id,row) => `
            <div style="display:flex;gap:6px;">
              <button data-del="${id}" class="btn btn-danger btn-sm">Delete</button>
            </div>
          `},
        ],
        rows: plans,
        emptyTitle: 'No AMC plans defined',
      });

      document.getElementById('amc-table').querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', () => Modal.confirm({ title:'Delete Plan', message:'Delete this AMC plan?', danger:true,
          onConfirm: async () => { await API.delete(`/amc/${btn.dataset.del}`); load(); }
        }));
      });
    }

    document.getElementById('add-amc-btn').addEventListener('click', () => {
      Modal.show({
        title: 'Add AMC Plan',
        content: `
          <div style="margin-bottom:10px;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Plan Name *</label>
            <input id="amc-name" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
          </div>
          <div class="grid-2" style="gap:10px;margin-bottom:10px;">
            <div>
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Price (₹) *</label>
              <input id="amc-price" type="number" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
            </div>
            <div>
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Duration (months) *</label>
              <input id="amc-dur" type="number" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
            </div>
          </div>
          <div>
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Description</label>
            <textarea id="amc-desc" rows="2" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;resize:vertical;font-family:inherit;"></textarea>
          </div>
        `,
        footer: `<div style="display:flex;gap:8px;justify-content:flex-end;">
          <button id="amc-cancel-btn" class="btn btn-secondary btn-sm">Cancel</button>
          <button id="amc-save" class="btn btn-primary btn-sm">Create Plan</button>
        </div>`,
      });
      document.getElementById('amc-cancel-btn').addEventListener('click', () => Modal.closeAll());
      document.getElementById('amc-save').addEventListener('click', async () => {
        const name = document.getElementById('amc-name').value.trim();
        if (!name) { Toast.error('Name required'); return; }
        const r = await API.post('/amc', {
          name, price:+document.getElementById('amc-price').value, duration:+document.getElementById('amc-dur').value,
          description: document.getElementById('amc-desc').value,
        });
        if (r.success) { Modal.closeAll(); Toast.success('Plan created'); load(); }
      });
    });

    load();
  }, { title: 'AMC Plans' });
}
