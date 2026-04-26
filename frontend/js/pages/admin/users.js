// js/pages/admin/users.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Table } from '../../components/table.js';
import { Badge, RoleBadge } from '../../components/badge.js';
import { SearchInput, FilterSelect } from '../../components/search.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';
import { DateUtil } from '../../utils/date.js';
import { Formatter } from '../../utils/formatter.js';

export async function adminUsersPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><div><h1>Users Management</h1></div></div>
        <div class="section-card">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:1rem;flex-wrap:wrap;">
            <div id="search-wrap"></div>
            <div id="role-filter"></div>
          </div>
          <div id="users-table"></div>
        </div>
      </div>
    `;

    let allUsers = [], searchQ = '', roleFilter = '';

    document.getElementById('search-wrap').appendChild(
      SearchInput({ placeholder:'Search users...', onSearch: q => { searchQ=q; render(); } })
    );
    document.getElementById('role-filter').appendChild(
      FilterSelect({ label:'All Roles', options:[
        {value:'customer',label:'Customer'},{value:'worker',label:'Worker'},{value:'admin',label:'Admin'}
      ], onChange: v => { roleFilter=v; render(); } })
    );

    const res = await API.get('/admin/users', { silent: true });
    allUsers = res.users || res.data || [];

    function render() {
      let filtered = allUsers;
      if (searchQ)     filtered = filtered.filter(u => (u.name+u.email).toLowerCase().includes(searchQ.toLowerCase()));
      if (roleFilter)  filtered = filtered.filter(u => u.role === roleFilter);

      const el = document.getElementById('users-table');
      el.innerHTML = Table({
        columns: [
          { key:'name',      label:'Name',     render: (v,r) => `<div style="font-weight:600;color:#f1f5f9;">${v}</div><div style="font-size:0.75rem;color:#64748b;">${r.email}</div>` },
          { key:'role',      label:'Role',     render: v => RoleBadge(v) },
          { key:'phone',     label:'Phone',    render: v => Formatter.phone(v) },
          { key:'isBlocked', label:'Status',   render: v => Badge(v?'blocked':'active') },
          { key:'createdAt', label:'Joined',   render: v => DateUtil.format(v) },
          { key:'_id',       label:'Actions',  render: (id,row) => `
            <div style="display:flex;gap:6px;">
              <button data-block="${id}" data-blocked="${row.isBlocked}" class="btn btn-sm ${row.isBlocked?'btn-success':'btn-danger'}">${row.isBlocked?'Unblock':'Block'}</button>
            </div>
          `},
        ],
        rows: filtered,
        emptyTitle: 'No users found',
      });

      el.querySelectorAll('[data-block]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const blocked = btn.dataset.blocked === 'true';
          Modal.confirm({
            title: blocked ? 'Unblock User' : 'Block User',
            message: `${blocked?'Unblock':'Block'} this user?`,
            danger: !blocked,
            onConfirm: async () => {
              const r = await API.patch(`/admin/users/${btn.dataset.block}/block`, { block: !blocked });
              if (r.success) { Toast.success(`User ${blocked?'unblocked':'blocked'}`); adminUsersPage(); }
            }
          });
        });
      });
    }

    render();
  }, { title: 'Users' });
}
