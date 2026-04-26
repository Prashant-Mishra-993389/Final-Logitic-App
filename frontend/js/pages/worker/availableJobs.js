// js/pages/worker/availableJobs.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Badge } from '../../components/badge.js';
import { Modal } from '../../components/modal.js';
import { Toast } from '../../components/toast.js';
import { EmptyState } from '../../components/emptyState.js';
import { Loader } from '../../components/loader.js';
import { DateUtil } from '../../utils/date.js';
import { SearchInput } from '../../components/search.js';
import { setButtonLoading } from '../../components/form.js';

export async function availableJobsPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><div><h1>Available Jobs</h1><p>Browse and bid on open service requests</p></div></div>
        <div class="section-card">
          <div style="margin-bottom:1rem;" id="search-wrap"></div>
          <div id="jobs-grid"></div>
        </div>
      </div>
    `;

    let allJobs = [];
    document.getElementById('search-wrap').appendChild(
      SearchInput({ placeholder:'Search jobs...', onSearch: q => renderJobs(q) })
    );

    function renderJobs(q = '') {
      const filtered = q ? allJobs.filter(j => JSON.stringify(j).toLowerCase().includes(q.toLowerCase())) : allJobs;
      const container = document.getElementById('jobs-grid');
      if (!filtered.length) { container.innerHTML = EmptyState({ icon:'📦', title:'No jobs available', message:'Check back soon for new requests.' }); return; }
      container.innerHTML = `<div class="grid-2">${filtered.map(j => jobCard(j)).join('')}</div>`;
      container.querySelectorAll('[data-bid]').forEach(btn => {
        btn.addEventListener('click', () => openBidModal(btn.dataset.bid, allJobs.find(j => j._id === btn.dataset.bid)));
      });
    }

    const res = await API.get('/orders/available');
    allJobs = res.orders || res.data || [];
    renderJobs();

    function openBidModal(orderId, order) {
      const basePrice = order?.serviceId?.basePrice || 0;
      
      Modal.show({
        title: `Submit Quote — ${order?.serviceId?.title || order?.categoryId?.name || 'Job'}`,
        content: `
          <div style="margin-bottom:1rem;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">
              Your Price (₹) * ${basePrice > 0 ? `<span style="color:#f59e0b;font-weight:normal;">(Min: ₹${basePrice})</span>` : ''}
            </label>
            <input id="bid-amount" type="number" min="${basePrice || 1}" placeholder="${basePrice ? `Min ₹${basePrice}` : 'e.g. 2500'}" style="
              width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
              border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;
            " />
          </div>
          <div style="margin-bottom:1rem;">
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Estimated Days</label>
            <input id="bid-days" type="number" min="1" placeholder="e.g. 2" style="
              width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
              border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;
            " />
          </div>
          <div>
            <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Message (optional)</label>
            <textarea id="bid-msg" rows="3" placeholder="Introduce yourself and explain your approach..." style="
              width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
              border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;resize:vertical;font-family:inherit;
            "></textarea>
          </div>
        `,
        footer: `<div style="display:flex;gap:8px;justify-content:flex-end;">
          <button id="bid-cancel-btn" class="btn btn-secondary btn-sm">Cancel</button>
          <button id="submit-bid-btn" class="btn btn-primary btn-sm">Submit Quote</button>
        </div>`,
      });

      document.getElementById('bid-cancel-btn').addEventListener('click', () => Modal.closeAll());
      document.getElementById('submit-bid-btn').addEventListener('click', async () => {
        const amount = +document.getElementById('bid-amount').value;
        if (!amount || amount < 1) { Toast.error('Enter a valid price'); return; }
        if (basePrice > 0 && amount < basePrice) {
          Toast.error(`Bid amount cannot be less than the base price of ₹${basePrice}`);
          return;
        }
        
        const btn = document.getElementById('submit-bid-btn');
        setButtonLoading(btn, true);
        const res = await API.post('/quotes', {
          orderId, amount,
          estimatedDays: +document.getElementById('bid-days').value || undefined,
          message: document.getElementById('bid-msg').value,
        });
        setButtonLoading(btn, false, 'Submit Quote');
        if (res.success) { Modal.closeAll(); Toast.success('Quote submitted!'); }
      });
    }
  }, { title: 'Available Jobs' });
}

function jobCard(j) {
  return `
    <div style="background:#1a1d27;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:1.25rem;transition:all 0.2s;" onmouseenter="this.style.borderColor='rgba(245,158,11,0.25)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.07)'">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
        <div>
          <div style="font-weight:700;color:#f1f5f9;font-size:0.95rem;">${j.categoryId?.name || 'Service Job'}</div>
          <div style="color:#64748b;font-size:0.78rem;margin-top:2px;">${j.subcategoryId?.name || ''}</div>
        </div>
        ${Badge(j.status)}
      </div>
      ${j.description ? `<div style="color:#94a3b8;font-size:0.82rem;margin-bottom:10px;line-height:1.5;">${j.description.slice(0,120)}${j.description.length>120?'…':''}</div>` : ''}
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="color:#64748b;font-size:0.75rem;">📍 ${j.location?.address || 'Location TBD'} · ${DateUtil.relative(j.createdAt)}</div>
        <button data-bid="${j._id}" class="btn btn-primary btn-sm">Bid Now</button>
      </div>
    </div>
  `;
}
