// js/components/sidebar.js — Collapsible sidebar navigation
import { AppState } from '../core/state.js';
import { Auth } from '../core/auth.js';
import { NAV_CUSTOMER, NAV_WORKER, NAV_ADMIN } from '../utils/constants.js';

const NAV_MAP = { customer: NAV_CUSTOMER, worker: NAV_WORKER, admin: NAV_ADMIN };

export function Sidebar() {
  const role = Auth.getRole() || 'customer';
  const navItems = NAV_MAP[role] || NAV_CUSTOMER;

  const sidebar = document.createElement('nav');
  sidebar.id = 'app-sidebar';
  sidebar.style.cssText = `
    position:fixed;top:0;left:0;bottom:0;width:260px;
    background:#0f1117;border-right:1px solid rgba(255,255,255,0.07);
    display:flex;flex-direction:column;z-index:200;transition:width 0.3s ease;overflow:hidden;
  `;

  sidebar.innerHTML = `
    <div id="sidebar-logo" style="
      padding:0 1.25rem;height:64px;display:flex;align-items:center;gap:12px;
      border-bottom:1px solid rgba(255,255,255,0.07);flex-shrink:0;
    ">
      <div style="
        width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;
        flex-shrink:0; overflow:hidden;
      "><img src="./assets/oneKeep Logo.png" alt="OneKeep" style="width:100%;height:100%;object-fit:cover;" /></div>
      <div id="sidebar-brand" style="overflow:hidden;transition:opacity 0.2s;">
        <div style="font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:1.1rem;color:#f8fafc;white-space:nowrap;letter-spacing:0px;">OneKeep</div>
        <div style="font-size:0.75rem;color:#64748b;text-transform:capitalize;">${role} Portal</div>
      </div>
    </div>
    <div style="flex:1;overflow-y:auto;padding:0.75rem 0.75rem;" id="sidebar-nav">
      ${navItems.map(item => `
        <a href="${item.route}" class="nav-item" data-route="${item.route}" style="
          display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;
          color:#94a3b8;text-decoration:none;transition:all 0.15s;margin-bottom:2px;
          font-size:0.875rem;font-weight:500;white-space:nowrap;
        "
        onmouseenter="if(!this.classList.contains('active')){this.style.background='rgba(255,255,255,0.04)';this.style.color='#f8fafc';}"
        onmouseleave="if(!this.classList.contains('active')){this.style.background='';this.style.color='#94a3b8';}"
        >
          <span style="font-size:1rem;width:20px;text-align:center;flex-shrink:0;">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      `).join('')}
    </div>
    <div style="padding:0.75rem;border-top:1px solid rgba(255,255,255,0.07);">
      <button id="sidebar-logout" style="
        display:flex;align-items:center;gap:10px;padding:10px 12px;width:100%;
        background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.15);
        border-radius:9px;color:#ef4444;cursor:pointer;font-size:0.875rem;font-weight:500;
        font-family:Inter,sans-serif;transition:all 0.2s;white-space:nowrap;
      " onmouseenter="this.style.background='rgba(239,68,68,0.15)'" onmouseleave="this.style.background='rgba(239,68,68,0.08)'">
        <span style="width:20px;text-align:center;font-size:1rem;">⬅</span>
        <span class="nav-label">Logout</span>
      </button>
    </div>
  `;

  sidebar.querySelector('#sidebar-logout').addEventListener('click', () => Auth.logout());

  // Highlight active route
  function updateActive() {
    const hash = window.location.hash;
    sidebar.querySelectorAll('.nav-item').forEach(a => {
      const active = hash === a.dataset.route || hash.startsWith(a.dataset.route + '/');
      a.classList.toggle('active', active);
      a.style.background = active ? 'rgba(56,189,248,0.1)' : '';
      a.style.color       = active ? '#38bdf8' : '';
      if (active) a.style.borderLeft = '2px solid #38bdf8';
      else a.style.borderLeft = '';
    });
  }
  window.addEventListener('hashchange', updateActive);
  updateActive();

  // Collapse
  AppState.on('sidebarCollapsed', (collapsed) => {
    sidebar.style.width = collapsed ? '64px' : '260px';
    sidebar.querySelectorAll('.nav-label').forEach(l => l.style.opacity = collapsed ? '0' : '1');
    const brand = sidebar.querySelector('#sidebar-brand');
    if (brand) brand.style.opacity = collapsed ? '0' : '1';
  });

  return sidebar;
}
