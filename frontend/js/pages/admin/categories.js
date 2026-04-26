// js/pages/admin/categories.js — Category CRUD
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Table } from '../../components/table.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';
import { DateUtil } from '../../utils/date.js';

export async function adminCategoriesPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header">
          <h1>Categories</h1>
          <button id="add-cat-btn" class="btn btn-primary">+ Add Category</button>
        </div>
        <div class="section-card"><div id="cats-table"></div></div>
      </div>
    `;

    // ─── Add Category button ───────────────────────────────
    document.getElementById('add-cat-btn').addEventListener('click', () => openForm(null));

    // ─── Load & render table ───────────────────────────────
    async function load() {
      const res = await API.get('/categories', { silent: true });
      const cats = res.categories || (Array.isArray(res.data) ? res.data : []);

      const tableEl = document.getElementById('cats-table');
      if (!tableEl) return;

      tableEl.innerHTML = Table({
        columns: [
          {
            key: 'name', label: 'Name',
            render: (v, r) => `
              <div style="font-weight:600;color:#f1f5f9;">${v}</div>
              ${r.description ? `<div style="font-size:0.75rem;color:#64748b;">${r.description.slice(0, 60)}</div>` : ''}
            `
          },
          {
            key: 'isActive', label: 'Status',
            render: v => `<span style="color:${v ? '#22c55e' : '#ef4444'};">${v ? 'Active' : 'Inactive'}</span>`
          },
          { key: 'createdAt', label: 'Created', render: v => DateUtil.format(v) },
          {
            key: '_id', label: 'Actions',
            render: (id) => `
              <div style="display:flex;gap:6px;">
                <button data-edit="${id}" class="btn btn-secondary btn-sm">Edit</button>
                <button data-del="${id}"  class="btn btn-danger btn-sm">Delete</button>
              </div>
            `
          },
        ],
        rows: cats,
        emptyTitle: 'No categories yet',
      });

      // ── Delete buttons ──────────────────────────────────
      tableEl.querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', () => {
          Modal.confirm({
            title: 'Delete Category',
            message: 'Delete this category? This cannot be undone.',
            danger: true,
            onConfirm: async () => {
              const r = await API.delete(`/categories/${btn.dataset.del}`);
              if (r.success) { Toast.success('Deleted'); load(); }
            },
          });
        });
      });

      // ── Edit buttons — ONLY addEventListener, NOT openForm() directly ──
      tableEl.querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const catId = btn.dataset.edit;
          // Find from already-loaded list first (no extra API call needed)
          const cat = cats.find(c => c._id === catId);
          openForm(cat || null);
        });
      });
    }

    // ─── Create / Edit modal ──────────────────────────────
    function openForm(existing) {
      Modal.show({
        title: existing ? 'Edit Category' : 'Add Category',
        content: `
          <div style="margin-bottom:1rem;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Name *</label>
            <input id="cat-name" value="${existing?.name || ''}"
              style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
              border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
          </div>
          <div style="margin-bottom:1rem;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Description</label>
            <textarea id="cat-desc" rows="2"
              style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
              border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;resize:vertical;font-family:inherit;"
            >${existing?.description || ''}</textarea>
          </div>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="cat-active" ${existing?.isActive !== false ? 'checked' : ''}
              style="accent-color:#f59e0b;width:16px;height:16px;" />
            <span style="color:#94a3b8;font-size:0.875rem;">Active</span>
          </label>
        `,
        footer: `
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button id="cancel-cat-btn" class="btn btn-secondary btn-sm">Cancel</button>
            <button id="save-cat-btn"   class="btn btn-primary btn-sm">${existing ? 'Update' : 'Create'}</button>
          </div>
        `,
      });

      // Cancel — use addEventListener, not inline onclick (CSP safe)
      document.getElementById('cancel-cat-btn').addEventListener('click', () => Modal.closeAll());

      // Save
      document.getElementById('save-cat-btn').addEventListener('click', async () => {
        const name = document.getElementById('cat-name').value.trim();
        if (!name) { Toast.error('Name is required'); return; }

        const payload = {
          name,
          description: document.getElementById('cat-desc').value.trim(),
          isActive: document.getElementById('cat-active').checked,
        };

        const saveBtn = document.getElementById('save-cat-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        const r = existing
          ? await API.put(`/categories/${existing._id}`, payload)
          : await API.post('/categories', payload);

        if (r.success) {
          Modal.closeAll();
          Toast.success(existing ? 'Updated!' : 'Created!');
          load(); // refresh table
        } else {
          saveBtn.disabled = false;
          saveBtn.textContent = existing ? 'Update' : 'Create';
        }
      });
    }

    // Initial load
    load();
  }, { title: 'Categories' });
}
