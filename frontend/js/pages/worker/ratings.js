// js/pages/worker/ratings.js
import { renderLayout } from '../../ui/layout.js';
import { API } from '../../core/api.js';
import { Auth } from '../../core/auth.js';
import { RatingStars } from '../../components/ratingStars.js';
import { EmptyState } from '../../components/emptyState.js';
import { DateUtil } from '../../utils/date.js';
import { Formatter } from '../../utils/formatter.js';

export async function ratingsPage() {
  renderLayout(async (content) => {
    const user = Auth.getUser();
    content.innerHTML = `
      <div class="fade-in-up">
        <div class="page-header"><h1>Ratings & Reviews</h1></div>
        <div class="section-card" style="text-align:center;margin-bottom:1.25rem;">
          <div style="font-size:3rem;font-weight:900;color:#f59e0b;" id="avg-rating">-</div>
          <div id="star-display"></div>
          <div style="color:#64748b;font-size:0.85rem;margin-top:4px;" id="total-reviews"></div>
        </div>
        <div class="section-card"><h2>All Reviews</h2><div id="reviews-list"></div></div>
      </div>
    `;

    const res = await API.get(`/reviews/user/${user?._id}`, { silent: true });
    const reviews = res.reviews || res.data || [];

    if (reviews.length) {
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      document.getElementById('avg-rating').textContent = avg.toFixed(1);
      document.getElementById('star-display').innerHTML = RatingStars(avg, 5, 24);
      document.getElementById('total-reviews').textContent = `${reviews.length} review${reviews.length > 1 ? 's' : ''}`;
    }

    const list = document.getElementById('reviews-list');
    if (!reviews.length) { list.innerHTML = EmptyState({ icon:'⭐', title:'No reviews yet', message:'Complete jobs to start receiving ratings.' }); return; }
    list.innerHTML = reviews.map(r => `
      <div style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;font-weight:700;color:#0d0f14;font-size:0.8rem;">
            ${Formatter.initials(r.reviewerId?.name || r.customer?.name || '?')}
          </div>
          <div>
            <div style="font-weight:600;color:#f1f5f9;font-size:0.875rem;">${r.reviewerId?.name || r.customer?.name || 'Customer'}</div>
            <div style="margin-top:2px;">${RatingStars(r.rating, 5, 12)}</div>
          </div>
          <div style="margin-left:auto;font-size:0.75rem;color:#64748b;">${DateUtil.relative(r.createdAt)}</div>
        </div>
        ${r.comment ? `<div style="color:#94a3b8;font-size:0.85rem;font-style:italic;">"${r.comment}"</div>` : ''}
      </div>
    `).join('');
  }, { title: 'Ratings' });
}
