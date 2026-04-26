// js/pages/customer/reviews.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Auth } from '../../core/auth.js';
import { Toast } from '../../components/toast.js';
import { EmptyState } from '../../components/emptyState.js';
import { InteractiveRating, RatingStars } from '../../components/ratingStars.js';
import { DateUtil } from '../../utils/date.js';
import { setButtonLoading } from '../../components/form.js';

function getOrderId() {
  const m = window.location.hash.match(/orderId=([^&]+)/);
  return m ? m[1] : null;
}

export async function reviewsPage() {
  renderLayout(async (content) => {
    const user = Auth.getUser();
    const orderId = getOrderId();

    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Reviews & Ratings</h1></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">
          <div class="section-card">
            <h2>${orderId ? 'Leave a Review' : 'Write a Review'}</h2>
            ${!orderId ? `
            <div style="margin-bottom:1rem;">
              <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Select Order</label>
              <select id="review-order-sel" style="width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;">
                <option>Loading...</option>
              </select>
            </div>` : ''}
            <form id="review-form">
              <div style="margin-bottom:1rem;">
                <label style="display:block;margin-bottom:8px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Your Rating *</label>
                <div id="star-input"></div>
              </div>
              <div style="margin-bottom:1.25rem;">
                <label style="display:block;margin-bottom:5px;font-size:0.8rem;font-weight:600;color:#94a3b8;">Your Review</label>
                <textarea id="review-text" rows="4" placeholder="Share your experience with this service..." style="
                  width:100%;padding:10px 12px;background:#13161e;border:1px solid rgba(255,255,255,0.08);
                  border-radius:9px;color:#f1f5f9;font-size:0.875rem;outline:none;resize:vertical;font-family:inherit;
                " onfocus="this.style.borderColor='rgba(245,158,11,0.45)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'"></textarea>
              </div>
              <button id="review-btn" type="submit" class="btn btn-primary">Submit Review</button>
            </form>
          </div>
          <div class="section-card">
            <h2>My Reviews</h2>
            <div id="reviews-list"></div>
          </div>
        </div>
      </div>
    `;

    // Interactive star rating
    let selectedRating = 0;
    const starEl = InteractiveRating({ id: 'rating-val', onRate: (v) => { selectedRating = v; } });
    document.getElementById('star-input').appendChild(starEl);

    // Load orders for select
    if (!orderId) {
      const res = await API.get('/orders/my', { silent: true });
      window.myOrders = (res.orders || res.data || []).filter(o => o.status === 'completed');
      const sel = document.getElementById('review-order-sel');
      sel.innerHTML = `<option value="">-- Select Completed Order --</option>` +
        window.myOrders.map(o => `<option value="${o._id}">${o.categoryId?.name || o.categoryId?.name || 'Order'} — ${DateUtil.format(o.createdAt)}</option>`).join('');
    }

    // Load my reviews
    async function loadMyReviews() {
      const res = await API.get(`/reviews/user/${user?._id}`, { silent: true });
      const reviews = res.reviews || res.data || [];
      const list = document.getElementById('reviews-list');
      if (!reviews.length) { list.innerHTML = EmptyState({ icon:'⭐', title:'No reviews yet' }); return; }
      list.innerHTML = reviews.map(r => `
        <div style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <div style="font-size:0.85rem;font-weight:600;color:#f1f5f9;">${r.orderId?.categoryId?.name || r.orderId?.categoryId?.name || 'Service'}</div>
            ${RatingStars(r.rating)}
          </div>
          ${r.comment ? `<div style="color:#94a3b8;font-size:0.82rem;margin-top:4px;">"${r.comment}"</div>` : ''}
          <div style="color:#64748b;font-size:0.72rem;margin-top:4px;">${DateUtil.relative(r.createdAt)}</div>
        </div>
      `).join('');
    }

    document.getElementById('review-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!selectedRating) { Toast.error('Please select a rating'); return; }
      const oId = orderId || document.getElementById('review-order-sel')?.value;
      if (!oId) { Toast.error('Please select an order'); return; }
      
      let revieweeId = null;
      if (orderId) {
        const oRes = await API.get(`/orders/${orderId}`);
        const orderData = oRes.order || oRes.data;
        revieweeId = orderData?.providerId?._id || orderData?.providerId;
      } else {
        const selectedOrder = window.myOrders?.find(o => o._id === oId);
        revieweeId = selectedOrder?.providerId?._id || selectedOrder?.providerId;
      }
      
      if (!revieweeId) { Toast.error('Provider not found for this order. Cannot review.'); return; }

      const btn = document.getElementById('review-btn');
      setButtonLoading(btn, true);
      const res = await API.post('/reviews', {
        orderId: oId,
        revieweeId,
        rating: selectedRating,
        comment: document.getElementById('review-text').value,
      });
      setButtonLoading(btn, false, 'Submit Review');
      if (res.success) { Toast.success('Review submitted!'); document.getElementById('review-form').reset(); selectedRating = 0; loadMyReviews(); }
    });

    loadMyReviews();
  }, { title: 'Reviews' });
}
