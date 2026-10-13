/**
 * SPECIAL OFFERS PAGE JAVASCRIPT (offers.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  fetchOffers();
});

async function fetchOffers() {
  const container = document.getElementById('offersListContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="col-12 spinner-container">
      <div class="spinner-glow"></div>
      <p class="text-muted">Loading active special offers...</p>
    </div>
  `;

  try {
    const res = await fetch('/api/offers');
    const data = await res.json();

    if (data.success && data.offers && data.offers.length > 0) {
      container.innerHTML = data.offers.map((offer) => renderOfferCard(offer)).join('');
    } else {
      container.innerHTML = `
        <div class="col-12 empty-state-box">
          <i class="fa-solid fa-gift empty-state-icon"></i>
          <h4>No Active Offers Right Now</h4>
          <p class="text-muted">Stay tuned! Exciting holiday deals and coupons are coming soon.</p>
          <a href="packages.html" class="btn-primary-custom mt-2">Browse All Packages</a>
        </div>
      `;
    }
  } catch (err) {
    console.error('[Offers] Failed to load offers:', err);
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-danger">
        <i class="fa-solid fa-triangle-exclamation fa-2x mb-2"></i>
        <p>Failed to load offers. Please refresh the page.</p>
      </div>
    `;
  }
}

function renderOfferCard(offer) {
  const discountLabel = offer.discountType === 'percentage' 
    ? `${offer.discountValue}% OFF` 
    : `${formatPrice(offer.discountValue)} FLAT OFF`;

  const startDateFormatted = new Date(offer.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const endDateFormatted = new Date(offer.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Applicable packages pills
  let packagesHtml = '';
  if (offer.applicablePackages && offer.applicablePackages.length > 0) {
    packagesHtml = `
      <div class="mb-3">
        <span class="text-muted small fw-bold d-block mb-1">Applicable on:</span>
        <div class="applicable-packages-pills">
          ${offer.applicablePackages.map(pkg => `
            <a href="package-details.html?id=${pkg._id}" class="package-pill-tag text-decoration-none">
              <i class="fa-solid fa-map-pin"></i> ${pkg.title}
            </a>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    packagesHtml = `
      <div class="mb-3">
        <span class="badge bg-light text-secondary border"><i class="fa-solid fa-globe me-1"></i> Applicable on All Packages</span>
      </div>
    `;
  }

  const couponCodeHtml = offer.couponCode ? `
    <div class="coupon-box">
      <div>
        <span class="text-muted small d-block">Coupon Code:</span>
        <span class="coupon-code-text">${offer.couponCode}</span>
      </div>
      <button type="button" class="btn-copy-code" onclick="copyCouponCode('${offer.couponCode}')">
        <i class="fa-regular fa-copy me-1"></i> Copy
      </button>
    </div>
  ` : '';

  const fallbackBanner = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop';

  return `
    <div class="col-lg-6 mb-4">
      <div class="offer-large-card h-100">
        <div class="row g-0 h-100">
          <div class="col-md-5">
            <div class="offer-img-box">
              <img src="${offer.bannerImage || fallbackBanner}" alt="${offer.title}" onerror="this.src='${fallbackBanner}'">
              <span class="offer-discount-chip">${discountLabel}</span>
            </div>
          </div>
          <div class="col-md-7">
            <div class="offer-details-body">
              <h3 class="offer-title">${offer.title}</h3>
              <p class="offer-description flex-grow-1">${offer.description}</p>
              
              ${packagesHtml}
              ${couponCodeHtml}

              <div class="pt-3 border-top d-flex justify-content-between align-items-center">
                <span class="text-muted small">
                  <i class="fa-regular fa-calendar-check text-secondary me-1"></i> Valid till ${endDateFormatted}
                </span>
                <a href="packages.html" class="btn-primary-custom py-2 px-3 small">
                  Explore Deals <i class="fa-solid fa-chevron-right ms-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Copy Coupon Code Utility
window.copyCouponCode = function (code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast(`Coupon code "${code}" copied to clipboard! Paste it during booking.`, 'success');
  }).catch(() => {
    showToast(`Code: ${code}`, 'info');
  });
};
