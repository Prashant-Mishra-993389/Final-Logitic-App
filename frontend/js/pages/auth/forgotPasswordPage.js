// js/pages/auth/forgotPasswordPage.js
import { renderPublicLayout } from '../../ui/layout.js';
import { Auth } from '../../core/auth.js';
import { Toast } from '../../components/toast.js';
import { setButtonLoading } from '../../components/form.js';

export async function forgotPasswordPage() {
  renderPublicLayout((content) => {
    content.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-logo">
            <span class="icon">🔑</span>
            <h1>Reset Password</h1>
            <p>Enter your email to receive reset instructions</p>
          </div>
          <form id="forgot-form">
            <div style="margin-bottom:1.25rem;">
              <label style="display:block;margin-bottom:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Email Address</label>
              <input id="email" type="email" placeholder="you@company.com" required style="
                width:100%;padding:11px 13px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;font-family:inherit;transition:border-color 0.2s;
              " onfocus="this.style.borderColor='rgba(245,158,11,0.45)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'" />
            </div>
            <button id="forgot-btn" type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;">
              Send Reset Email
            </button>
          </form>
          <p style="text-align:center;margin-top:1.25rem;color:#64748b;font-size:0.85rem;">
            <a href="#/login" style="color:#f59e0b;font-weight:600;">← Back to Login</a>
          </p>
        </div>
      </div>
    `;

    document.getElementById('forgot-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn   = document.getElementById('forgot-btn');
      const email = document.getElementById('email').value.trim();
      if (!email) { Toast.error('Please enter your email'); return; }
      setButtonLoading(btn, true);
      const res = await Auth.forgotPassword(email);
      setButtonLoading(btn, false, 'Send Reset Email');
      if (res.success || res.message) {
        Toast.success(res.message || 'Reset email sent! Check your inbox.');
      }
    });
  });
}
