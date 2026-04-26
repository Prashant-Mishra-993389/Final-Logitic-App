// js/ui/layout.js — App shell: sidebar + navbar + content area
import { Sidebar } from '../components/sidebar.js';
import { Navbar } from '../components/navbar.js';
import { Auth } from '../core/auth.js';

export function renderLayout(contentFn, { title = '' } = {}) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- Global 3D Background Layer -->
    <div class="bg-3d-anim"><div class="grid-plane"></div></div>
  `;
  app.style.cssText = 'display:flex;min-height:100vh;background:#090d14;position:relative;z-index:1;';

  const sidebar = Sidebar();
  app.appendChild(sidebar);

  const main = document.createElement('div');
  main.style.cssText = `
    flex:1;margin-left:260px;display:flex;flex-direction:column;
    min-height:100vh;transition:margin-left 0.3s ease;
  `;
  main.id = 'main-area';

  const navbar = Navbar();
  main.appendChild(navbar);

  const content = document.createElement('main');
  content.id = 'page-content';
  content.style.cssText = `
    flex:1;padding:1.5rem;margin-top:70px;
    max-width:100%;overflow-x:hidden;
  `;
  main.appendChild(content);

  app.appendChild(main);

  if (title) {
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = title;
  }

  import('../core/state.js').then(({ AppState }) => {
    AppState.on('sidebarCollapsed', (collapsed) => {
      main.style.marginLeft = collapsed ? '64px' : '260px';
    });
  });

  if (typeof contentFn === 'function') {
    const result = contentFn(content);
    if (result instanceof Promise) result.catch(console.error);
  }

  return content;
}

export function setPageTitle(title) {
  const el = document.getElementById('page-title');
  if (el) el.textContent = title;
}

// Public layout (OneKeep front page)
export function renderPublicLayout(contentFn) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- Global 3D Background Layer -->
    <div class="bg-3d-anim"><div class="grid-plane"></div></div>
  `;
  app.style.cssText = 'min-height:100vh;background:#090d14;color:#f8fafc;position:relative;z-index:1;';

  const nav = document.createElement('header');
  nav.style.cssText = `
    position:sticky;top:0;background:rgba(9, 13, 20, 0.85);backdrop-filter:blur(16px);
    border-bottom:1px solid rgba(255,255,255,0.05);z-index:100;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 2rem;height:70px;
  `;
  
  nav.innerHTML = `
    <a href="#/" style="display:flex;align-items:center;gap:12px;text-decoration:none;">
      <div style="display:flex;align-items:center;justify-content:center;">
        <img src="./assets/oneKeep Logo.png" alt="OneKeep Logo" style="width:36px;height:36px;border-radius:10px;object-fit:cover;" />
      </div>
      <span style="font-weight:800;font-size:1.4rem;letter-spacing:0px;color:#f8fafc;font-family:'Space Grotesk',sans-serif;">OneKeep</span>
    </a>
    <div style="display:flex;align-items:center;gap:20px;">
      <a href="#/#reviews"    style="color:#94a3b8;text-decoration:none;font-size:0.9rem;font-weight:500;transition:color 0.2s;" onmouseenter="this.style.color='#38bdf8'" onmouseleave="this.style.color='#94a3b8'">Reviews</a>
      <a href="#/categories" style="color:#94a3b8;text-decoration:none;font-size:0.9rem;font-weight:500;transition:color 0.2s;" onmouseenter="this.style.color='#38bdf8'" onmouseleave="this.style.color='#94a3b8'">Services</a>
      <a href="#/about"      style="color:#94a3b8;text-decoration:none;font-size:0.9rem;font-weight:500;transition:color 0.2s;" onmouseenter="this.style.color='#38bdf8'" onmouseleave="this.style.color='#94a3b8'">About</a>
      <a href="#/contact"    style="color:#94a3b8;text-decoration:none;font-size:0.9rem;font-weight:500;transition:color 0.2s;" onmouseenter="this.style.color='#38bdf8'" onmouseleave="this.style.color='#94a3b8'">Contact</a>
      <div style="width:1px;height:24px;background:rgba(255,255,255,0.1);margin:0 4px;"></div>
      <a href="#/login" style="color:#f8fafc;text-decoration:none;font-size:0.9rem;font-weight:600;transition:opacity 0.2s;" onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'">Login</a>
      <a href="#/register" style="
        padding:8px 20px;background:linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%);color:#090d14;border-radius:8px;
        text-decoration:none;font-size:0.9rem;font-weight:700;transition:transform 0.2s, box-shadow 0.2s;
      " onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(56,189,248,0.3)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">Get Started</a>
    </div>
  `;
  app.appendChild(nav);

  const content = document.createElement('div');
  content.id = 'page-content';
  app.appendChild(content);

  if (typeof contentFn === 'function') contentFn(content);
  return content;
}