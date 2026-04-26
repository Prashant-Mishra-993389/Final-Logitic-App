// js/pages/auth/loginPage.js
import { renderPublicLayout } from '../../ui/layout.js';
import { Auth } from '../../core/auth.js';
import { Validator } from '../../utils/validation.js';
import { Toast } from '../../components/toast.js';
import { setButtonLoading } from '../../components/form.js';

export async function loginPage() {
  renderPublicLayout((content) => {
    content.innerHTML = `
      <!-- Background 3D Layer (Optional for auth pages or rely on global) -->
      <div class="bg-3d-anim" style="position:fixed; z-index:-1;"><div class="grid-plane"></div></div>
      
      <div class="auth-page">
        <div class="auth-card shine-card reveal-up in-view">
          <div class="auth-logo">
            <div class="icon" style="background:transparent; box-shadow:none;">
              <img src="./assets/oneKeep Logo.png" alt="OneKeep Logo" style="width:72px; height:72px; object-fit:contain;" />
            </div>
            <h1 style="font-family:'Space Grotesk',sans-serif; letter-spacing:-0.5px;">Welcome Back</h1>
            <p>Sign in to OneKeep</p>
          </div>
          <form id="login-form">
            <div style="margin-bottom:1.25rem;">
              <label style="display:block;margin-bottom:8px;font-size:0.85rem;font-weight:600;color:#94a3b8;">Email Address</label>
              <input id="email" type="email" placeholder="you@company.com" class="auth-input" />
            </div>
            <div style="margin-bottom:1.5rem;">
              <label style="display:block;margin-bottom:8px;font-size:0.85rem;font-weight:600;color:#94a3b8;">Password</label>
              <div style="position:relative;">
                <input id="password" type="password" placeholder="••••••••" class="auth-input" style="padding-right:40px;" />
                <button type="button" id="toggle-pw" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#64748b;cursor:pointer;font-size:1rem; transition:color 0.2s;" onmouseenter="this.style.color='#38bdf8'" onmouseleave="this.style.color='#64748b'">👁</button>
              </div>
              <div style="text-align:right;margin-top:8px;">
                <a href="#/forgot-password" style="font-size:0.85rem;color:#38bdf8;text-decoration:none;font-weight:500;">Forgot password?</a>
              </div>
            </div>
            <button id="login-btn" type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:14px;font-size:1rem;">Sign In</button>
          </form>
          <p style="text-align:center;margin-top:1.5rem;color:#94a3b8;font-size:0.9rem;">
            Don't have an account? <a href="#/register" style="color:#38bdf8;font-weight:700;text-decoration:none;">Register</a>
          </p>
        </div>
      </div>
    `;

    document.getElementById('toggle-pw').addEventListener('click', () => {
      const pw = document.getElementById('password');
      pw.type = pw.type === 'password' ? 'text' : 'password';
    });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      const err = Validator.run(email, Validator.required, Validator.email);
      if (err) { Toast.error(err); return; }
      if (!password) { Toast.error('Password is required'); return; }

      setButtonLoading(btn, true);
      const res = await Auth.login(email, password);
      setButtonLoading(btn, false, 'Sign In');

      if (res.success) {
        Toast.success('Welcome back!');
        const role = Auth.getRole() || res.user?.role || 'customer';
        window.location.hash = `#/${role}/dashboard`;
      }
    });
  });
}
