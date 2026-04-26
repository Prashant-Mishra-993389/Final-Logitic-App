// js/pages/admin/subcategories.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Table } from '../../components/table.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';

export async function adminSubcategoriesPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Subcategories</h1><button id="add-btn" class="btn btn-primary">+ Add</button></div>
        <div class="section-card"><div id="table-wrap"></div></div>
      </div>
    `;

    let cats = [];
    const catRes = await API.get('/categories', { silent: true });
    cats = catRes.categories || catRes.data || [];

    async function load() {
      const res = await API.get('/subcategories', { silent: true });
      const items = res.subcategories || res.data || [];
      document.getElementById('table-wrap').innerHTML = Table({
        columns: [
          { key:'name',       label:'Name',     render: v => `<span style="font-weight:600;color:#f1f5f9;">${v}</span>` },
          { key:'categoryId',   label:'Category', render: v => v?.name || '-' },
          { key:'isActive',   label:'Status',   render: v => `<span style="color:${v?'#22c55e':'#ef4444'};">${v?'Active':'Inactive'}</span>` },
          { key:'_id',        label:'Actions',  render: (id,row) => `
            <div style="display:flex;gap:6px;">
              <button data-edit="${id}" class="btn btn-secondary btn-sm">Edit</button>
              <button data-del="${id}"  class="btn btn-danger btn-sm">Delete</button>
            </div>
          `},
        ],
        rows: items,
      });

      document.getElementById('table-wrap').querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', () => Modal.confirm({
          title:'Delete', message:'Delete this subcategory?', danger:true,
          onConfirm: async () => { await API.delete(`/subcategories/${btn.dataset.del}`); load(); }
        }));
      });
      document.getElementById('table-wrap').querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const r = await API.get(`/subcategories/${btn.dataset.edit}`, { silent:true });
          openForm(r.subcategory || r.data);
        });
      });
    }

    function openForm(ex) {
      Modal.show({
        title: ex ? 'Edit Subcategory' : 'Add Subcategory',
        content: `
          <div style="margin-bottom:1rem;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Category *</label>
            <select id="sc-cat" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;">
              ${cats.map(c => `<option value="${c._id}" ${ex?.category?._id===c._id||ex?.category===c._id?'selected':''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom:1rem;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Name *</label>
            <input id="sc-name" value="${ex?.name||''}" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
          </div>
          <div style="margin-bottom:1rem;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Description</label>
            <textarea id="sc-desc" rows="2" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;resize:vertical;font-family:inherit;">${ex?.description||''}</textarea>
          </div>`,
        footer: `<div style="display:flex;gap:8px;justify-content:flex-end;">
          <button id="sc-cancel" class="btn btn-secondary btn-sm">Cancel</button>
          <button id="sc-save" class="btn btn-primary btn-sm">${ex?'Update':'Create'}</button>
        </div>`,
      });
      document.getElementById('sc-cancel').addEventListener('click', () => Modal.closeAll());

      document.getElementById('sc-save').addEventListener('click', async () => {
        const payload = { 
          categoryId: document.getElementById('sc-cat').value, 
          name: document.getElementById('sc-name').value.trim(), 
          description: document.getElementById('sc-desc').value 
        };
        if (!payload.name) { Toast.error('Name required'); return; }
        
        const saveBtn = document.getElementById('sc-save');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        const r = ex ? await API.put(`/subcategories/${ex._id}`, payload) : await API.post('/subcategories', payload);
        
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

    document.getElementById('add-btn').addEventListener('click', () => openForm(null));
    load();
  }, { title: 'Subcategories' });
}
