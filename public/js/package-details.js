/**
 * TOUR PACKAGE DETAILS & BOOKING WORKFLOW (package-details.js)
 */

let currentPackage = null;
let currentTravellerCount = 1;
let currentCalculation = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const packageId = urlParams.get('id') || urlParams.get('slug');

  if (!packageId) {
    showErrorAndRedirect('No package identifier specified.');
    return;
  }

  fetchPackageDetails(packageId);
  setupBookingFormListeners();
});

// Fetch Package Data
async function fetchPackageDetails(identifier) {
  try {
    const res = await fetch(`/api/packages/${identifier}`);
    const data = await res.json();

    if (!data.success || !data.package) {
      showErrorAndRedirect('Tour package not found or deactivated.');
      return;
    }

    currentPackage = data.package;
    renderPackageView(currentPackage);

    // If URL has action=book, automatically open booking modal
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'book') {
      setTimeout(openBookingModal, 400);
    }
  } catch (err) {
    console.error('[PackageDetails] Error loading details:', err);
    showErrorAndRedirect('Failed to load package details. Please try again.');
  }
}

// Render Complete Package Details
function renderPackageView(pkg) {
  // Title & Destination
  document.title = `${pkg.title} - Wanderlust Tours`;
  document.getElementById('packageTitle').textContent = pkg.title;
  document.getElementById('packageDestination').innerHTML = `<i class="fa-solid fa-location-dot text-secondary"></i> ${pkg.destination}`;
  document.getElementById('packageCategory').textContent = pkg.category;
  document.getElementById('packageDurationBadge').innerHTML = `<i class="fa-regular fa-clock me-1"></i> ${pkg.duration?.days} Days / ${pkg.duration?.nights} Nights`;
  document.getElementById('packageStartingLoc').innerHTML = `<i class="fa-solid fa-plane-departure me-1"></i> Starting from: ${pkg.startingLocation}`;
  document.getElementById('packageAvailability').innerHTML = `<i class="fa-solid fa-circle-check me-1"></i> ${pkg.availabilityStatus || 'Available'}`;

  // Description
  document.getElementById('packageDescription').textContent = pkg.description;

  // Image Gallery
  const mainImg = document.getElementById('galleryMainImg');
  const thumbsContainer = document.getElementById('galleryThumbsRow');
  const allImages = [pkg.coverImage, ...(pkg.images || [])].filter(Boolean);

  if (allImages.length > 0) {
    mainImg.src = allImages[0];
    thumbsContainer.innerHTML = allImages.map((imgUrl, index) => `
      <img src="${imgUrl}" alt="Thumbnail ${index + 1}" class="thumb-img ${index === 0 ? 'active' : ''}" onclick="switchGalleryImg('${imgUrl}', this)">
    `).join('');
  }

  // Pricing Sticky Card
  document.getElementById('stickyCurrentPrice').textContent = formatPrice(pkg.discountedPrice);
  if (pkg.discountPercentage > 0 && pkg.originalPrice > pkg.discountedPrice) {
    document.getElementById('stickyOriginalPrice').textContent = formatPrice(pkg.originalPrice);
    document.getElementById('stickyDiscountBadge').textContent = `${pkg.discountPercentage}% OFF`;
    document.getElementById('stickyDiscountBadge').classList.remove('d-none');
  } else {
    document.getElementById('stickyOriginalPrice').classList.add('d-none');
    document.getElementById('stickyDiscountBadge').classList.add('d-none');
  }

  // Day-by-Day Itinerary
  const itineraryContainer = document.getElementById('itineraryTimeline');
  if (pkg.itinerary && pkg.itinerary.length > 0) {
    itineraryContainer.innerHTML = pkg.itinerary.map((day) => `
      <div class="itinerary-day-item">
        <div class="itinerary-day-circle">${day.day}</div>
        <h5 class="itinerary-day-title">Day ${day.day}: ${day.title}</h5>
        <p class="itinerary-day-desc">${day.description}</p>
        <div class="itinerary-meta-tags">
          <span class="meta-tag-pill"><i class="fa-solid fa-utensils text-secondary"></i> ${day.meals || 'Breakfast'}</span>
          <span class="meta-tag-pill"><i class="fa-solid fa-hotel text-secondary"></i> ${day.accommodation || 'Certified Hotel'}</span>
        </div>
      </div>
    `).join('');
  } else {
    itineraryContainer.innerHTML = `<p class="text-muted">Itinerary will be shared upon customized booking.</p>`;
  }

  // Inclusions
  const inclusionsContainer = document.getElementById('inclusionsList');
  if (pkg.inclusions && pkg.inclusions.length > 0) {
    inclusionsContainer.innerHTML = pkg.inclusions.map((item) => `
      <div class="check-item text-dark">
        <i class="fa-solid fa-circle-check text-success"></i>
        <span>${item}</span>
      </div>
    `).join('');
  }

  // Exclusions
  const exclusionsContainer = document.getElementById('exclusionsList');
  if (pkg.exclusions && pkg.exclusions.length > 0) {
    exclusionsContainer.innerHTML = pkg.exclusions.map((item) => `
      <div class="check-item text-muted">
        <i class="fa-solid fa-circle-xmark text-danger"></i>
        <span>${item}</span>
      </div>
    `).join('');
  }

  // Hotel & Accommodation Details
  document.getElementById('accommodationInfo').textContent = pkg.accommodationDetails || 'Handpicked premium certified 4-Star / 5-Star accommodations with daily housekeeping.';
  document.getElementById('transportInfo').textContent = pkg.transportDetails || 'Dedicated chauffeur driven AC vehicle for all airport transfers and sightseeing excursions.';
  document.getElementById('cancellationInfo').textContent = pkg.cancellationPolicy || 'Free cancellation up to 7 days before departure date with full refund.';
  document.getElementById('instructionsInfo').textContent = pkg.importantInstructions || 'Carry valid government approved photo ID proofs. Confirm luggage allowances with airline.';
}

// Switch Image in Gallery
window.switchGalleryImg = function (imgUrl, el) {
  const mainImg = document.getElementById('galleryMainImg');
  mainImg.style.opacity = '0.5';
  setTimeout(() => {
    mainImg.src = imgUrl;
    mainImg.style.opacity = '1';
  }, 150);

  document.querySelectorAll('.thumb-img').forEach((t) => t.classList.remove('active'));
  el.classList.add('active');
};

// Open Booking Modal & Pre-Fill Form
window.openBookingModal = function () {
  const token = localStorage.getItem('token');
  if (!token) {
    // If not logged in, prompt user to login
    showToast('Please log in to submit a booking request.', 'warning');
    setTimeout(() => {
      window.location.href = `login.html?returnUrl=${encodeURIComponent(window.location.href)}`;
    }, 1200);
    return;
  }

  const modalEl = document.getElementById('bookingModal');
  const modal = new bootstrap.Modal(modalEl);

  // Populate Dates Dropdown
  const dateSelect = document.getElementById('bookingTravelDate');
  dateSelect.innerHTML = '<option value="">Select departure date</option>';

  if (currentPackage.availableDates && currentPackage.availableDates.length > 0) {
    currentPackage.availableDates.forEach((d) => {
      const dateObj = new Date(d);
      const formatted = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      dateSelect.innerHTML += `<option value="${dateObj.toISOString().split('T')[0]}">${formatted}</option>`;
    });
  } else {
    // Default dates for the next 4 weekends
    for (let i = 1; i <= 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i * 7);
      const val = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      dateSelect.innerHTML += `<option value="${val}">${label}</option>`;
    }
  }

  // Pre-fill user contact info if stored
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  if (storedUser.name) document.getElementById('contactName').value = storedUser.name;
  if (storedUser.email) document.getElementById('contactEmail').value = storedUser.email;
  if (storedUser.phone) document.getElementById('contactPhone').value = storedUser.phone;

  // Generate Passenger Form Fields
  generatePassengerFields(1);
  recalculateBookingSummary();

  modal.show();
};

// Setup Listeners for Live Price Calculation in Modal
function setupBookingFormListeners() {
  document.getElementById('bookingTravellersCount')?.addEventListener('change', (e) => {
    const count = parseInt(e.target.value, 10) || 1;
    currentTravellerCount = count;
    generatePassengerFields(count);
    recalculateBookingSummary();
  });

  document.getElementById('applyCouponBtn')?.addEventListener('click', () => {
    recalculateBookingSummary();
  });

  document.getElementById('bookingSubmitForm')?.addEventListener('submit', handleBookingSubmit);
}

// Generate Dynamic Passenger Input Fields
function generatePassengerFields(count) {
  const container = document.getElementById('passengersListContainer');
  if (!container) return;

  let html = '';
  for (let i = 1; i <= count; i++) {
    html += `
      <div class="card mb-3 border-light bg-light">
        <div class="card-body p-3">
          <h6 class="fw-bold mb-2 text-primary"><i class="fa-solid fa-user me-1"></i> Passenger ${i} Details</h6>
          <div class="row g-2">
            <div class="col-md-6">
              <input type="text" class="form-control form-control-sm passenger-name" placeholder="Full Name" required value="${i === 1 ? (document.getElementById('contactName')?.value || '') : ''}">
            </div>
            <div class="col-md-3 col-6">
              <input type="number" class="form-control form-control-sm passenger-age" placeholder="Age" min="1" max="100" required value="${i === 1 ? '30' : '25'}">
            </div>
            <div class="col-md-3 col-6">
              <select class="form-select form-select-sm passenger-gender">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

// Recalculate Live Booking Summary on Backend
async function recalculateBookingSummary() {
  if (!currentPackage) return;

  const couponCode = document.getElementById('bookingCouponCode')?.value.trim();
  const summaryBox = document.getElementById('calcSummaryBox');

  try {
    const res = await fetch('/api/bookings/calculate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageId: currentPackage._id,
        travellerCount: currentTravellerCount,
        couponCode,
      }),
    });
    const data = await res.json();

    if (data.success && data.calculation) {
      currentCalculation = data.calculation;
      summaryBox.innerHTML = `
        <div class="calc-row">
          <span>Price per traveller:</span>
          <strong>${formatPrice(data.calculation.pricePerPerson)}</strong>
        </div>
        <div class="calc-row">
          <span>Number of travellers:</span>
          <span>${data.calculation.travellerCount}</span>
        </div>
        <div class="calc-row">
          <span>Subtotal:</span>
          <span>${formatPrice(data.calculation.subtotal)}</span>
        </div>
        ${data.calculation.couponDiscount > 0 ? `
          <div class="calc-row text-success">
            <span>Coupon Discount (${data.calculation.appliedCoupon}):</span>
            <span>-${formatPrice(data.calculation.couponDiscount)}</span>
          </div>
        ` : ''}
        <div class="calc-row total-row">
          <span>Total Payable:</span>
          <span class="text-primary">${formatPrice(data.calculation.totalAmount)}</span>
        </div>
      `;
    }
  } catch (err) {
    console.error('[BookingSummary] Failed to calculate:', err);
  }
}

// Handle Booking Form Submission
async function handleBookingSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('submitBookingBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Submitting Booking...';

  const travelDate = document.getElementById('bookingTravelDate').value;
  const travellerCount = parseInt(document.getElementById('bookingTravellersCount').value, 10);
  const couponCode = document.getElementById('bookingCouponCode')?.value.trim();

  // Contact Details
  const contactDetails = {
    name: document.getElementById('contactName').value.trim(),
    email: document.getElementById('contactEmail').value.trim(),
    phone: document.getElementById('contactPhone').value.trim(),
    city: document.getElementById('contactCity')?.value.trim() || '',
    specialRequests: document.getElementById('contactRequests')?.value.trim() || '',
  };

  // Collect Passengers
  const passengers = [];
  const nameInputs = document.querySelectorAll('.passenger-name');
  const ageInputs = document.querySelectorAll('.passenger-age');
  const genderInputs = document.querySelectorAll('.passenger-gender');

  for (let i = 0; i < nameInputs.length; i++) {
    passengers.push({
      name: nameInputs[i].value.trim(),
      age: parseInt(ageInputs[i].value, 10) || 30,
      gender: genderInputs[i].value,
    });
  }

  const token = localStorage.getItem('token');

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        packageId: currentPackage._id,
        travelDate,
        travellerCount,
        travellers: passengers,
        contactDetails,
        couponCode,
      }),
    });

    const data = await res.json();

    if (data.success && data.booking) {
      // Hide booking modal
      bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();

      // Show Success Confirmation Modal
      document.getElementById('successBookingRef').textContent = data.booking.bookingRef;
      document.getElementById('successBookingTotal').textContent = formatPrice(data.booking.totalAmount);
      new bootstrap.Modal(document.getElementById('bookingSuccessModal')).show();
    } else {
      showToast(data.message || 'Booking submission failed. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-lock me-2"></i> Confirm Booking Request';
    }
  } catch (err) {
    console.error('[BookingSubmit] Network error:', err);
    showToast('A network error occurred while submitting your booking.', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-lock me-2"></i> Confirm Booking Request';
  }
}

function showErrorAndRedirect(msg) {
  showToast(msg, 'error');
  setTimeout(() => {
    window.location.href = 'packages.html';
  }, 2000);
}
