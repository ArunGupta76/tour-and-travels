/**
 * USER DASHBOARD & BOOKINGS JAVASCRIPT (my-bookings.js)
 */

let myBookingsList = [];
let selectedBooking = null;

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html?returnUrl=my-bookings.html';
    return;
  }

  fetchUserProfile();
  fetchMyBookings();
  setupCancellationForm();
});

// Fetch Current User
async function fetchUserProfile() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success && data.user) {
      document.getElementById('dashUserName').textContent = data.user.name;
      document.getElementById('dashUserEmail').textContent = data.user.email;
      document.getElementById('dashUserInitial').textContent = data.user.name.charAt(0).toUpperCase();
    }
  } catch (err) {
    console.error('[Dashboard] Error fetching profile:', err);
  }
}

// Fetch My Bookings from API
async function fetchMyBookings() {
  const token = localStorage.getItem('token');
  const container = document.getElementById('myBookingsContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="col-12 spinner-container">
      <div class="spinner-glow"></div>
      <p class="text-muted">Loading your bookings...</p>
    </div>
  `;

  try {
    const res = await fetch('/api/bookings/my-bookings', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.success && data.bookings && data.bookings.length > 0) {
      myBookingsList = data.bookings;
      container.innerHTML = data.bookings.map((b) => renderBookingCard(b)).join('');
      document.getElementById('totalBookingsCount').textContent = `${data.bookings.length} Bookings`;
    } else {
      document.getElementById('totalBookingsCount').textContent = '0 Bookings';
      container.innerHTML = `
        <div class="col-12 empty-state-box bg-white rounded-3 border p-5">
          <i class="fa-solid fa-suitcase-rolling empty-state-icon"></i>
          <h4>No Bookings Yet</h4>
          <p class="text-muted">You haven't booked any tour packages yet. Discover your next dream holiday today!</p>
          <a href="packages.html" class="btn-primary-custom mt-2">
            <i class="fa-solid fa-compass me-2"></i> Explore Tour Packages
          </a>
        </div>
      `;
    }
  } catch (err) {
    console.error('[Bookings] Error loading bookings:', err);
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-danger">
        <i class="fa-solid fa-triangle-exclamation fa-2x mb-2"></i>
        <p>Failed to load bookings. Please refresh the page.</p>
      </div>
    `;
  }
}

// Render Individual Booking Card
function renderBookingCard(b) {
  const statusClass = `badge-status-${b.bookingStatus.toLowerCase()}`;
  const paymentBadgeClass = b.paymentStatus === 'Paid' ? 'bg-success' : (b.paymentStatus === 'Partially Paid' ? 'bg-info text-dark' : (b.paymentStatus === 'Refunded' ? 'bg-secondary' : 'bg-warning text-dark'));

  const travelDateFormatted = new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const bookedDateFormatted = new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const coverImg = b.packageSnapshot?.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb';

  const cancellationButton = (b.bookingStatus !== 'Cancelled' && !b.cancellationRequested) ? `
    <button type="button" class="btn btn-outline-danger btn-sm" onclick="openCancelModal('${b._id}')">
      <i class="fa-solid fa-ban me-1"></i> Request Cancellation
    </button>
  ` : (b.cancellationRequested && b.bookingStatus !== 'Cancelled' ? `
    <span class="badge bg-danger bg-opacity-10 text-danger p-2 small"><i class="fa-solid fa-clock-rotate-left me-1"></i> Cancellation Requested</span>
  ` : '');

  return `
    <div class="booking-item-card">
      <div class="booking-card-header">
        <div class="d-flex align-items-center gap-3">
          <span class="fw-bold font-monospace text-primary fs-6">
            <i class="fa-solid fa-ticket text-secondary me-1"></i> ${b.bookingRef}
          </span>
          <span class="badge ${statusClass} px-3 py-2 rounded-pill fw-semibold">${b.bookingStatus}</span>
          <span class="badge ${paymentBadgeClass} px-2 py-1">${b.paymentStatus}</span>
        </div>
        <span class="text-muted small">
          Booked on: ${bookedDateFormatted}
        </span>
      </div>

      <div class="booking-card-body">
        <div class="row align-items-center g-3">
          <div class="col-md-auto d-none d-sm-block">
            <img src="${coverImg}" alt="${b.packageSnapshot?.title || 'Tour'}" class="booking-thumb-img">
          </div>
          <div class="col-md">
            <h5 class="fw-bold mb-1 text-primary">
              ${b.packageSnapshot?.title || 'Tour Package'}
            </h5>
            <div class="text-muted small mb-2">
              <i class="fa-solid fa-location-dot text-secondary me-1"></i> ${b.packageSnapshot?.destination || 'Destination'} • 
              <i class="fa-regular fa-calendar-check text-secondary ms-2 me-1"></i> Travel Date: <strong>${travelDateFormatted}</strong>
            </div>
            <div class="d-flex flex-wrap gap-3 small text-muted">
              <span><i class="fa-solid fa-users me-1"></i> ${b.travellerCount} Traveller(s)</span>
              <span><i class="fa-solid fa-clock me-1"></i> ${b.packageSnapshot?.duration?.days || 1}D / ${b.packageSnapshot?.duration?.nights || 0}N</span>
              <span><i class="fa-solid fa-user-tie me-1"></i> Contact: ${b.contactDetails?.name} (${b.contactDetails?.phone})</span>
            </div>
          </div>
          <div class="col-md-auto text-md-end pt-3 pt-md-0 border-top border-md-0">
            <div class="mb-2">
              <span class="text-muted small d-block">Total Booking Amount</span>
              <span class="fs-4 fw-bold text-primary">${formatPrice(b.totalAmount)}</span>
              ${b.amountPaid > 0 ? `<div class="small text-success">Paid: ${formatPrice(b.amountPaid)}</div>` : '<div class="small text-danger">Payment Due: Manual Confirmation</div>'}
            </div>
            <div class="d-flex flex-wrap gap-2 justify-content-md-end">
              <button type="button" class="btn btn-outline-primary btn-sm" onclick="openDetailsModal('${b._id}')">
                <i class="fa-solid fa-eye me-1"></i> Details
              </button>
              <button type="button" class="btn btn-primary-custom btn-sm py-1 px-3" onclick="openReceiptModal('${b._id}')">
                <i class="fa-solid fa-receipt me-1"></i> Receipt
              </button>
              ${cancellationButton}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Open Booking Details Modal
window.openDetailsModal = function (bookingId) {
  const b = myBookingsList.find((item) => item._id === bookingId);
  if (!b) return;

  const content = document.getElementById('detailsModalContent');
  const travelDateStr = new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  content.innerHTML = `
    <div class="mb-3 pb-3 border-bottom">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="fw-bold text-primary mb-0">${b.packageSnapshot?.title}</h5>
        <span class="badge bg-primary">${b.bookingStatus}</span>
      </div>
      <p class="text-muted small mb-0"><i class="fa-solid fa-location-dot text-secondary"></i> ${b.packageSnapshot?.destination} | Travel Date: ${travelDateStr}</p>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <h6 class="fw-bold small text-muted text-uppercase">Primary Contact</h6>
        <p class="mb-1 fw-bold">${b.contactDetails?.name}</p>
        <p class="small text-muted mb-0"><i class="fa-solid fa-envelope me-1"></i> ${b.contactDetails?.email}</p>
        <p class="small text-muted mb-0"><i class="fa-solid fa-phone me-1"></i> ${b.contactDetails?.phone}</p>
        ${b.contactDetails?.specialRequests ? `<p class="small text-muted mt-1 fst-italic">Special Request: ${b.contactDetails.specialRequests}</p>` : ''}
      </div>
      <div class="col-md-6">
        <h6 class="fw-bold small text-muted text-uppercase">Payment Overview</h6>
        <p class="mb-1">Total Payable: <strong>${formatPrice(b.totalAmount)}</strong></p>
        <p class="mb-1 text-success">Amount Paid: <strong>${formatPrice(b.amountPaid)}</strong></p>
        <p class="mb-0">Payment Status: <span class="badge bg-light text-dark border">${b.paymentStatus}</span></p>
      </div>
    </div>

    <h6 class="fw-bold small text-muted text-uppercase mb-2">Passengers List (${b.travellerCount})</h6>
    <div class="table-responsive">
      <table class="table table-sm table-bordered">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Passenger Name</th>
            <th>Age</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          ${(b.travellers || []).map((p, i) => `
            <tr>
              <td>${i + 1}</td>
              <td class="fw-semibold">${p.name}</td>
              <td>${p.age}</td>
              <td>${p.gender}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    ${b.adminNotes ? `
      <div class="alert alert-info py-2 px-3 small mt-3">
        <strong><i class="fa-solid fa-circle-info me-1"></i> Note from Travel Concierge:</strong> ${b.adminNotes}
      </div>
    ` : ''}
  `;

  new bootstrap.Modal(document.getElementById('bookingDetailsModal')).show();
};

// Open Printable Receipt Modal
window.openReceiptModal = function (bookingId) {
  const b = myBookingsList.find((item) => item._id === bookingId);
  if (!b) return;

  selectedBooking = b;
  const travelDateStr = new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const bookingDateStr = new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const receiptHtml = `
    <div class="receipt-container" id="printableReceiptArea">
      <div class="receipt-header">
        <div>
          <h3 class="fw-bold text-primary mb-1"><i class="fa-solid fa-compass text-secondary me-2"></i> Wanderlust Tours</h3>
          <p class="text-muted small mb-0">Official Booking Voucher & Tax Invoice</p>
          <p class="text-muted small mb-0">contact@wanderlusttravels.com | +91 98765 43210</p>
        </div>
        <div class="text-end">
          <span class="badge bg-secondary mb-1">INVOICE</span>
          <h5 class="fw-bold font-monospace text-primary mb-0">${b.bookingRef}</h5>
          <span class="text-muted small">Date: ${bookingDateStr}</span>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-6">
          <h6 class="fw-bold small text-muted text-uppercase">Billed To:</h6>
          <h6 class="fw-bold mb-1">${b.contactDetails?.name}</h6>
          <p class="text-muted small mb-0">${b.contactDetails?.email}</p>
          <p class="text-muted small mb-0">${b.contactDetails?.phone}</p>
        </div>
        <div class="col-6 text-end">
          <h6 class="fw-bold small text-muted text-uppercase">Trip Information:</h6>
          <h6 class="fw-bold mb-1">${b.packageSnapshot?.title}</h6>
          <p class="text-muted small mb-0">Destination: ${b.packageSnapshot?.destination}</p>
          <p class="text-muted small mb-0">Departure Date: ${travelDateStr}</p>
        </div>
      </div>

      <table class="table table-bordered mb-4">
        <thead class="table-light">
          <tr>
            <th>Description</th>
            <th class="text-center">Travellers</th>
            <th class="text-end">Rate / Person</th>
            <th class="text-end">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${b.packageSnapshot?.title}</strong>
              <div class="text-muted small">${b.packageSnapshot?.duration?.days || 1} Days Tour Package with Hotels & Transfers</div>
            </td>
            <td class="text-center">${b.travellerCount}</td>
            <td class="text-end">${formatPrice(b.packageSnapshot?.pricePerPerson || (b.totalAmount / b.travellerCount))}</td>
            <td class="text-end fw-bold">${formatPrice(b.totalAmount)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th colspan="3" class="text-end">Total Invoice Amount:</th>
            <th class="text-end fs-5 text-primary">${formatPrice(b.totalAmount)}</th>
          </tr>
          <tr>
            <th colspan="3" class="text-end text-success">Amount Received:</th>
            <th class="text-end text-success">${formatPrice(b.amountPaid)}</th>
          </tr>
          <tr>
            <th colspan="3" class="text-end text-danger">Balance Due:</th>
            <th class="text-end text-danger">${formatPrice(Math.max(0, b.totalAmount - b.amountPaid))}</th>
          </tr>
        </tfoot>
      </table>

      <div class="border rounded p-3 bg-light small mb-3">
        <h6 class="fw-bold mb-1">Booking & Verification Status:</h6>
        <div class="d-flex justify-content-between">
          <span>Booking Confirmation: <strong>${b.bookingStatus}</strong></span>
          <span>Payment Status: <strong>${b.paymentStatus}</strong></span>
        </div>
      </div>

      <p class="text-muted text-center small mb-0">
        Thank you for choosing Wanderlust Tours & Travels. For assistance, WhatsApp us at +91 98765 43210.
      </p>
    </div>
  `;

  document.getElementById('receiptModalContent').innerHTML = receiptHtml;
  new bootstrap.Modal(document.getElementById('receiptModal')).show();
};

// Print Function
window.printReceipt = function () {
  window.print();
};

// Open Cancellation Modal
window.openCancelModal = function (bookingId) {
  document.getElementById('cancelBookingId').value = bookingId;
  new bootstrap.Modal(document.getElementById('cancellationModal')).show();
};

// Cancellation Form Submit Handler
function setupCancellationForm() {
  const form = document.getElementById('cancelBookingForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bookingId = document.getElementById('cancelBookingId').value;
    const reason = document.getElementById('cancelReason').value.trim();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (data.success) {
        bootstrap.Modal.getInstance(document.getElementById('cancellationModal')).hide();
        showToast('Cancellation request submitted successfully. Our team will process your refund.', 'success');
        fetchMyBookings();
      } else {
        showToast(data.message || 'Failed to submit cancellation request.', 'error');
      }
    } catch (err) {
      console.error('[Cancellation] Error:', err);
      showToast('Network error while requesting cancellation.', 'error');
    }
  });
}
