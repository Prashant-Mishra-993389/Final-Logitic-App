// js/pages/admin/workers.js — Worker verification management
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Badge } from '../../components/badge.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';
import { EmptyState } from '../../components/emptyState.js';
import { Loader } from '../../components/loader.js';
import { SearchInput, FilterSelect } from '../../components/search.js';
import { DateUtil } from '../../utils/date.js';
import { RatingStars } from '../../components/ratingStars.js';

export async function adminWorkersPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Workers Verification</h1></div>
        <div class="section-card">
          <div style="display:flex;gap:10px;margin-bottom:1rem;flex-wrap:wrap;">
            <div id="search-wrap"></div>
            <div id="status-filter"></div>
          </div>
          <div id="workers-container"></div>
        </div>
      </div>
    `;

    let allWorkers = [], searchQ = '', statusFilter = '';

    document.getElementById('search-wrap').appendChild(
      SearchInput({ placeholder:'Search workers...', onSearch: q => { searchQ=q; render(); } })
    );
    document.getElementById('status-filter').appendChild(
      FilterSelect({ label:'All Statuses', options:[
        {value:'pending',label:'Pending'},{value:'approved',label:'Approved'},{value:'rejected',label:'Rejected'}
      ], onChange: v => { statusFilter=v; render(); } })
    );

    const res = await API.get('/admin/users', { silent: true });
    allWorkers = (res.users || res.data || []).filter(u => u.role === 'worker');

    function render() {
      let filtered = allWorkers;
      if (searchQ)      filtered = filtered.filter(w => w.name.toLowerCase().includes(searchQ.toLowerCase()));
      if (statusFilter) filtered = filtered.filter(w => w.workerProfile?.verificationStatus === statusFilter);

      const container = document.getElementById('workers-container');
      if (!filtered.length) { container.innerHTML = EmptyState({ icon:'🔧', title:'No workers found' }); return; }

      container.innerHTML = `<div class="grid-2">${filtered.map(w => {
        const wp = w.workerProfile || {};
        return `
          <div style="background:#13161e;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:1.25rem;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
              <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#2563eb);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;">${(w.name||'?').charAt(0).toUpperCase()}</div>
              <div style="flex:1;">
                <div style="font-weight:700;color:#f1f5f9;">${w.name}</div>
                <div style="font-size:0.75rem;color:#64748b;">${w.email}</div>
              </div>
              ${Badge(wp.verificationStatus || 'pending')}
            </div>
            ${wp.skills?.length ? `<div style="font-size:0.78rem;color:#64748b;margin-bottom:8px;">Skills: ${wp.skills.slice(0,3).join(', ')}</div>` : ''}
            ${wp.bio ? `<div style="font-size:0.8rem;color:#94a3b8;margin-bottom:10px;">${wp.bio.slice(0,80)}…</div>` : ''}
            <div style="font-size:0.72rem;color:#64748b;margin-bottom:12px;">Joined ${DateUtil.format(w.createdAt)}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${wp.idProof ? `<a href="${wp.idProof}" target="_blank" class="btn btn-secondary btn-sm">📄 ID Proof</a>` : ''}
              ${wp.verificationStatus === 'pending' ? `
                <button data-approve="${w._id}" class="btn btn-success btn-sm">✓ Approve</button>
                <button data-reject="${w._id}" class="btn btn-danger btn-sm">✕ Reject</button>
              ` : ''}
              ${w.isBlocked ? `<button data-unblock="${w._id}" class="btn btn-secondary btn-sm">Unblock</button>` : `<button data-block="${w._id}" class="btn btn-danger btn-sm">Block</button>`}
            </div>
          </div>
        `;
      }).join('')}</div>`;

      container.querySelectorAll('[data-approve]').forEach(btn => {
        btn.addEventListener('click', async () => {
          await API.patch(`/admin/workers/${btn.dataset.approve}/approve`);
          Toast.success('Worker approved'); adminWorkersPage();
        });
      });
      container.querySelectorAll('[data-reject]').forEach(btn => {
        btn.addEventListener('click', async () => {
          await API.patch(`/admin/workers/${btn.dataset.reject}/reject`);
          Toast.info('Worker rejected'); adminWorkersPage();
        });
      });
      container.querySelectorAll('[data-block]').forEach(btn => {
        btn.addEventListener('click', async () => {
          await API.patch(`/admin/users/${btn.dataset.block}/block`, { block: true });
          Toast.success('Worker blocked'); adminWorkersPage();
        });
      });
    }

    render();
  }, { title: 'Workers' });
}
