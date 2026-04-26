// js/pages/worker/availability.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Auth } from '../../core/auth.js';
import { Toast } from '../../components/toast.js';
import { setButtonLoading } from '../../components/form.js';

export async function availabilityPage() {
  renderLayout(async (content) => {
    const user = Auth.getUser();
    const res = await API.get('/auth/me', { silent: true });
    const wp = res.user?.workerProfile || {};

    content.innerHTML = `
      <div class="fade-in-up" style="max-width:640px;">
        <div class="page-header"><h1>Availability & Settings</h1></div>
        <form id="avail-form">
          <div class="section-card">
            <h2>Availability Status</h2>
            <label style="display:flex;align-items:center;gap:12px;cursor:pointer;padding:12px 0;">
              <div style="position:relative;width:50px;height:26px;">
                <input type="checkbox" id="is-available" ${wp.availability === 'available' ? 'checked':''} style="opacity:0;width:0;height:0;position:absolute;"
                  onchange="const t=this.nextElementSibling;t.style.background=this.checked?'#22c55e':'rgba(255,255,255,0.1)';t.querySelector('span').style.left=this.checked?'26px':'2px';document.getElementById('avail-label').textContent=this.checked?'Available for Jobs':'Not Available';"
                />
                <div style="position:absolute;inset:0;background:${wp.availability === 'available' ? '#22c55e':'rgba(255,255,255,0.1)'};border-radius:13px;transition:background 0.2s;">
                  <span style="position:absolute;top:2px;left:${wp.availability === 'available' ? '26':'2'}px;width:22px;height:22px;background:#fff;border-radius:50%;transition:left 0.2s;"></span>
                </div>
              </div>
              <span id="avail-label" style="font-weight:600;color:#f1f5f9;">${wp.availability === 'available' ? 'Available for Jobs' : (wp.availability === 'busy' ? 'Busy on a Job' : 'Not Available')}</span>
            </label>
          </div>

          <div class="section-card">
            <h2>Service Areas</h2>
            <textarea id="service-areas" rows="2" placeholder="e.g. Mumbai, Pune, Thane (comma separated)" style="
              width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
              border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;resize:vertical;font-family:inherit;
            ">${(wp.serviceAreas||[]).join(', ')}</textarea>
          </div>

          <div class="section-card">
            <h2>Skills & Languages</h2>
            <div class="grid-2" style="gap:12px;">
              <div>
                <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Skills</label>
                <textarea id="skills" rows="2" placeholder="e.g. Welding, Plumbing, Electrical" style="
                  width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                  border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;resize:vertical;font-family:inherit;
                ">${(wp.skills||[]).join(', ')}</textarea>
              </div>
              <div>
                <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Languages</label>
                <textarea id="languages" rows="2" placeholder="e.g. Hindi, English, Marathi" style="
                  width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                  border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;resize:vertical;font-family:inherit;
                ">${(wp.languages||[]).join(', ')}</textarea>
              </div>
            </div>
          </div>

          <div class="section-card">
            <h2>Bio</h2>
            <textarea id="bio" rows="3" placeholder="Tell customers about your experience and expertise..." style="
              width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
              border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;resize:vertical;font-family:inherit;
            ">${wp.bio||''}</textarea>
          </div>
          <button id="save-avail-btn" type="submit" class="btn btn-primary">Save Settings</button>
        </form>
      </div>
    `;

    document.getElementById('avail-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('save-avail-btn');
      setButtonLoading(btn, true);
      const r = await Auth.updateProfile({
        workerProfile: {
          isAvailable:  document.getElementById('is-available').checked,
          serviceAreas: document.getElementById('service-areas').value.split(',').map(s => s.trim()).filter(Boolean),
          skills:       document.getElementById('skills').value.split(',').map(s => s.trim()).filter(Boolean),
          languages:    document.getElementById('languages').value.split(',').map(s => s.trim()).filter(Boolean),
          bio:          document.getElementById('bio').value,
        }
      });
      setButtonLoading(btn, false, 'Save Settings');
      if (r.success) Toast.success('Settings saved!');
    });
  }, { title: 'Availability' });
}
