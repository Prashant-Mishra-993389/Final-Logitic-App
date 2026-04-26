// js/pages/auth/registerPage.js
import { renderPublicLayout } from '../../ui/layout.js';
import { Auth } from '../../core/auth.js';
import { Validator } from '../../utils/validation.js';
import { Toast } from '../../components/toast.js';
import { setButtonLoading } from '../../components/form.js';

export async function registerPage() {
  renderPublicLayout((content) => {
    content.innerHTML = `
      <div class="bg-3d-anim" style="position:fixed; z-index:-1;"><div class="grid-plane"></div></div>
      <div class="auth-page">
        <div class="auth-card shine-card reveal-up in-view" style="max-width:500px;">
          <div class="auth-logo">
            <div class="icon" style="background:transparent; box-shadow:none;">
              <img src="./assets/oneKeep Logo.png" alt="OneKeep Logo" style="width:72px; height:72px; object-fit:contain;" />
            </div>
            <h1 style="font-family:'Space Grotesk',sans-serif; letter-spacing:-0.5px;">Create Account</h1>
            <p>Join OneKeep marketplace</p>
          </div>
          <form id="register-form">
            <div class="grid-2" style="gap:12px;margin-bottom:1.25rem;">
              <div>
                <label style="display:block;margin-bottom:8px;font-size:0.85rem;font-weight:600;color:#94a3b8;">Full Name *</label>
                <input id="name" type="text" placeholder="John Smith" required class="auth-input" />
              </div>
              <div>
                <label style="display:block;margin-bottom:8px;font-size:0.85rem;font-weight:600;color:#94a3b8;">Phone *</label>
                <input id="phone" type="tel" placeholder="9876543210" required class="auth-input" />
              </div>
            </div>
            <div style="margin-bottom:1.25rem;">
              <label style="display:block;margin-bottom:8px;font-size:0.85rem;font-weight:600;color:#94a3b8;">Email Address *</label>
              <input id="email" type="email" placeholder="you@company.com" required class="auth-input" />
            </div>
            <div style="margin-bottom:1.25rem;">
              <label style="display:block;margin-bottom:8px;font-size:0.85rem;font-weight:600;color:#94a3b8;">Password *</label>
              <input id="password" type="password" placeholder="Min 8 characters" required class="auth-input" />
            </div>
            <div style="margin-bottom:1.5rem;">
              <label style="display:block;margin-bottom:8px;font-size:0.85rem;font-weight:600;color:#94a3b8;">Register As *</label>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <label style="
                  display:flex;align-items:center;gap:10px;padding:12px;
                  background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);border-radius:10px;cursor:pointer;
                  transition:all 0.2s;
                " onmouseenter="this.style.borderColor='rgba(56,189,248,0.3)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.09)'">
                  <input type="radio" name="role" value="customer" checked style="accent-color:#38bdf8; width:16px; height:16px;" />
                  <div>
                    <div style="font-size:0.9rem;font-weight:700;color:#f8fafc;">👤 Customer</div>
                    <div style="font-size:0.75rem;color:#64748b;">Book services</div>
                  </div>
                </label>
                <label style="
                  display:flex;align-items:center;gap:10px;padding:12px;
                  background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);border-radius:10px;cursor:pointer;
                  transition:all 0.2s;
                " onmouseenter="this.style.borderColor='rgba(56,189,248,0.3)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.09)'">
                  <input type="radio" name="role" value="worker" style="accent-color:#38bdf8; width:16px; height:16px;" />
                  <div>
                    <div style="font-size:0.9rem;font-weight:700;color:#f8fafc;">🔧 Worker</div>
                    <div style="font-size:0.75rem;color:#64748b;">Offer services</div>
                  </div>
                </label>
              </div>
            </div>
            <button id="reg-btn" type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:14px;font-size:1rem;">Create Account</button>
          </form>
          <p style="text-align:center;margin-top:1.5rem;color:#94a3b8;font-size:0.9rem;">
            Already have an account? <a href="#/login" style="color:#38bdf8;font-weight:700;text-decoration:none;">Sign In</a>
          </p>
        </div>
      </div>
    `;

    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('reg-btn');
      const name     = document.getElementById('name').value.trim();
      const phone    = document.getElementById('phone').value.trim();
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const role     = document.querySelector('input[name="role"]:checked')?.value || 'customer';

      if (!name)  { Toast.error('Name is required'); return; }
      const emailErr = Validator.email(email);
      if (emailErr) { Toast.error(emailErr); return; }
      const pwErr = Validator.password(password);
      if (pwErr) { Toast.error(pwErr); return; }

      setButtonLoading(btn, true);
      const res = await Auth.register({ name, phone, email, password, role });
      setButtonLoading(btn, false, 'Create Account');

      if (res.success) {
        Toast.success('Account created! Check your email for OTP.');
        // Backend returns { data: { userId } } for register
        const userId = res.userId || res.data?.userId;
        sessionStorage.setItem('otp_email',  email);
        sessionStorage.setItem('otp_role',   role);
        if (userId) sessionStorage.setItem('otp_userId', userId);
        window.location.hash = '#/verify-otp';
      }
    });
  });
}
