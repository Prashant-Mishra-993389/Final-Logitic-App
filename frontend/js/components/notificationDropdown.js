// js/components/notificationDropdown.js
import { API } from '../core/api.js';
import { AppState } from '../core/state.js';
import { DateUtil } from '../utils/date.js';

export function NotificationDropdown() {
  const btn = document.createElement('div');
  btn.style.cssText = 'position:relative;display:inline-flex;';
  btn.innerHTML = `
    <button id="notif-btn" style="
      background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
      border-radius:9px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;
      cursor:pointer;color:#f1f5f9;font-size:1.1rem;position:relative;transition:all 0.2s;
    ">🔔<span id="notif-badge" style="
      display:none;position:absolute;top:-4px;right:-4px;
      background:#ef4444;color:#fff;font-size:0.6rem;font-weight:700;
      border-radius:9999px;min-width:16px;height:16px;
      align-items:center;justify-content:center;padding:0 3px;
    ">0</span></button>
    <div id="notif-panel" style="
      display:none;position:absolute;top:calc(100% + 8px);right:0;
      width:340px;background:#1a1d27;border:1px solid rgba(255,255,255,0.08);
      border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,0.5);
      z-index:1000;animation:scaleIn 0.2s ease;overflow:hidden;
    ">
      <div style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:space-between;">
        <span style="font-weight:700;font-size:0.9rem;color:#f1f5f9;">Notifications</span>
        <button id="notif-read-all" style="background:none;border:none;color:#f59e0b;font-size:0.75rem;cursor:pointer;">Mark all read</button>
      </div>
      <div id="notif-list" style="max-height:360px;overflow-y:auto;"></div>
    </div>
  `;

  const panel = btn.querySelector('#notif-panel');
  const badge = btn.querySelector('#notif-badge');
  let open = false;

  btn.querySelector('#notif-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    open = !open;
    panel.style.display = open ? 'block' : 'none';
    if (open) await loadNotifications();
  });

  document.addEventListener('click', () => { open = false; panel.style.display = 'none'; });

  btn.querySelector('#notif-read-all').addEventListener('click', async () => {
    await API.patch('/notifications/read-all');
    await loadNotifications();
  });

  async function loadNotifications() {
    const list = btn.querySelector('#notif-list');
    list.innerHTML = `<div style="padding:1.5rem;text-align:center;color:#64748b;font-size:0.8rem;">Loading...</div>`;
    const res = await API.get('/notifications/my', { silent: true });
    const notifs = res.notifications || res.data || [];
    AppState.set('unreadNotifications', notifs.filter(n => !n.isRead).length);
    updateBadge(notifs.filter(n => !n.isRead).length);

    if (!notifs.length) {
      list.innerHTML = `<div style="padding:2rem;text-align:center;color:#64748b;font-size:0.85rem;">No notifications</div>`;
      return;
    }
    list.innerHTML = notifs.slice(0,15).map(n => `
      <div data-id="${n._id}" style="
        padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);
        background:${n.isRead?'transparent':'rgba(245,158,11,0.04)'};
        cursor:pointer;transition:background 0.15s;
      " onmouseenter="this.style.background='rgba(255,255,255,0.03)'" onmouseleave="this.style.background='${n.isRead?'transparent':'rgba(245,158,11,0.04)'}'">
        <div style="display:flex;gap:10px;">
          <div style="font-size:1.2rem;flex-shrink:0;">${n.type==='order'?'📋':n.type==='payment'?'💳':n.type==='chat'?'💬':'🔔'}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.82rem;color:${n.isRead?'#94a3b8':'#f1f5f9'};font-weight:${n.isRead?400:600};white-space:normal;">${n.message}</div>
            <div style="font-size:0.72rem;color:#64748b;margin-top:3px;">${DateUtil.relative(n.createdAt)}</div>
          </div>
          ${!n.isRead ? '<div style="width:6px;height:6px;border-radius:50%;background:#f59e0b;flex-shrink:0;margin-top:4px;"></div>' : ''}
        </div>
      </div>
    `).join('');

    list.querySelectorAll('[data-id]').forEach(item => {
      item.addEventListener('click', () => API.patch(`/notifications/${item.dataset.id}/read`, {}, { silent: true }));
    });
  }

  function updateBadge(count) {
    badge.textContent = count > 9 ? '9+' : count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  AppState.on('unreadNotifications', updateBadge);

  return btn;
}
