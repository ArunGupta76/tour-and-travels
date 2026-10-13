/**
 * HOME PAGE JAVASCRIPT (home.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  loadHeroAndContent();
  loadFeaturedPackages();
  loadActiveOffers();
  loadTestimonials();
  setupQuickSearch();
  setupNewsletter();
});

// Load Hero Banner and Site Content from SiteSettings API
async function loadHeroAndContent() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      const s = data.settings;

      // Hero Elements
      const heroSection = document.getElementById('heroSection');
      if (heroSection && s.heroBannerUrl) {
        heroSection.style.backgroundImage = `url('${s.heroBannerUrl}')`;
      }

      const headlineEl = document.getElementById('heroHeadline');
      if (headlineEl && s.heroHeadline) {
        headlineEl.textContent = s.heroHeadline;
      }

      const subtitleEl = document.getElementById('heroSubtitle');
      if (subtitleEl && s.heroSubtitle) {
        subtitleEl.textContent = s.heroSubtitle;
      }

      const ctaBtn = document.getElementById('heroCtaBtn');
      if (ctaBtn && s.heroCtaText) {
        ctaBtn.innerHTML = `${s.heroCtaText} <i class="fa-solid fa-arrow-right ms-2"></i>`;
      }

      // Render FAQs if available
      if (s.faqs && s.faqs.length > 0) {
        renderFaqs(s.faqs);
      }

      // Render Why Choose Us if available
      if (s.whyChooseUs && s.whyChooseUs.length > 0) {
        renderWhyChooseUs(s.whyChooseUs);
      }
    }
  } catch (err) {
    console.error('[Home] Failed to load hero content:', err);
  }
}

// Render Featured Tour Packages
async function loadFeaturedPackages() {
  const container = document.getElementById('featuredPackagesContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/packages/featured');
    const data = await res.json();

    if (data.success && data.packages && data.packages.length > 0) {
      container.innerHTML = data.packages.map((pkg) => renderPackageCard(pkg)).join('');
    } else {
      // Fallback: fetch recent published packages
      const fallbackRes = await fetch('/api/packages?limit=6');
      const fallbackData = await fallbackRes.json();
      if (fallbackData.success && fallbackData.packages.length > 0) {
        container.innerHTML = fallbackData.packages.map((pkg) => renderPackageCard(pkg)).join('');
      } else {
        container.innerHTML = `
          <div class="col-12 text-center py-5">
            <p class="text-muted">No tour packages available currently. Check back soon!</p>
          </div>
        `;
      }
    }
  } catch (err) {
    console.error('[Home] Error fetching featured packages:', err);
    container.innerHTML = `
      <div class="col-12 text-center py-4 text-danger">
        <i class="fa-solid fa-triangle-exclamation mb-2 fa-2x"></i>
        <p>Failed to load tour packages. Please refresh the page.</p>
      </div>
    `;
  }
}

// Reusable Package Card HTML Generator
function renderPackageCard(pkg) {
  const discountBadge = pkg.discountPercentage > 0 
    ? `<span class="card-badge-discount">${pkg.discountPercentage}% OFF</span>` 
    : '';

  const originalPriceHtml = pkg.discountPercentage > 0 && pkg.originalPrice > pkg.discountedPrice
    ? `<span class="price-original">${formatPrice(pkg.originalPrice)}</span>`
    : '';

  return `
    <div class="col-lg-4 col-md-6 mb-4">
      <div class="travel-card">
        <div class="card-img-wrapper">
          <img src="${pkg.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'}" alt="${pkg.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb'">
          <span class="card-badge-category">${pkg.category || 'Domestic'}</span>
          ${discountBadge}
        </div>
        <div class="card-body-content">
          <div class="card-destination">
            <i class="fa-solid fa-location-dot"></i> ${pkg.destination}
          </div>
          <h3 class="card-tour-title">
            <a href="package-details.html?id=${pkg._id}">${pkg.title}</a>
          </h3>
          <div class="card-meta-chips">
            <span class="meta-chip"><i class="fa-regular fa-clock"></i> ${pkg.duration?.days || 1}D / ${pkg.duration?.nights || 0}N</span>
            <span class="meta-chip"><i class="fa-solid fa-location-crosshairs"></i> From ${pkg.startingLocation || 'Departure'}</span>
            <span class="meta-chip"><i class="fa-solid fa-user-check"></i> ${pkg.availabilityStatus || 'Available'}</span>
          </div>
          <p class="text-muted small mb-3" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${pkg.description}
          </p>
          <div class="card-pricing-footer">
            <div class="price-box">
              <span class="price-from">Starting per person</span>
              <span class="price-current">${formatPrice(pkg.discountedPrice)}</span>
              ${originalPriceHtml}
            </div>
            <a href="package-details.html?id=${pkg._id}" class="btn-primary-custom py-2 px-3">
              Details <i class="fa-solid fa-chevron-right ms-1"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Load Special Offers
async function loadActiveOffers() {
  const container = document.getElementById('offersPreviewContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/offers');
    const data = await res.json();

    if (data.success && data.offers && data.offers.length > 0) {
      container.innerHTML = data.offers.slice(0, 3).map((offer) => {
        const discountText = offer.discountType === 'percentage' 
          ? `${offer.discountValue}% DISCOUNT` 
          : `${formatPrice(offer.discountValue)} OFF`;

        const codeBlock = offer.couponCode 
          ? `<div class="offer-code-pill"><i class="fa-solid fa-ticket text-warning"></i> Code: <strong>${offer.couponCode}</strong></div>`
          : '';

        const validUntil = offer.endDate 
          ? new Date(offer.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'Limited Period';

        return `
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="offer-card">
              <span class="offer-badge">${discountText}</span>
              <h4 class="text-white mb-2">${offer.title}</h4>
              <p class="text-white-50 small mb-3 flex-grow-1">${offer.description}</p>
              ${codeBlock}
              <div class="mt-3 pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
                <span class="text-white-50 small"><i class="fa-regular fa-calendar-check me-1"></i> Ends: ${validUntil}</span>
                <a href="offers.html" class="btn btn-sm btn-outline-light rounded-pill px-3">View Offer</a>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      document.getElementById('specialOffersSection')?.classList.add('d-none');
    }
  } catch (err) {
    console.error('[Home] Failed to load offers:', err);
  }
}

// Load Testimonials from Approved Reviews
async function loadTestimonials() {
  const container = document.getElementById('testimonialsContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/reviews?limit=3');
    const data = await res.json();

    if (data.success && data.reviews && data.reviews.length > 0) {
      container.innerHTML = data.reviews.map((rev) => {
        const stars = Array(rev.rating).fill('<i class="fa-solid fa-star"></i>').join('');
        return `
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="testimonial-card">
              <div class="star-rating">${stars}</div>
              <p class="testimonial-text">"${rev.reviewText}"</p>
              <div class="testimonial-author">
                <div class="author-avatar">${rev.userName.charAt(0).toUpperCase()}</div>
                <div>
                  <h6 class="mb-0 fw-bold">${rev.userName}</h6>
                  <span class="text-muted small">${rev.userLocation || 'Verified Traveller'} • <span class="text-secondary">${rev.packageTitle || 'Tour Trip'}</span></span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('[Home] Failed to load testimonials:', err);
  }
}

// Render FAQs from SiteSettings
function renderFaqs(faqs) {
  const container = document.getElementById('faqAccordion');
  if (!container) return;

  container.innerHTML = faqs.map((faq, idx) => `
    <div class="accordion-item">
      <h2 class="accordion-header" id="faqHeading${idx}">
        <button class="accordion-button ${idx !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#faqCollapse${idx}" aria-expanded="${idx === 0}" aria-controls="faqCollapse${idx}">
          ${faq.question}
        </button>
      </h2>
      <div id="faqCollapse${idx}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}" aria-labelledby="faqHeading${idx}" data-bs-parent="#faqAccordion">
        <div class="accordion-body">
          ${faq.answer}
        </div>
      </div>
    </div>
  `).join('');
}

// Render Why Choose Us Features
function renderWhyChooseUs(features) {
  const container = document.getElementById('whyChooseUsContainer');
  if (!container) return;

  container.innerHTML = features.map((f) => `
    <div class="col-lg-3 col-md-6 mb-4">
      <div class="feature-box">
        <div class="feature-icon-wrapper">
          <i class="fa-solid ${f.icon || 'fa-gem'}"></i>
        </div>
        <h5 class="fw-bold mb-2">${f.title}</h5>
        <p class="text-muted small mb-0">${f.description}</p>
      </div>
    </div>
  `).join('');
}

// Quick Search Form Handler
function setupQuickSearch() {
  const form = document.getElementById('quickSearchForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const destination = document.getElementById('searchDestination')?.value.trim();
    const duration = document.getElementById('searchDuration')?.value;
    const budget = document.getElementById('searchBudget')?.value;

    const params = new URLSearchParams();
    if (destination) params.append('search', destination);
    if (duration) params.append('duration', duration);
    if (budget) params.append('maxPrice', budget);

    window.location.href = `packages.html?${params.toString()}`;
  });
}

// Newsletter Subscription Handler
function setupNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail')?.value.trim();
    if (email) {
      showToast('Thank you for subscribing! Exclusive travel deals will arrive in your inbox.', 'success');
      form.reset();
    }
  });
}
