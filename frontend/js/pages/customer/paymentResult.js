// js/pages/customer/paymentResult.js — Standalone success/failure pages
import { Auth } from '../../core/auth.js';

// ---> FIX: Bulletproof render function that safely finds the container
function renderDirect(html, title = '') {
  if (title) {
    document.title = title + ' — IndustrialServ';
  }
  
  // Try 'app', fallback to 'root', or default to the entire body if neither exist
  const container = document.getElementById('app') || document.getElementById('root') || document.body;
  
  if (!container) {
    console.error('[PaymentResult] Critical Error: Could not find a container to render the UI.');
    return; 
  }
  
  container.style.cssText = 'min-height:100vh;background:#0d0f14;display:flex;align-items:center;justify-content:center;';
  container.innerHTML = html;
}

export async function paymentSuccessPage(passedOrderId) {
  const m = window.location.hash.match(/orderId=([^&]+)/);
  const orderId = passedOrderId || (m ? m[1] : null);
  const role = Auth.getRole();

  renderDirect(`
    <div style="max-width:460px;width:100%;padding:2rem;text-align:center;">
      <div style="
        background:#1a1d27;border:1px solid rgba(34,197,94,0.25);
        border-radius:20px;padding:3rem 2rem;
        box-shadow:0 0 60px rgba(34,197,94,0.08);
      ">
        <div style="
          width:80px;height:80px;border-radius:50%;
          background:rgba(34,197,94,0.12);border:2px solid rgba(34,197,94,0.3);
          display:flex;align-items:center;justify-content:center;
          font-size:2.5rem;margin:0 auto 1.5rem;
        ">✅</div>
        <h1 style="color:#22c55e;font-size:1.75rem;font-weight:800;margin-bottom:0.5rem;">Payment Successful!</h1>
        <p style="color:#94a3b8;margin-bottom:0.5rem;font-size:0.95rem;">
          Your payment has been confirmed and the job is now in progress.
        </p>
        ${orderId ? `<p style="color:#64748b;font-size:0.78rem;margin-bottom:2rem;">Order: ...${orderId.slice(-8)}</p>` : '<div style="margin-bottom:2rem;"></div>'}
        <div style="display:flex;flex-direction:column;gap:12px;">
          <a href="#/customer/orders" style="
            display:block;padding:12px 20px;background:#22c55e;color:#fff;
            border-radius:10px;text-decoration:none;font-weight:700;font-size:0.9rem;
            transition:opacity 0.2s;
          " onmouseenter="this.style.opacity='0.9'" onmouseleave="this.style.opacity='1'">
            📋 View My Orders
          </a>
          <a href="#/${role || 'customer'}/dashboard" style="
            display:block;padding:12px 20px;background:rgba(255,255,255,0.05);
            border:1px solid rgba(255,255,255,0.08);color:#94a3b8;
            border-radius:10px;text-decoration:none;font-weight:600;font-size:0.9rem;
          ">
            Go to Dashboard
          </a>
        </div>
      </div>
      <div style="margin-top:1.5rem;">
        <a href="#/" style="color:#64748b;font-size:0.8rem;text-decoration:none;">← Back to Home</a>
      </div>
    </div>
  `, 'Payment Successful');
}

export async function paymentFailurePage(passedOrderId) {
  const m = window.location.hash.match(/orderId=([^&]+)/);
  const orderId = passedOrderId || (m ? m[1] : null);
  const role = Auth.getRole();

  renderDirect(`
    <div style="max-width:460px;width:100%;padding:2rem;text-align:center;">
      <div style="
        background:#1a1d27;border:1px solid rgba(239,68,68,0.25);
        border-radius:20px;padding:3rem 2rem;
        box-shadow:0 0 60px rgba(239,68,68,0.08);
      ">
        <div style="
          width:80px;height:80px;border-radius:50%;
          background:rgba(239,68,68,0.12);border:2px solid rgba(239,68,68,0.3);
          display:flex;align-items:center;justify-content:center;
          font-size:2.5rem;margin:0 auto 1.5rem;
        ">❌</div>
        <h1 style="color:#ef4444;font-size:1.75rem;font-weight:800;margin-bottom:0.5rem;">Payment Failed</h1>
        <p style="color:#94a3b8;margin-bottom:2rem;font-size:0.95rem;">
          Your payment could not be processed. You have not been charged.
          Please try again or contact support.
        </p>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <a href="#/customer/payment${orderId ? `?orderId=${orderId}` : ''}" style="
            display:block;padding:12px 20px;background:#ef4444;color:#fff;
            border-radius:10px;text-decoration:none;font-weight:700;font-size:0.9rem;
          ">
            🔄 Try Again
          </a>
          <a href="#/customer/support" style="
            display:block;padding:12px 20px;background:rgba(255,255,255,0.05);
            border:1px solid rgba(255,255,255,0.08);color:#94a3b8;
            border-radius:10px;text-decoration:none;font-weight:600;font-size:0.9rem;
          ">
            Contact Support
          </a>
        </div>
      </div>
      <div style="margin-top:1.5rem;">
        <a href="#/${role || 'customer'}/dashboard" style="color:#64748b;font-size:0.8rem;text-decoration:none;">← Back to Dashboard</a>
      </div>
    </div>
  `, 'Payment Failed');
}