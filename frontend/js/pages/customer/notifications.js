// js/pages/customer/notifications.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { EmptyState } from '../../components/emptyState.js';
import { DateUtil } from '../../utils/date.js';
import { Toast } from '../../components/toast.js';

export async function notificationsPage() {
  renderLayout(async (content) => {
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header">
          <div><h1>Notifications</h1></div>
          <button id="read-all-btn" class="btn btn-secondary btn-sm">✓ Mark All Read</button>
        </div>
        <div class="section-card"><div id="notif-list"></div></div>
      </div>
    `;

    async function load() {
      const res = await API.get('/notifications/my', { silent: true });
      const notifs = res.notifications || res.data || [];
      const list = document.getElementById('notif-list');

      if (!notifs.length) { list.innerHTML = EmptyState({ icon:'🔔', title:'No notifications', message:'You are all caught up!' }); return; }

      list.innerHTML = notifs.map(n => `
        <div data-id="${n._id}" style="
          display:flex;gap:12px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.05);
          cursor:pointer;background:${n.isRead?'transparent':'rgba(245,158,11,0.03)'};
          transition:opacity 0.15s;
        " onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'">
          <div style="font-size:1.4rem;flex-shrink:0;">${n.type==='order'?'📋':n.type==='payment'?'💳':n.type==='chat'?'💬':n.type==='quote'?'💡':'🔔'}</div>
          <div style="flex:1;">
            <div style="font-size:0.875rem;font-weight:${n.isRead?400:600};color:${n.isRead?'#94a3b8':'#f1f5f9'};">${n.message}</div>
            <div style="font-size:0.75rem;color:#64748b;margin-top:3px;">${DateUtil.relative(n.createdAt)}</div>
          </div>
          ${!n.isRead ? '<div style="width:8px;height:8px;border-radius:50%;background:#f59e0b;flex-shrink:0;margin-top:6px;"></div>' : ''}
        </div>
      `).join('');

      list.querySelectorAll('[data-id]').forEach(item => {
        item.addEventListener('click', () => {
          API.patch(`/notifications/${item.dataset.id}/read`, {}, { silent: true });
          item.style.background = 'transparent';
          item.querySelector('[style*="background:#f59e0b"]')?.remove();
        });
      });
    }

    document.getElementById('read-all-btn').addEventListener('click', async () => {
      await API.patch('/notifications/read-all');
      Toast.success('All notifications marked as read');
      load();
    });

    load();
  }, { title: 'Notifications' });
}
