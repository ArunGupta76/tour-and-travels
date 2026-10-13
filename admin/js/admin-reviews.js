/**
 * ADMIN REVIEWS JAVASCRIPT (admin-reviews.js)
 */

let allReviews = [];

document.addEventListener('DOMContentLoaded', () => {
  loadReviews();
  setupFilter();
});

async function loadReviews() {
  const tbody = document.getElementById('reviewsTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>`;

  const status = document.getElementById('filterReviewStatus')?.value || '';
  const params = status ? `?status=${encodeURIComponent(status)}` : '';

  try {
    const res = await adminApi(`/api/reviews/admin/all${params}`);
    const data = await res.json();

    if (data.success && data.reviews) {
      allReviews = data.reviews;
      renderTable(allReviews);
    }
  } catch (err) {
    console.error('[AdminReviews] Error:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load reviews.</td></tr>`;
  }
}

function renderTable(reviews) {
  const tbody = document.getElementById('reviewsTableBody');
  if (!tbody) return;

  if (reviews.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No customer reviews found.</td></tr>`;
    return;
  }

  tbody.innerHTML = reviews.map((rev) => {
    const stars = Array(rev.rating).fill('<i class="fa-solid fa-star"></i>').join('');
    const statusBadge = rev.status === 'approved' ? 'bg-success' : (rev.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger');

    return `
      <tr>
        <td>
          <div class="fw-bold">${rev.userName}</div>
          <div class="text-muted small">${rev.userLocation || 'Traveller'}</div>
        </td>
        <td>
          <span class="fw-semibold text-primary">${rev.packageTitle || 'Tour Package'}</span>
        </td>
        <td>
          <div class="star-rating-pill">${stars}</div>
          <span class="small fw-bold text-muted">${rev.rating} / 5</span>
        </td>
        <td>
          <p class="text-secondary-emphasis small mb-0 lh-base" style="max-width: 350px;">
            "${rev.reviewText}"
          </p>
        </td>
        <td><span class="badge ${statusBadge}">${rev.status}</span></td>
        <td>
          <div class="table-action-btns">
            ${rev.status !== 'approved' ? `
              <button type="button" class="btn btn-sm btn-success" onclick="updateReviewStatus('${rev._id}', 'approved')" title="Approve Review">
                <i class="fa-solid fa-check"></i>
              </button>
            ` : `
              <button type="button" class="btn btn-sm btn-outline-warning" onclick="updateReviewStatus('${rev._id}', 'rejected')" title="Reject / Unpublish">
                <i class="fa-solid fa-xmark"></i>
              </button>
            `}
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteReview('${rev._id}')" title="Delete Review">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.updateReviewStatus = async function (id, status) {
  try {
    const res = await adminApi(`/api/reviews/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (data.success) {
      showAdminToast(data.message, 'success');
      loadReviews();
    }
  } catch (err) {
    console.error('[UpdateReviewStatus] Error:', err);
    showAdminToast('Failed to update review status.', 'error');
  }
};

window.deleteReview = async function (id) {
  if (!confirm('Are you sure you want to permanently delete this customer review?')) return;

  try {
    const res = await adminApi(`/api/reviews/admin/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showAdminToast('Review deleted successfully.', 'success');
      loadReviews();
    }
  } catch (err) {
    console.error('[DeleteReview] Error:', err);
    showAdminToast('Failed to delete review.', 'error');
  }
};

function setupFilter() {
  document.getElementById('filterReviewStatus')?.addEventListener('change', loadReviews);
}
