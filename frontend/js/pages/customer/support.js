// js/pages/customer/support.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Toast } from '../../components/toast.js';
import { Badge } from '../../components/badge.js';
import { EmptyState } from '../../components/emptyState.js';
import { DateUtil } from '../../utils/date.js';
import { setButtonLoading } from '../../components/form.js';

export async function supportPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Support</h1></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
          <div class="section-card">
            <h2>Raise a Ticket</h2>
            <form id="support-form">
              <div style="margin-bottom:1rem;">
                <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Subject *</label>
                <input id="subject" type="text" placeholder="Brief issue summary" required style="
                  width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                  border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;
                " onfocus="this.style.borderColor='rgba(245,158,11,0.45)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'" />
              </div>
              <div style="margin-bottom:1rem;">
                <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Category</label>
                <select id="category" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;">
                  <option value="other">General / Other</option>
                  <option value="payment">Payment Issue</option>
                  <option value="service_issue">Service Issue</option>
                  <option value="delay">Delay in Service</option>
                  <option value="tracking">Tracking Problem</option>
                </select>
              </div>
              <div style="margin-bottom:1.25rem;">
                <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Description *</label>
                <textarea id="description" rows="4" placeholder="Describe your issue in detail..." required style="
                  width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                  border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;resize:vertical;font-family:inherit;
                " onfocus="this.style.borderColor='rgba(245,158,11,0.45)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'"></textarea>
              </div>
              <button id="ticket-btn" type="submit" class="btn btn-primary">Submit Ticket</button>
            </form>
          </div>
          <div class="section-card">
            <h2>My Tickets</h2>
            <div id="tickets-list"></div>
          </div>
        </div>
      </div>
    `;

    async function loadTickets() {
      const res = await API.get('/support/my', { silent: true });
      const tickets = res.tickets || res.data || [];
      const list = document.getElementById('tickets-list');
      if (!tickets.length) { list.innerHTML = EmptyState({ icon:'🎫', title:'No tickets yet' }); return; }
      list.innerHTML = tickets.map(t => `
        <div style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <div style="font-weight:600;color:#f1f5f9;font-size:0.875rem;">${t.subject}</div>
            ${Badge(t.status)}
          </div>
          <div style="color:#64748b;font-size:0.75rem;">${DateUtil.relative(t.createdAt)}</div>
          ${t.resolutionNotes ? `<div style="margin-top:8px;padding:10px;background:rgba(59,130,246,0.1);border-left:2px solid #3b82f6;border-radius:4px;color:#cbd5e1;font-size:0.8rem;"><strong style="color:#3b82f6;">Admin Reply:</strong> ${t.resolutionNotes}</div>` : ''}
        </div>
      `).join('');
    }

    document.getElementById('support-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('ticket-btn');
      setButtonLoading(btn, true);
      const res = await API.post('/support', {
        subject:     document.getElementById('subject').value,
        description: document.getElementById('description').value,
        category:    document.getElementById('category').value,
      });
      setButtonLoading(btn, false, 'Submit Ticket');
      if (res.success) {
        Toast.success('Support ticket created!');
        document.getElementById('support-form').reset();
        loadTickets();
      }
    });

    loadTickets();
  }, { title: 'Support' });
}
