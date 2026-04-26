// js/pages/auth/otpPage.js
import { renderPublicLayout } from '../../ui/layout.js';
import { Auth } from '../../core/auth.js';
import { OtpInput } from '../../components/otpInput.js';
import { Toast } from '../../components/toast.js';

export async function otpPage() {
  const email  = sessionStorage.getItem('otp_email') || '';
  const userId = sessionStorage.getItem('otp_userId') || '';

  renderPublicLayout((content) => {
    content.innerHTML = `
      <div class="auth-page">
        <div class="auth-card" style="text-align:center;">
          <div class="auth-logo">
            <span class="icon">📬</span>
            <h1>Verify Your Email</h1>
            <p>We sent a 6-digit code to<br/><strong style="color:#f59e0b;">${email || 'your email'}</strong></p>
          </div>
          <div id="otp-container" style="margin:1.75rem 0;"></div>
          <div id="otp-error" style="color:#ef4444;font-size:0.8rem;margin-bottom:1rem;min-height:1.2em;"></div>
          <button id="verify-btn" class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;">
            Verify & Continue
          </button>
          <div style="margin-top:1.25rem;">
            <button id="resend-btn" style="background:none;border:none;color:#f59e0b;cursor:pointer;font-size:0.85rem;font-family:inherit;">
              Didn't receive code? <strong>Resend</strong>
            </button>
          </div>
          <p style="margin-top:0.75rem;color:#64748b;font-size:0.8rem;">
            <a href="#/register" style="color:#94a3b8;text-decoration:none;">← Back to Register</a>
          </p>
        </div>
      </div>
    `;

    let otpValue = '';
    const otpCtrl = OtpInput('otp-container', (val) => { otpValue = val; });

    document.getElementById('verify-btn').addEventListener('click', async () => {
      const val = otpCtrl.getValue();
      if (val.length < 6) { Toast.error('Please enter the 6-digit OTP'); return; }
      const res = await Auth.verifyOtp({ userId, email, otp: val });
      if (res.success) {
        sessionStorage.removeItem('otp_email');
        sessionStorage.removeItem('otp_role');
        sessionStorage.removeItem('otp_userId');
        const role = Auth.getRole() || res.user?.role || sessionStorage.getItem('otp_role') || 'customer';
        sessionStorage.removeItem('otp_email');
        sessionStorage.removeItem('otp_role');
        window.location.hash = `#/${role}/dashboard`;
      } else {
        otpCtrl.setError();
        document.getElementById('otp-error').textContent = res.message || 'Invalid OTP';
      }
    });

    document.getElementById('resend-btn').addEventListener('click', async () => {
      const res = await Auth.register({ email });
      if (res.success || res.message) Toast.info('OTP resent to your email');
    });
  });
}
