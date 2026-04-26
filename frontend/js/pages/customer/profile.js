// js/pages/customer/profile.js
import { renderLayout } from '../../ui/layout.js';
import { Auth } from '../../core/auth.js';
import { Toast } from '../../components/toast.js';
import { setButtonLoading } from '../../components/form.js';

export async function profilePage() {
  renderLayout(async (content) => {
    const user = Auth.getUser();

    content.innerHTML = `
      <div class="fade-in-up" style="max-width:640px;">
        <div class="page-header"><h1>My Profile</h1></div>

        <div class="section-card" style="text-align:center;margin-bottom:1.25rem;">
          <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;font-size:1.75rem;font-weight:800;color:#0d0f14;margin:0 auto 12px;">
            ${(user?.name||'?').charAt(0).toUpperCase()}
          </div>
          <div style="font-size:1.2rem;font-weight:700;color:#f1f5f9;">${user?.name || '-'}</div>
          <div style="color:#64748b;font-size:0.85rem;">${user?.email || ''}</div>
          <div style="margin-top:8px;display:inline-flex;padding:3px 10px;background:rgba(245,158,11,0.1);border-radius:99px;font-size:0.75rem;color:#f59e0b;font-weight:600;text-transform:capitalize;">${user?.role || 'customer'}</div>
        </div>

        <div class="section-card">
          <h2>Edit Profile</h2>
          <form id="profile-form">
            <div class="grid-2" style="gap:12px;margin-bottom:1rem;">
              <div>
                <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Full Name</label>
                <input id="name" value="${user?.name||''}" style="
                  width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                  border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;
                " onfocus="this.style.borderColor='rgba(245,158,11,0.45)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'" />
              </div>
              <div>
                <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Phone</label>
                <input id="phone" value="${user?.phone||''}" style="
                  width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                  border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;
                " onfocus="this.style.borderColor='rgba(245,158,11,0.45)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'" />
              </div>
            </div>
            <div style="margin-bottom:1rem;">
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Email (read-only)</label>
              <input value="${user?.email||''}" readonly style="
                width:100%;padding:10px 12px;background:#0d0f14;border:1px solid rgba(255,255,255,0.04);
                border-radius:9px;color:#64748b;font-size:0.875rem;outline:none;font-family:inherit;
              " />
            </div>
            <button id="save-profile-btn" type="submit" class="btn btn-primary">Save Changes</button>
          </form>
        </div>

        <div class="section-card">
          <h2>Change Password</h2>
          <form id="pw-form">
            <div style="margin-bottom:1rem;">
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Current Password</label>
              <input id="current-pw" type="password" placeholder="••••••••" style="
                width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;
              " onfocus="this.style.borderColor='rgba(245,158,11,0.45)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'" />
            </div>
            <div class="grid-2" style="gap:12px;margin-bottom:1rem;">
              <div>
                <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">New Password</label>
                <input id="new-pw" type="password" placeholder="••••••••" style="
                  width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                  border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;
                " onfocus="this.style.borderColor='rgba(245,158,11,0.45)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'" />
              </div>
              <div>
                <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Confirm Password</label>
                <input id="confirm-pw" type="password" placeholder="••••••••" style="
                  width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                  border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;
                " onfocus="this.style.borderColor='rgba(245,158,11,0.45)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'" />
              </div>
            </div>
            <button id="save-pw-btn" type="submit" class="btn btn-secondary">Update Password</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('save-profile-btn');
      setButtonLoading(btn, true);
      const res = await Auth.updateProfile({
        name:  document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
      });
      setButtonLoading(btn, false, 'Save Changes');
      if (res.success) Toast.success('Profile updated!');
    });

    document.getElementById('pw-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPw  = document.getElementById('new-pw').value;
      const confPw = document.getElementById('confirm-pw').value;
      if (newPw !== confPw) { Toast.error('Passwords do not match'); return; }
      if (newPw.length < 8)  { Toast.error('Password must be at least 8 characters'); return; }
      const btn = document.getElementById('save-pw-btn');
      setButtonLoading(btn, true);
      const res = await Auth.changePassword({
        currentPassword: document.getElementById('current-pw').value,
        newPassword: newPw,
      });
      setButtonLoading(btn, false, 'Update Password');
      if (res.success) { Toast.success('Password updated!'); document.getElementById('pw-form').reset(); }
    });
  }, { title: 'Profile' });
}
