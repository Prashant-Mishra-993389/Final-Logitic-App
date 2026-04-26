// js/components/navbar.js — Top navigation bar
import { Auth } from '../core/auth.js';
import { AppState } from '../core/state.js';
import { Router } from '../core/router.js';
import { NotificationDropdown } from './notificationDropdown.js';
import { Formatter } from '../utils/formatter.js';

export function Navbar() {
  const bar = document.createElement('header');
  bar.id = 'app-navbar';
  bar.style.cssText = `
    position:fixed;top:0;left:var(--sidebar-w,260px);right:0;height:64px;
    background:#0f1117;border-bottom:1px solid rgba(255,255,255,0.07);
    display:flex;align-items:center;justify-content:space-between;
    padding:0 1.5rem;z-index:100;transition:left 0.3s ease;backdrop-filter:blur(10px);
  `;

  const user = Auth.getUser();
  const initials = Formatter.initials(user?.name || '?');

  bar.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;">
      <button id="sidebar-toggle" style="
        background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
        border-radius:8px;width:36px;height:36px;cursor:pointer;color:#94a3b8;
        font-size:1rem;display:flex;align-items:center;justify-content:center;
        transition:all 0.2s;
      ">☰</button>
      <div id="page-title" style="font-weight:700;font-size:1rem;color:#f1f5f9;"></div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;" id="navbar-right"></div>
  `;

  const right = bar.querySelector('#navbar-right');

  // Notification dropdown
  right.appendChild(NotificationDropdown());

  // Avatar + dropdown
  const avatarWrap = document.createElement('div');
  avatarWrap.style.cssText = 'position:relative;';
  avatarWrap.innerHTML = `
    <button id="avatar-btn" style="
      display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.05);
      border:1px solid rgba(255,255,255,0.08);border-radius:9px;padding:6px 10px;
      cursor:pointer;transition:all 0.2s;
    ">
      <div style="
        width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%);
        display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;color:#090d14;
      ">${initials}</div>
      <span style="color:#f8fafc;font-size:0.8rem;font-weight:600;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${user?.name || 'User'}</span>
      <span style="color:#64748b;font-size:0.7rem;">▾</span>
    </button>
    <div id="avatar-menu" style="
      display:none;position:absolute;top:calc(100% + 6px);right:0;
      width:180px;background:#1a1d27;border:1px solid rgba(255,255,255,0.08);
      border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.4);z-index:1001;overflow:hidden;
    ">
      <a href="#/${Auth.getRole()}/profile" style="display:block;padding:10px 14px;color:#94a3b8;font-size:0.85rem;text-decoration:none;" 
         onmouseenter="this.style.background='rgba(255,255,255,0.04)'" onmouseleave="this.style.background=''">👤 Profile</a>
      <div style="height:1px;background:rgba(255,255,255,0.07);"></div>
      <button id="logout-btn" style="
        width:100%;text-align:left;padding:10px 14px;background:none;border:none;
        color:#ef4444;font-size:0.85rem;cursor:pointer;font-family:Inter,sans-serif;
      " onmouseenter="this.style.background='rgba(239,68,68,0.08)'" onmouseleave="this.style.background=''">⬅ Logout</button>
    </div>
  `;

  right.appendChild(avatarWrap);

  // Toggle avatar menu
  let menuOpen = false;
  avatarWrap.querySelector('#avatar-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    menuOpen = !menuOpen;
    avatarWrap.querySelector('#avatar-menu').style.display = menuOpen ? 'block' : 'none';
  });
  document.addEventListener('click', () => {
    menuOpen = false;
    avatarWrap.querySelector('#avatar-menu').style.display = 'none';
  });

  // Logout
  avatarWrap.querySelector('#logout-btn').addEventListener('click', () => Auth.logout());

  // Sidebar toggle
  bar.querySelector('#sidebar-toggle').addEventListener('click', () => {
    const collapsed = AppState.get('sidebarCollapsed');
    AppState.set('sidebarCollapsed', !collapsed);
  });

  // Listen for sidebar collapse
  AppState.on('sidebarCollapsed', (collapsed) => {
    bar.style.left = collapsed ? '64px' : '260px';
  });

  return bar;
}
