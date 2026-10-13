/**
 * TOUR PACKAGES LISTING JAVASCRIPT (packages.js)
 */

let currentFilters = {
  search: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  duration: '',
  sort: 'price-asc',
  page: 1,
};

document.addEventListener('DOMContentLoaded', () => {
  initFiltersFromUrl();
  setupFilterEventListeners();
  fetchPackages();
});

// Read URL Query Parameters on Page Load
function initFiltersFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('search')) {
    currentFilters.search = urlParams.get('search');
    const searchInput = document.getElementById('filterSearch');
    if (searchInput) searchInput.value = currentFilters.search;
  }

  if (urlParams.get('category')) {
    currentFilters.category = urlParams.get('category');
    const catRadio = document.querySelector(`input[name="categoryFilter"][value="${currentFilters.category}"]`);
    if (catRadio) catRadio.checked = true;
  }

  if (urlParams.get('duration')) {
    currentFilters.duration = urlParams.get('duration');
    const durationSelect = document.getElementById('filterDuration');
    if (durationSelect) durationSelect.value = currentFilters.duration;
  }

  if (urlParams.get('maxPrice')) {
    currentFilters.maxPrice = urlParams.get('maxPrice');
    const maxPriceInput = document.getElementById('filterMaxPrice');
    if (maxPriceInput) maxPriceInput.value = currentFilters.maxPrice;
  }

  if (urlParams.get('sort')) {
    currentFilters.sort = urlParams.get('sort');
    const sortSelect = document.getElementById('sortBySelect');
    if (sortSelect) sortSelect.value = currentFilters.sort;
  }
}

// Setup Event Listeners on Search and Filter Controls
function setupFilterEventListeners() {
  // Search Input with Debounce
  let debounceTimeout = null;
  document.getElementById('filterSearch')?.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      currentFilters.search = e.target.value.trim();
      currentFilters.page = 1;
      fetchPackages();
    }, 350);
  });

  // Category Radios
  document.querySelectorAll('input[name="categoryFilter"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      currentFilters.category = e.target.value;
      currentFilters.page = 1;
      fetchPackages();
    });
  });

  // Duration Filter
  document.getElementById('filterDuration')?.addEventListener('change', (e) => {
    currentFilters.duration = e.target.value;
    currentFilters.page = 1;
    fetchPackages();
  });

  // Price Range Inputs
  const applyPriceBtn = document.getElementById('applyPriceFilterBtn');
  applyPriceBtn?.addEventListener('click', () => {
    const minVal = document.getElementById('filterMinPrice')?.value;
    const maxVal = document.getElementById('filterMaxPrice')?.value;
    currentFilters.minPrice = minVal ? Number(minVal) : '';
    currentFilters.maxPrice = maxVal ? Number(maxVal) : '';
    currentFilters.page = 1;
    fetchPackages();
  });

  // Sort By Select
  document.getElementById('sortBySelect')?.addEventListener('change', (e) => {
    currentFilters.sort = e.target.value;
    fetchPackages();
  });

  // Clear Filters Button
  document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
    currentFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      duration: '',
      sort: 'price-asc',
      page: 1,
    };

    if (document.getElementById('filterSearch')) document.getElementById('filterSearch').value = '';
    if (document.getElementById('filterDuration')) document.getElementById('filterDuration').value = '';
    if (document.getElementById('filterMinPrice')) document.getElementById('filterMinPrice').value = '';
    if (document.getElementById('filterMaxPrice')) document.getElementById('filterMaxPrice').value = '';
    const allRadio = document.querySelector('input[name="categoryFilter"][value=""]');
    if (allRadio) allRadio.checked = true;
    if (document.getElementById('sortBySelect')) document.getElementById('sortBySelect').value = 'price-asc';

    window.history.replaceState({}, '', window.location.pathname);
    fetchPackages();
  });
}

// Fetch Packages from REST API
async function fetchPackages() {
  const container = document.getElementById('packagesListContainer');
  const countLabel = document.getElementById('resultsCountText');
  if (!container) return;

  container.innerHTML = `
    <div class="col-12 spinner-container">
      <div class="spinner-glow"></div>
      <p class="text-muted">Loading tour packages...</p>
    </div>
  `;

  // Build Query String
  const queryParams = new URLSearchParams();
  if (currentFilters.search) queryParams.append('search', currentFilters.search);
  if (currentFilters.category) queryParams.append('category', currentFilters.category);
  if (currentFilters.minPrice) queryParams.append('minPrice', currentFilters.minPrice);
  if (currentFilters.maxPrice) queryParams.append('maxPrice', currentFilters.maxPrice);
  if (currentFilters.duration) queryParams.append('duration', currentFilters.duration);
  if (currentFilters.sort) queryParams.append('sort', currentFilters.sort);
  queryParams.append('page', currentFilters.page);
  queryParams.append('limit', 12);

  // Sync URL history
  window.history.replaceState({}, '', `${window.location.pathname}?${queryParams.toString()}`);

  try {
    const res = await fetch(`/api/packages?${queryParams.toString()}`);
    const data = await res.json();

    if (data.success && data.packages && data.packages.length > 0) {
      if (countLabel) {
        countLabel.innerHTML = `Showing <strong>${data.packages.length}</strong> of <strong>${data.total}</strong> tour packages`;
      }
      container.innerHTML = data.packages.map((pkg) => renderDetailedPackageCard(pkg)).join('');
      renderPagination(data.totalPages, data.currentPage);
    } else {
      if (countLabel) countLabel.innerHTML = `Showing <strong>0</strong> tour packages`;
      container.innerHTML = `
        <div class="col-12 empty-state-box">
          <i class="fa-solid fa-map-location-dot empty-state-icon"></i>
          <h4>No Packages Found</h4>
          <p class="text-muted">We couldn't find any packages matching your selected filters. Try broadening your criteria.</p>
          <button id="resetFromEmptyBtn" class="btn-primary-custom mt-2">Reset All Filters</button>
        </div>
      `;
      document.getElementById('resetFromEmptyBtn')?.addEventListener('click', () => {
        document.getElementById('clearFiltersBtn')?.click();
      });
      document.getElementById('paginationContainer').innerHTML = '';
    }
  } catch (err) {
    console.error('[Packages] Failed to load packages:', err);
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-danger">
        <i class="fa-solid fa-triangle-exclamation fa-2x mb-2"></i>
        <p>Failed to load tour packages. Please check your connection and try again.</p>
      </div>
    `;
  }
}

// Render Package Card with Full Details & Actions
function renderDetailedPackageCard(pkg) {
  const discountBadge = pkg.discountPercentage > 0 
    ? `<span class="card-badge-discount">${pkg.discountPercentage}% OFF</span>` 
    : '';

  const originalPriceHtml = pkg.discountPercentage > 0 && pkg.originalPrice > pkg.discountedPrice
    ? `<span class="price-original">${formatPrice(pkg.originalPrice)}</span>`
    : '';

  const statusBadgeClass = pkg.availabilityStatus === 'Sold Out' ? 'bg-danger' : (pkg.availabilityStatus === 'Limited' ? 'bg-warning text-dark' : 'bg-success');

  return `
    <div class="col-xl-4 col-md-6 mb-4">
      <div class="travel-card">
        <div class="card-img-wrapper">
          <img src="${pkg.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'}" alt="${pkg.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb'">
          <span class="card-badge-category">${pkg.category || 'Domestic'}</span>
          ${discountBadge}
        </div>
        <div class="card-body-content">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="card-destination"><i class="fa-solid fa-location-dot"></i> ${pkg.destination}</span>
            <span class="badge ${statusBadgeClass} small">${pkg.availabilityStatus || 'Available'}</span>
          </div>

          <h3 class="card-tour-title">
            <a href="package-details.html?id=${pkg._id}">${pkg.title}</a>
          </h3>

          <div class="card-meta-chips">
            <span class="meta-chip"><i class="fa-regular fa-clock"></i> ${pkg.duration?.days || 1}D / ${pkg.duration?.nights || 0}N</span>
            <span class="meta-chip"><i class="fa-solid fa-plane-departure"></i> Starts: ${pkg.startingLocation || 'Main Hub'}</span>
          </div>

          <p class="text-muted small mb-3" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${pkg.description}
          </p>

          <div class="card-pricing-footer">
            <div class="price-box">
              <span class="price-from">Starting price</span>
              <span class="price-current">${formatPrice(pkg.discountedPrice)}</span>
              ${originalPriceHtml}
            </div>
            <div class="d-flex gap-2">
              <a href="package-details.html?id=${pkg._id}" class="btn-outline-custom py-2 px-3 small" title="View details">
                Details
              </a>
              <a href="package-details.html?id=${pkg._id}&action=book" class="btn-primary-custom py-2 px-3 small">
                Book Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render Pagination
function renderPagination(totalPages, currentPage) {
  const container = document.getElementById('paginationContainer');
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = `<ul class="pagination justify-content-center">`;

  // Previous
  html += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <button class="page-link" onclick="changePage(${currentPage - 1})"><i class="fa-solid fa-chevron-left"></i></button>
    </li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <button class="page-link" onclick="changePage(${i})">${i}</button>
      </li>
    `;
  }

  // Next
  html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <button class="page-link" onclick="changePage(${currentPage + 1})"><i class="fa-solid fa-chevron-right"></i></button>
    </li>
  `;

  html += `</ul>`;
  container.innerHTML = html;
}

// Global page changer
window.changePage = function (newPage) {
  currentFilters.page = newPage;
  fetchPackages();
  window.scrollTo({ top: 300, behavior: 'smooth' });
};
