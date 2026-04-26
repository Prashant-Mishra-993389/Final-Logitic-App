// js/pages/public/categories.js
import { renderPublicLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Loader } from '../../components/loader.js';

export async function categoriesPage() {
  renderPublicLayout(async (content) => {
    content.innerHTML = `
      <div class="bg-3d-anim" style="position:fixed; z-index:-1;"><div class="grid-plane"></div></div>
      <div style="max-width:1200px;margin:0 auto;padding:4rem 2rem;">
        <div class="reveal-up in-view" style="text-align:center; margin-bottom: 3rem;">
          <h1 style="font-size:2.5rem;font-weight:800;color:#f8fafc;margin-bottom:0.5rem;font-family:'Space Grotesk',sans-serif;">All Services</h1>
          <p style="color:#94a3b8;font-size:1.1rem;">Browse our complete catalog of industrial services</p>
        </div>
        <div id="cats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
          ${Loader.cardSkeleton(8)}
        </div>
      </div>
    `;

    const res = await API.get('/categories', { silent:true });
    const cats = res.categories || res.data || [];
    const grid = document.getElementById('cats-grid');
    if (!cats.length) { grid.innerHTML = '<div style="color:#64748b;grid-column:1 / -1;text-align:center;padding:3rem;">No categories available</div>'; return; }
    
    grid.innerHTML = cats.map((c, i) => `
      <a href="#/categories/${c._id}" class="shine-card reveal-up in-view" style="
        display:flex;flex-direction:column;text-align:left;text-decoration:none;animation-delay:${i * 0.05}s;
      ">
        <div style="font-size:2.5rem;margin-bottom:15px;color:#38bdf8;">${c.icon||'⚙'}</div>
        <div style="font-weight:700;color:#f8fafc;font-size:1.2rem;margin-bottom:8px;">${c.name}</div>
        <div style="font-size:0.9rem;color:#94a3b8;line-height:1.5;margin-bottom:1rem;">${(c.description||c.desc||'').slice(0,80)}</div>
        <div style="margin-top:auto;color:#38bdf8;font-size:0.9rem;font-weight:700;">View Services →</div>
      </a>
    `).join('');
  });
}

export async function categoryDetailsPage() {
  const m = window.location.hash.match(/categories\/([^/]+)/);
  const catId = m ? m[1] : null;

  renderPublicLayout(async (content) => {
    if (!catId) { content.innerHTML = '<div style="padding:4rem;text-align:center;color:#64748b;">Category not found</div>'; return; }

    content.innerHTML = `
      <div class="bg-3d-anim" style="position:fixed; z-index:-1;"><div class="grid-plane"></div></div>
      <div style="max-width:1200px;margin:0 auto;padding:4rem 2rem;">
        ${Loader.cardSkeleton(3)}
      </div>
    `;

    const [catRes, subcatRes] = await Promise.all([
      API.get(`/categories/${catId}`, { silent:true }),
      API.get(`/subcategories/category/${catId}`, { silent:true }),
    ]);
    const cat     = catRes.category    || catRes.data;
    const subcats = subcatRes.subcategories || subcatRes.data || [];

    content.innerHTML = `
      <div class="bg-3d-anim" style="position:fixed; z-index:-1;"><div class="grid-plane"></div></div>
      <div style="max-width:1200px;margin:0 auto;padding:4rem 2rem;">
        <div class="reveal-up in-view" style="margin-bottom: 3rem;">
          <a href="#/categories" style="color:#38bdf8;font-size:0.95rem;text-decoration:none;font-weight:600;">← Back to Catalog</a>
          <h1 style="font-size:2.5rem;font-weight:800;color:#f8fafc;margin:1rem 0 0.5rem;font-family:'Space Grotesk',sans-serif;">${cat?.name||'Category'}</h1>
          <p style="color:#94a3b8;font-size:1.1rem;">${cat?.description||''}</p>
        </div>
        
        <h2 class="reveal-up in-view" style="font-size:1.5rem;font-weight:700;color:#f8fafc;margin-bottom:1.5rem;font-family:'Space Grotesk',sans-serif;">Available Services</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          ${subcats.map((s, i) => `
            <a href="#/subcategories/${s._id}" class="shine-card reveal-up in-view" style="
              display:flex;flex-direction:column;text-decoration:none;animation-delay:${i * 0.05}s;
            ">
              <div style="font-weight:700;color:#f8fafc;font-size:1.1rem;margin-bottom:8px;">${s.name}</div>
              <div style="font-size:0.9rem;color:#94a3b8;line-height:1.5;margin-bottom:1rem;">${(s.description||'').slice(0,100)}</div>
              <div style="margin-top:auto;color:#38bdf8;font-size:0.9rem;font-weight:700;">Request Service →</div>
            </a>
          `).join('')}
          ${!subcats.length ? '<div style="color:#64748b;padding:2rem;grid-column:1 / -1;text-align:center;">No services available under this category</div>' : ''}
        </div>
      </div>
    `;
  });
}
