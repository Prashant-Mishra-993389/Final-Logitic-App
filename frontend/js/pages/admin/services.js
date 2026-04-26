// js/pages/admin/services.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Table } from '../../components/table.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';
import { Formatter } from '../../utils/formatter.js';

export async function adminServicesPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Services</h1><button id="add-svc-btn" class="btn btn-primary">+ Add Service</button></div>
        <div class="section-card"><div id="svc-table"></div></div>
      </div>
    `;

    let subcats = [];
    const scRes = await API.get('/subcategories', { silent:true });
    subcats = scRes.subcategories || scRes.data || [];

    async function load() {
      const res = await API.get('/services', { silent:true });
      const svcs = res.services || res.data || [];
      document.getElementById('svc-table').innerHTML = Table({
        columns: [
          { key:'title',       label:'Name',        render: v => `<span style="font-weight:600;color:#f1f5f9;">${v}</span>` },
          { key:'subcategoryId', label:'Subcategory', render: v => v?.name || '-' },
          { key:'basePrice',   label:'Base Price',  render: v => v ? Formatter.currency(v) : '-' },
          { key:'isActive',    label:'Status',      render: v => `<span style="color:${v?'#22c55e':'#ef4444'};">${v?'Active':'Inactive'}</span>` },
          { key:'_id',         label:'Actions',     render: (id,row) => `
            <div style="display:flex;gap:6px;">
              <button data-edit="${id}" class="btn btn-secondary btn-sm">Edit</button>
              <button data-del="${id}"  class="btn btn-danger btn-sm">Delete</button>
            </div>
          `},
        ],
        rows: svcs,
        emptyTitle: 'No services yet',
      });

      document.getElementById('svc-table').querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', () => Modal.confirm({ title:'Delete Service', message:'Delete?', danger:true,
          onConfirm: async () => { await API.delete(`/services/${btn.dataset.del}`); load(); }
        }));
      });
      document.getElementById('svc-table').querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', async () => { const r = await API.get(`/services/${btn.dataset.edit}`,{silent:true}); openForm(r.service||r.data); });
      });
    }

    function openForm(ex) {
      Modal.show({
        title: ex ? 'Edit Service' : 'Add Service',
        content: `
          <div style="margin-bottom:10px;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Subcategory *</label>
            <select id="sv-sc" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;">
              ${subcats.map(s=>`<option value="${s._id}" ${ex?.subcategoryId?._id===s._id||ex?.subcategoryId===s._id?'selected':''}>${s.name}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom:10px;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Service Name *</label>
            <input id="sv-name" value="${ex?.title||''}" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
          </div>
          <div class="grid-2" style="gap:10px;margin-bottom:10px;">
            <div>
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Base Price (₹)</label>
              <input id="sv-price" type="number" value="${ex?.basePrice||''}" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
            </div>
            <div>
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Duration (hrs)</label>
              <input id="sv-dur" type="number" value="${ex?.estimatedDurationMins ? ex.estimatedDurationMins / 60 : ''}" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
            </div>
          </div>
          <div style="margin-bottom:10px;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Description</label>
            <textarea id="sv-desc" rows="2" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;resize:vertical;font-family:inherit;">${ex?.description||''}</textarea>
          </div>`,
        footer: `<div style="display:flex;gap:8px;justify-content:flex-end;">
          <button id="sv-cancel" class="btn btn-secondary btn-sm">Cancel</button>
          <button id="sv-save"   class="btn btn-primary btn-sm">${ex?'Update':'Create'}</button>
        </div>`,
      });
      document.getElementById('sv-cancel').addEventListener('click', () => Modal.closeAll());

      document.getElementById('sv-save').addEventListener('click', async () => {
        const payload = {
          subcategoryId: document.getElementById('sv-sc').value,
          title: document.getElementById('sv-name').value.trim(),
          basePrice: +document.getElementById('sv-price').value || undefined,
          estimatedDurationMins: (+document.getElementById('sv-dur').value * 60) || undefined,
          description: document.getElementById('sv-desc').value,
        };
        if (!payload.title) { Toast.error('Name required'); return; }
        
        const saveBtn = document.getElementById('sv-save');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        const r = ex ? await API.put(`/services/${ex._id}`, payload) : await API.post('/services', payload);
        
        if (r.success) { 
          Modal.closeAll(); 
          Toast.success(ex ? 'Updated' : 'Created'); 
          load(); 
        } else {
          saveBtn.disabled = false;
          saveBtn.textContent = ex ? 'Update' : 'Create';
        }
      });
    }

    document.getElementById('add-svc-btn').addEventListener('click', () => openForm(null));
    load();
  }, { title: 'Services' });
}
