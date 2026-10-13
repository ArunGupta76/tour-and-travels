/**
 * ADMIN SPECIAL OFFERS JAVASCRIPT (admin-offers.js)
 */

let allOffers = [];
let allPackagesList = [];
let editingOfferId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadOffers();
  loadPackagesForSelect();
  setupOfferFormSubmit();
});

async function loadPackagesForSelect() {
  try {
    const res = await adminApi('/api/packages/admin/all');
    const data = await res.json();
    if (data.success && data.packages) {
      allPackagesList = data.packages;
      const select = document.getElementById('offerPackagesSelect');
      if (select) {
        select.innerHTML = data.packages.map(p => `
          <option value="${p._id}">${p.title} (${formatCurrency(p.discountedPrice)})</option>
        `).join('');
      }
    }
  } catch (err) {
    console.error('[Offers] Error loading packages list:', err);
  }
}

async function loadOffers() {
  const tbody = document.getElementById('offersTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>`;

  try {
    const res = await adminApi('/api/offers/admin/all');
    const data = await res.json();

    if (data.success && data.offers) {
      allOffers = data.offers;
      renderTable(allOffers);
    }
  } catch (err) {
    console.error('[Offers] Error loading offers:', err);
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Failed to load offers.</td></tr>`;
  }
}

function renderTable(offers) {
  const tbody = document.getElementById('offersTableBody');
  if (!tbody) return;

  if (offers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No promotional offers created yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = offers.map((offer) => {
    const banner = offer.bannerImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400';
    const discountText = offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `${formatCurrency(offer.discountValue)} FLAT`;
    const startDate = new Date(offer.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const endDate = new Date(offer.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const isAct = offer.isActive ? 'checked' : '';

    return `
      <tr>
        <td>
          <img src="${banner}" alt="${offer.title}" class="offer-table-banner" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400'">
        </td>
        <td>
          <h6 class="fw-bold mb-0 text-primary">${offer.title}</h6>
          <span class="text-muted small">${offer.description.substring(0, 60)}...</span>
        </td>
        <td>
          ${offer.couponCode ? `<span class="coupon-code-badge">${offer.couponCode}</span>` : '<span class="text-muted small">No code</span>'}
        </td>
        <td>
          <span class="badge bg-danger">${discountLabel(offer)}</span>
        </td>
        <td>
          <span class="text-muted small">${startDate} to ${endDate}</span>
        </td>
        <td>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" ${isAct} onchange="toggleOfferStatus('${offer._id}')">
          </div>
        </td>
        <td>
          <div class="table-action-btns">
            <button type="button" class="btn btn-sm btn-outline-primary" onclick="openEditOfferModal('${offer._id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteOffer('${offer._id}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function discountLabel(o) {
  return o.discountType === 'percentage' ? `${o.discountValue}%` : `${formatCurrency(o.discountValue)}`;
}

// Toggle Active Status
window.toggleOfferStatus = async function (id) {
  try {
    const res = await adminApi(`/api/offers/admin/${id}/toggle-status`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      showAdminToast(data.message, 'success');
    }
  } catch (err) {
    console.error('[ToggleOffer] Error:', err);
    showAdminToast('Failed to update offer status.', 'error');
  }
};

// Open Create Modal
window.openCreateOfferModal = function () {
  editingOfferId = null;
  document.getElementById('offerModalTitle').textContent = 'Create Special Offer';
  document.getElementById('offerForm').reset();
  document.getElementById('offerStartDate').value = new Date().toISOString().split('T')[0];

  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 30);
  document.getElementById('offerEndDate').value = defaultEnd.toISOString().split('T')[0];

  new bootstrap.Modal(document.getElementById('offerModal')).show();
};

// Open Edit Modal
window.openEditOfferModal = function (id) {
  const offer = allOffers.find(o => o._id === id);
  if (!offer) return;

  editingOfferId = id;
  document.getElementById('offerModalTitle').textContent = 'Edit Special Offer';
  document.getElementById('offerTitle').value = offer.title || '';
  document.getElementById('offerDescription').value = offer.description || '';
  document.getElementById('offerBannerImage').value = offer.bannerImage || '';
  document.getElementById('offerCouponCode').value = offer.couponCode || '';
  document.getElementById('offerDiscountType').value = offer.discountType || 'percentage';
  document.getElementById('offerDiscountValue').value = offer.discountValue || 0;
  document.getElementById('offerStartDate').value = new Date(offer.startDate).toISOString().split('T')[0];
  document.getElementById('offerEndDate').value = new Date(offer.endDate).toISOString().split('T')[0];
  document.getElementById('offerIsActive').checked = Boolean(offer.isActive);
  document.getElementById('offerIsFeatured').checked = Boolean(offer.isFeatured);

  // Selected packages
  const select = document.getElementById('offerPackagesSelect');
  if (select && offer.applicablePackages) {
    const pkgIds = offer.applicablePackages.map(p => typeof p === 'object' ? p._id : p);
    Array.from(select.options).forEach(opt => {
      opt.selected = pkgIds.includes(opt.value);
    });
  }

  new bootstrap.Modal(document.getElementById('offerModal')).show();
};

// Save Offer
function setupOfferFormSubmit() {
  const form = document.getElementById('offerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedOptions = Array.from(document.getElementById('offerPackagesSelect').selectedOptions).map(opt => opt.value);

    const payload = {
      title: document.getElementById('offerTitle').value.trim(),
      description: document.getElementById('offerDescription').value.trim(),
      bannerImage: document.getElementById('offerBannerImage').value.trim(),
      couponCode: document.getElementById('offerCouponCode').value.trim().toUpperCase(),
      discountType: document.getElementById('offerDiscountType').value,
      discountValue: Number(document.getElementById('offerDiscountValue').value),
      startDate: document.getElementById('offerStartDate').value,
      endDate: document.getElementById('offerEndDate').value,
      isActive: document.getElementById('offerIsActive').checked,
      isFeatured: document.getElementById('offerIsFeatured').checked,
      applicablePackages: selectedOptions,
    };

    try {
      const url = editingOfferId ? `/api/offers/admin/${editingOfferId}` : '/api/offers/admin';
      const method = editingOfferId ? 'PUT' : 'POST';

      const res = await adminApi(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        bootstrap.Modal.getInstance(document.getElementById('offerModal')).hide();
        showAdminToast(data.message || 'Offer saved successfully!', 'success');
        loadOffers();
      } else {
        showAdminToast(data.message || 'Failed to save offer.', 'error');
      }
    } catch (err) {
      console.error('[SaveOffer] Error:', err);
      showAdminToast('Server error while saving offer.', 'error');
    }
  });
}

// Delete Offer
window.deleteOffer = async function (id) {
  if (!confirm('Are you sure you want to delete this promotional offer?')) return;

  try {
    const res = await adminApi(`/api/offers/admin/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showAdminToast('Offer deleted successfully.', 'success');
      loadOffers();
    }
  } catch (err) {
    console.error('[DeleteOffer] Error:', err);
    showAdminToast('Failed to delete offer.', 'error');
  }
};
