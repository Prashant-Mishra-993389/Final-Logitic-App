// js/pages/public/about.js
import { renderPublicLayout } from '../../ui/layout.js';

export function aboutPage() {
  renderPublicLayout((content) => {
    content.innerHTML = `
      <div style="max-width:800px;margin:0 auto;padding:4rem 2rem;text-align:center;">
        <h1 style="font-size:2.5rem;font-weight:900;color:#f1f5f9;margin-bottom:1rem;">About IndustrialServ</h1>
        <p style="color:#64748b;font-size:1.05rem;line-height:1.8;margin-bottom:2rem;">
          IndustrialServ is India's leading industrial service marketplace, connecting businesses with verified skilled workers for all types of industrial maintenance, repair, and operational needs.
        </p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin:2.5rem 0;">
          ${[['🎯','Our Mission','To make industrial services accessible, transparent, and reliable for every business in India.'],
             ['👁️','Our Vision','A future where every industrial service request is fulfilled by the right verified professional at a fair price.'],
             ['💡','Our Values','Transparency, quality, speed, and trust form the pillars of everything we do.']].map(([i,t,d])=>`
            <div style="background:#1a1d27;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:1.5rem;text-align:center;">
              <div style="font-size:2rem;margin-bottom:10px;">${i}</div>
              <div style="font-weight:700;color:#f1f5f9;margin-bottom:8px;">${t}</div>
              <div style="color:#64748b;font-size:0.85rem;line-height:1.6;">${d}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
}

// js/pages/public/contact.js — bundled here to keep files fewer
export function contactPage() {
  renderPublicLayout((content) => {
    content.innerHTML = `
      <div style="max-width:560px;margin:0 auto;padding:4rem 2rem;">
        <h1 style="font-size:2rem;font-weight:800;color:#f1f5f9;margin-bottom:0.5rem;">Contact Us</h1>
        <p style="color:#64748b;margin-bottom:2rem;">We're here to help. Send us a message and we'll get back within 24 hours.</p>
        <div style="background:#1a1d27;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:2rem;">
          <form id="contact-form">
            <div style="margin-bottom:1rem;">
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Your Name</label>
              <input id="contact-name" placeholder="John Smith" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
            </div>
            <div style="margin-bottom:1rem;">
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Email</label>
              <input id="contact-email" type="email" placeholder="you@company.com" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;" />
            </div>
            <div style="margin-bottom:1.5rem;">
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Message</label>
              <textarea id="contact-msg" rows="4" placeholder="How can we help?" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;resize:vertical;font-family:inherit;"></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;">Send Message</button>
          </form>
        </div>
        <div style="margin-top:2rem;display:grid;gap:12px;">
          ${[['📧','deveshrao130@gmail.com'],['📍','Mumbai, Maharashtra, India'],['⏰','Mon–Sat: 9AM–7PM IST']].map(([i,t])=>`
            <div style="display:flex;align-items:center;gap:10px;color:#64748b;font-size:0.875rem;">${i} ${t}</div>
          `).join('')}
        </div>
      </div>
    `;

    import('../../components/toast.js').then(({ Toast }) => {
      document.getElementById('contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        Toast.success('Message sent! We\'ll get back to you soon.');
        document.getElementById('contact-form').reset();
      });
    });
  });
}
