// js/pages/customer/payment.js — Payment page with Razorpay
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Auth } from '../../core/auth.js';
import { Toast } from '../../components/toast.js';
import { Formatter } from '../../utils/formatter.js';
import { CONFIG } from '../../core/config.js';
import { Badge } from '../../components/badge.js';
import { paymentSuccessPage, paymentFailurePage } from './paymentResult.js'; // ---> FIX: Make sure to import these if they are in the same file or a separate file!

function getOrderId() {
  const m = window.location.hash.match(/orderId=([^&]+)/);
  return m ? m[1] : null;
}

export async function paymentPage() {
  renderLayout(async (content) => {
    const orderId = getOrderId();
    
    // ... [Pending orders list logic remains exactly the same] ...
    if (!orderId) {
      const res = await API.get('/orders/my', { silent: true });
      const orders = res.orders || res.data || [];
      const pendingOrders = orders.filter(o => o.status === 'assigned' || o.status === 'completed' || o.status === 'in_progress');
      if (!pendingOrders.length) {
        content.innerHTML = '<div style="text-align:center;padding:4rem;color:#64748b;font-size:1.1rem;">No pending payments.</div>';
        return;
      }
      content.innerHTML = `
        <div class="fade-in-up">
          <div class="page-header"><h1>Pending Payments</h1><p>Select an order to complete your payment</p></div>
          <div class="grid-2">
            ${pendingOrders.map(o => `
              <div class="section-card" style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <h3 style="margin:0 0 5px 0;">${o.categoryId?.name || 'Service'}</h3>
                  <div style="font-size:0.8rem;color:#94a3b8;">Worker: ${o.providerId?.name || '-'}</div>
                </div>
                <a href="#/customer/payment?orderId=${o._id}" class="btn btn-primary">Pay Now</a>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      return;
    }

    try {
      const res  = await API.get(`/orders/${orderId}`);
      const order = res.order || res.data;
      if (!order) { content.innerHTML = '<div style="text-align:center;padding:4rem;color:#64748b;">Order not found</div>'; return; }

      const payRes  = await API.get(`/payments/order/${orderId}`, { silent: true });
      const payment = payRes.payment || payRes.data;

      const quotesRes = await API.get(`/quotes/order/${orderId}`, { silent: true });
      const quotes = quotesRes.quotes || quotesRes.data || [];
      const acceptedQuote = quotes.find(q => q.status === 'accepted');
      const amount = acceptedQuote?.totalAmount || order.finalPrice || order.quotedPrice || 0;
      const user   = Auth.getUser();

      if (!amount || amount <= 0) {
        content.innerHTML = `
          <div style="text-align:center;padding:4rem;color:#64748b;">
            <div style="font-size:2.5rem;margin-bottom:1rem;">⚠️</div>
            <div style="font-size:1.1rem;font-weight:600;color:#f1f5f9;margin-bottom:0.5rem;">No Payment Required Yet</div>
            <div style="font-size:0.875rem;">No accepted quote found for this order. The worker must submit a quote and you must accept it before proceeding to payment.</div>
            <a href="#/customer/quotes?orderId=${orderId}" class="btn btn-primary" style="margin-top:1.5rem;display:inline-block;">View Quotes</a>
          </div>`;
        return;
      }

      content.innerHTML = `
        <div class="fade-in-up" style="max-width:500px;margin:0 auto;">
          <div class="page-header"><h1>Payment</h1></div>
          <div class="section-card">
            <h2>Order Summary</h2>
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="color:#64748b;">Service</span>
              <span style="color:#f1f5f9;font-weight:500;">${order.categoryId?.name || 'Service'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="color:#64748b;">Worker</span>
              <span style="color:#f1f5f9;font-weight:500;">${order.providerId?.name || '-'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:14px 0;margin-top:4px;">
              <span style="font-weight:700;color:#f1f5f9;font-size:1rem;">Total Amount</span>
              <span style="font-size:1.5rem;font-weight:800;color:#f59e0b;">${Formatter.currency(amount)}</span>
            </div>
          </div>

          ${payment?.status === 'success' ? `
          <div class="section-card" style="text-align:center;border-color:rgba(34,197,94,0.3);background:rgba(34,197,94,0.05);">
            <div style="color:#22c55e;font-size:3rem;margin-bottom:1rem;">✅</div>
            <h2 style="color:#22c55e;margin-bottom:0.5rem;">Payment Already Completed</h2>
            <p style="color:#94a3b8;font-size:0.875rem;">This order has already been paid for.</p>
            <a href="#/customer/orders" class="btn btn-primary" style="margin-top:1.5rem;display:inline-block;">View Orders</a>
          </div>
          ` : `
          <div class="section-card">
            <h2 style="margin-bottom:1.5rem;">Select Payment Method</h2>
            <button id="pay-btn" class="btn btn-primary" style="width:100%;padding:14px;font-size:1.1rem;display:flex;align-items:center;justify-content:center;gap:10px;">
              <span style="font-size:1.2rem;">💳</span> Pay ${Formatter.currency(amount)} securely
            </button>
            <div style="text-align:center;margin-top:1rem;color:#64748b;font-size:0.75rem;">
              Secured by Razorpay. All major cards, UPI, and Netbanking supported.
            </div>
          </div>
          `}
        </div>
      `;

      if (payment?.status === 'success') return;

      document.getElementById('pay-btn').addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        btn.disabled = true; 
        btn.textContent = 'Creating order...';

        const createRes = await API.post('/payments/create-order', { orderId, amount });
        
        if (!createRes.success) {
          btn.disabled = false;
          btn.textContent = `Pay ${Formatter.currency(amount)} securely`;
          Toast.error(createRes.message || 'Failed to initialize payment');
          return;
        }

        // ---> FIX: Safely extract the order data regardless of your ApiResponse wrapper
        const rzpOrder = createRes.order || createRes.data?.order || createRes.data;
        
        if (!rzpOrder || !rzpOrder.id) {
          btn.disabled = false;
          btn.textContent = `Pay ${Formatter.currency(amount)} securely`;
          Toast.error('Invalid order data received from server.');
          return;
        }

        if (!window.Razorpay) {
           console.warn("Razorpay script not loaded, using mock verification.");
           const verifyRes = await API.post('/payments/verify', {
              orderId,
              razorpayOrderId: rzpOrder.id, // ---> FIX: use safely extracted id
              razorpayPaymentId: 'mock_pay_' + Date.now(),
              razorpaySignature: 'mock_signature',
              amount
           });
           if (verifyRes.success) { 
             Toast.success('Payment successful!'); 
             window.history.pushState(null, '', '#/payment/success?orderId=' + orderId);
             paymentSuccessPage(orderId);
           } else {
             Toast.error(verifyRes.message || 'Payment verification failed');
             window.history.pushState(null, '', '#/payment/failure?orderId=' + orderId);
             paymentFailurePage(orderId);
           }
           return;
        }

        const rzp = new Razorpay({
          key:         CONFIG.RAZORPAY_KEY || 'dummy_key',
          amount:      rzpOrder.amount, // ---> FIX: use safely extracted amount
          currency:    rzpOrder.currency || 'INR',
          name:        'IndustrialServ',
          description: `Payment for Order #${orderId.slice(-8)}`,
          order_id:    rzpOrder.id,     // ---> FIX: use safely extracted id
          prefill: { name: user?.name, email: user?.email, contact: user?.phone },
          theme:       { color: '#f59e0b' },
          handler: async (response) => {
            console.log('[Razorpay] Payment success handler called', response);
            btn.textContent = 'Verifying...'; // ---> FIX: UX feedback while verifying
            
            const verifyRes = await API.post('/payments/verify', {
              orderId,
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount
            });
            if (verifyRes.success) {
              Toast.success('Payment successful!');
              window.history.pushState(null, '', `#/payment/success?orderId=${orderId}`);
              paymentSuccessPage(orderId);
            } else {
              console.error('[Razorpay] Verification failed', verifyRes);
              Toast.error(verifyRes.message || 'Payment verification failed');
              window.history.pushState(null, '', `#/payment/failure?orderId=${orderId}`);
              paymentFailurePage(orderId);
            }
          },
          modal: { 
            ondismiss: () => { 
              console.log('[Razorpay] Modal closed by user');
              btn.disabled = false; 
              btn.textContent = `Pay ${Formatter.currency(amount)} securely`; 
            } 
          }
        });

        // ---> FIX: Catch direct Razorpay failures (e.g., card declined)
        rzp.on('payment.failed', function (response) {
          console.error('[Razorpay] Payment failed:', response.error);
          Toast.error(response.error.description || 'Payment failed');
          btn.disabled = false; 
          btn.textContent = `Pay ${Formatter.currency(amount)} securely`;
        });

        console.log('[Razorpay] Opening modal...');
        rzp.open();
      });
    } catch (err) {
      console.error('Payment Page Error:', err);
      content.innerHTML = `<div style="text-align:center;padding:4rem;color:#ef4444;">Failed to load payment details: ${err.message}</div>`;
    }
  }, { title: 'Payment' });
}