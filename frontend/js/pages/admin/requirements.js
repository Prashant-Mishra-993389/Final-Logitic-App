// js/pages/admin/requirements.js — Requirement field template management
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Table } from '../../components/table.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';
import { FIELD_TYPES } from '../../utils/constants.js';

export async function adminRequirementsPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Requirement Fields</h1><button id="add-req-btn" class="btn btn-primary">+ Add Field</button></div>
        <div class="section-card">
          <div style="margin-bottom:1rem;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Filter by Subcategory</label>
            <select id="subcat-filter" style="width:300px;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;">
              <option value="">-- All Subcategories --</option>
            </select>
          </div>
          <div id="req-table"></div>
        </div>
      </div>
    `;

    const scRes = await API.get('/subcategories', { silent:true });
    const subcats = scRes.subcategories || scRes.data || [];
    const sel = document.getElementById('subcat-filter');
    sel.innerHTML += subcats.map(s => `<option value="${s._id}">${s.name}</option>`).join('');
    sel.addEventListener('change', () => load(sel.value));

    async function load(subcatId) {
      if (!subcatId) { document.getElementById('req-table').innerHTML = '<div style="color:#64748b;font-size:0.85rem;">Select a subcategory to view its requirement fields.</div>'; return; }
      const res = await API.get(`/requirements/subcategory/${subcatId}`, { silent:true });
      const fields = res.fields || res.data || [];
      document.getElementById('req-table').innerHTML = Table({
        columns: [
          { key:'label',     label:'Label',     render: v => `<span style="font-weight:600;color:#f1f5f9;">${v}</span>` },
          { key:'fieldKey',  label:'Field Key', render: v => `<code style="color:#f59e0b;font-size:0.8rem;">${v}</code>` },
          { key:'fieldType', label:'Type',      render: v => `<span style="background:rgba(59,130,246,0.12);color:#3b82f6;padding:2px 8px;border-radius:6px;font-size:0.75rem;">${v}</span>` },
          { key:'required',  label:'Required',  render: v => v ? '✓' : '–' },
          { key:'_id',       label:'Actions',   render: (id,row) => `
            <div style="display:flex;gap:6px;">
              <button data-del="${id}" class="btn btn-danger btn-sm">Delete</button>
            </div>
          `},
        ],
        rows: fields,
        emptyTitle: 'No fields defined for this subcategory',
      });

      document.getElementById('req-table').querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', () => Modal.confirm({
          title:'Delete Field', message:'Remove this requirement field?', danger:true,
          onConfirm: async () => { await API.delete(`/requirements/${btn.dataset.del}`); load(subcatId); }
        }));
      });
    }

    document.getElementById('add-req-btn').addEventListener('click', () => {
      const subcatId = document.getElementById('subcat-filter').value;
      if (!subcatId) { Toast.error('Please select a subcategory first to add requirements'); return; }
      Modal.show({
        title: 'Add Requirement Field',
        size: '580px',
        content: `
          <div class="grid-2" style="gap:10px;margin-bottom:10px;">
            <div>
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Label *</label>
              <input id="rf-label" placeholder="e.g. Machine Type" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
            </div>
            <div>
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Field Key *</label>
              <input id="rf-key" placeholder="e.g. machineType" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
            </div>
          </div>
          <div class="grid-2" style="gap:10px;margin-bottom:10px;">
            <div>
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Type *</label>
              <select id="rf-type" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;">
                ${Object.values(FIELD_TYPES).map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Placeholder</label>
              <input id="rf-placeholder" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
            </div>
          </div>
          <div style="margin-bottom:10px;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Options (comma separated, for select/multiselect)</label>
            <input id="rf-options" placeholder="Option A, Option B, Option C" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
          </div>
          <div style="margin-bottom:10px;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Help Text</label>
            <input id="rf-help" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
          </div>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="rf-required" style="accent-color:#f59e0b;" />
            <span style="color:#94a3b8;font-size:0.875rem;">Required field</span>
          </label>
        `,
        footer: `<div style="display:flex;gap:8px;justify-content:flex-end;">
          <button id="req-cancel-btn" class="btn btn-secondary btn-sm">Cancel</button>
          <button id="rf-save" class="btn btn-primary btn-sm">Create Field</button>
        </div>`,
      });

      document.getElementById('req-cancel-btn').addEventListener('click', () => Modal.closeAll());
      document.getElementById('rf-save').addEventListener('click', async () => {
        const label = document.getElementById('rf-label').value.trim();
        const key   = document.getElementById('rf-key').value.trim();
        if (!label || !key) { Toast.error('Label and Key are required'); return; }
        if (!subcatId) { Toast.error('Select a subcategory first'); return; }
        const opts = document.getElementById('rf-options').value.split(',').map(s => s.trim()).filter(Boolean);
        
        const saveBtn = document.getElementById('rf-save');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        const r = await API.post('/requirements', {
          subcategoryId: subcatId, 
          label, 
          fieldKey: key,
          fieldType: document.getElementById('rf-type').value,
          placeholder: document.getElementById('rf-placeholder').value,
          options: opts.length ? opts : undefined,
          helpText: document.getElementById('rf-help').value,
          required: document.getElementById('rf-required').checked,
        });
        
        if (r.success) { 
          Modal.closeAll(); 
          Toast.success('Field created'); 
          load(subcatId); 
        } else {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Create Field';
        }
      });
    });
  }, { title: 'Requirements' });
}
