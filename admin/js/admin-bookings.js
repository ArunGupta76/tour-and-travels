/**
 * ADMIN BOOKINGS MANAGEMENT (admin-bookings.js)
 */

let allBookings = [];
let activeBookingId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadBookings();
  setupFilters();
  setupStatusUpdateForm();
  setupPaymentForm();
});

async function loadBookings() {
  const tbody = document.getElementById('bookingsTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4"><div class="spinner-border text-primary"></div><p class="text-muted small mt-2">Loading bookings...</p></td></tr>`;

  const search = document.getElementById('searchBookingInput')?.value.trim() || '';
  const bookingStatus = document.getElementById('filterBookingStatus')?.value || '';
  const paymentStatus = document.getElementById('filterPaymentStatus')?.value || '';

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (bookingStatus) params.append('bookingStatus', bookingStatus);
  if (paymentStatus) params.append('paymentStatus', paymentStatus);

  try {
    const res = await adminApi(`/api/bookings/admin/all?${params.toString()}`);
    const data = await res.json();

    if (data.success && data.bookings) {
      allBookings = data.bookings;
      renderBookingsTable(allBookings);
      document.getElementById('bookingsCountLabel').textContent = `${data.total} Bookings Total`;
    }
  } catch (err) {
    console.error('[AdminBookings] Error loading bookings:', err);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">Failed to load bookings.</td></tr>`;
  }
}

function renderBookingsTable(bookings) {
  const tbody = document.getElementById('bookingsTableBody');
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No bookings match the search criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map((b) => {
    const travelDate = new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const bookingStatusBadge = b.bookingStatus === 'Confirmed' ? 'bg-success' : (b.bookingStatus === 'Pending' ? 'bg-warning text-dark' : (b.bookingStatus === 'Cancelled' ? 'bg-danger' : 'bg-primary'));
    const paymentStatusBadge = b.paymentStatus === 'Paid' ? 'bg-success' : (b.paymentStatus === 'Partially Paid' ? 'bg-info text-dark' : 'bg-warning text-dark');

    return `
      <tr>
        <td>
          <span class="booking-ref-chip">${b.bookingRef}</span>
          ${b.cancellationRequested && b.bookingStatus !== 'Cancelled' ? '<span class="badge bg-danger d-block mt-1">Cancel Req</span>' : ''}
        </td>
        <td>
          <div class="fw-bold">${b.contactDetails?.name || 'Customer'}</div>
          <div class="text-muted small">${b.contactDetails?.phone || ''}</div>
          <div class="text-muted small">${b.contactDetails?.email || ''}</div>
        </td>
        <td>
          <div class="fw-bold text-primary">${b.packageSnapshot?.title || 'Tour Package'}</div>
          <div class="text-muted small">${b.travellerCount} Traveller(s)</div>
        </td>
        <td>${travelDate}</td>
        <td>
          <div class="fw-bold">${formatCurrency(b.totalAmount)}</div>
          <div class="small text-success">Paid: ${formatCurrency(b.amountPaid)}</div>
        </td>
        <td><span class="badge ${bookingStatusBadge}">${b.bookingStatus}</span></td>
        <td><span class="badge ${paymentStatusBadge}">${b.paymentStatus}</span></td>
        <td>
          <div class="table-action-btns">
            <button type="button" class="btn btn-sm btn-outline-primary" onclick="openBookingDetailsModal('${b._id}')" title="View Full Details">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-warning" onclick="openStatusModal('${b._id}')" title="Update Status">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-success" onclick="openPaymentModal('${b._id}')" title="Record Manual Payment">
              <i class="fa-solid fa-dollar-sign"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Open Details Modal
window.openBookingDetailsModal = function (id) {
  const b = allBookings.find(item => item._id === id);
  if (!b) return;

  const content = document.getElementById('adminBookingDetailsContent');
  const travelDate = new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const bookedDate = new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  content.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
      <div>
        <h5 class="fw-bold text-primary mb-0 font-monospace">${b.bookingRef}</h5>
        <span class="text-muted small">Booked on: ${bookedDate}</span>
      </div>
      <div>
        <span class="badge bg-primary fs-6 me-2">${b.bookingStatus}</span>
        <span class="badge bg-success fs-6">${b.paymentStatus}</span>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <h6 class="fw-bold text-muted small text-uppercase">Tour Details</h6>
        <p class="mb-1 fw-bold fs-6">${b.packageSnapshot?.title}</p>
        <p class="text-muted small mb-0"><i class="fa-solid fa-location-dot me-1"></i> Destination: ${b.packageSnapshot?.destination}</p>
        <p class="text-muted small mb-0"><i class="fa-regular fa-calendar-check me-1"></i> Travel Date: ${travelDate}</p>
        <p class="text-muted small mb-0"><i class="fa-solid fa-users me-1"></i> Total Travellers: ${b.travellerCount}</p>
      </div>

      <div class="col-md-6">
        <h6 class="fw-bold text-muted small text-uppercase">Customer Information</h6>
        <p class="mb-1 fw-bold fs-6">${b.contactDetails?.name}</p>
        <p class="text-muted small mb-0"><i class="fa-solid fa-envelope me-1"></i> ${b.contactDetails?.email}</p>
        <p class="text-muted small mb-0"><i class="fa-solid fa-phone me-1"></i> ${b.contactDetails?.phone}</p>
        ${b.contactDetails?.city ? `<p class="text-muted small mb-0"><i class="fa-solid fa-city me-1"></i> ${b.contactDetails.city}</p>` : ''}
        ${b.contactDetails?.specialRequests ? `<p class="text-muted small fst-italic mt-1">Note: ${b.contactDetails.specialRequests}</p>` : ''}
      </div>
    </div>

    <h6 class="fw-bold text-muted small text-uppercase mb-2">Travellers Breakdown</h6>
    <table class="table table-sm table-bordered mb-4">
      <thead class="table-light">
        <tr><th>#</th><th>Name</th><th>Age</th><th>Gender</th></tr>
      </thead>
      <tbody>
        ${(b.travellers || []).map((t, idx) => `
          <tr><td>${idx + 1}</td><td class="fw-semibold">${t.name}</td><td>${t.age}</td><td>${t.gender}</td></tr>
        `).join('')}
      </tbody>
    </table>

    <div class="bg-light p-3 rounded mb-3">
      <div class="d-flex justify-content-between mb-1">
        <span>Total Payable Amount:</span>
        <strong class="fs-5 text-primary">${formatCurrency(b.totalAmount)}</strong>
      </div>
      <div class="d-flex justify-content-between text-success mb-1">
        <span>Payments Received to date:</span>
        <strong>${formatCurrency(b.amountPaid)}</strong>
      </div>
      <div class="d-flex justify-content-between text-danger">
        <span>Balance Remaining:</span>
        <strong>${formatCurrency(Math.max(0, b.totalAmount - b.amountPaid))}</strong>
      </div>
    </div>

    ${b.cancellationRequested ? `
      <div class="alert alert-danger py-2 px-3 small">
        <strong><i class="fa-solid fa-triangle-exclamation me-1"></i> Customer Cancellation Request:</strong>
        ${b.cancellationReason || 'No specific reason entered.'}
      </div>
    ` : ''}

    ${b.adminNotes ? `
      <div class="alert alert-info py-2 px-3 small">
        <strong><i class="fa-solid fa-note-sticky me-1"></i> Internal Admin Notes:</strong> ${b.adminNotes}
      </div>
    ` : ''}
  `;

  new bootstrap.Modal(document.getElementById('bookingDetailsModal')).show();
};

// Open Status Update Modal
window.openStatusModal = function (id) {
  const b = allBookings.find(item => item._id === id);
  if (!b) return;

  activeBookingId = id;
  document.getElementById('statusBookingRef').textContent = b.bookingRef;
  document.getElementById('updateBookingStatusSelect').value = b.bookingStatus;
  document.getElementById('updatePaymentStatusSelect').value = b.paymentStatus;
  document.getElementById('updateAdminNotes').value = b.adminNotes || '';

  new bootstrap.Modal(document.getElementById('updateStatusModal')).show();
};

// Setup Status Form
function setupStatusUpdateForm() {
  const form = document.getElementById('updateStatusForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeBookingId) return;

    const bookingStatus = document.getElementById('updateBookingStatusSelect').value;
    const paymentStatus = document.getElementById('updatePaymentStatusSelect').value;
    const adminNotes = document.getElementById('updateAdminNotes').value.trim();

    try {
      const res = await adminApi(`/api/bookings/admin/${activeBookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ bookingStatus, paymentStatus, adminNotes }),
      });

      const data = await res.json();
      if (data.success) {
        bootstrap.Modal.getInstance(document.getElementById('updateStatusModal')).hide();
        showAdminToast('Booking status updated successfully!', 'success');
        loadBookings();
      } else {
        showAdminToast(data.message || 'Failed to update status.', 'error');
      }
    } catch (err) {
      console.error('[UpdateStatus] Error:', err);
      showAdminToast('Failed to update status.', 'error');
    }
  });
}

// Open Payment Record Modal
window.openPaymentModal = function (id) {
  const b = allBookings.find(item => item._id === id);
  if (!b) return;

  activeBookingId = id;
  document.getElementById('paymentBookingRef').textContent = b.bookingRef;
  document.getElementById('paymentDueAmount').textContent = formatCurrency(Math.max(0, b.totalAmount - b.amountPaid));
  document.getElementById('paymentAmountInput').value = Math.max(0, b.totalAmount - b.amountPaid);
  document.getElementById('paymentReferenceInput').value = `MANUAL-${Date.now().toString().slice(-6)}`;

  new bootstrap.Modal(document.getElementById('recordPaymentModal')).show();
};

// Setup Payment Form
function setupPaymentForm() {
  const form = document.getElementById('recordPaymentForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeBookingId) return;

    const amount = Number(document.getElementById('paymentAmountInput').value);
    const paymentMethod = document.getElementById('paymentMethodSelect').value;
    const paymentReference = document.getElementById('paymentReferenceInput').value.trim();
    const notes = document.getElementById('paymentNotesInput').value.trim();

    try {
      const res = await adminApi('/api/payments/admin/record', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: activeBookingId,
          amount,
          paymentMethod,
          paymentReference,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        bootstrap.Modal.getInstance(document.getElementById('recordPaymentModal')).hide();
        showAdminToast('Payment recorded successfully! Booking amounts updated.', 'success');
        loadBookings();
      } else {
        showAdminToast(data.message || 'Failed to record payment.', 'error');
      }
    } catch (err) {
      console.error('[RecordPayment] Error:', err);
      showAdminToast('Server error recording payment.', 'error');
    }
  });
}

function setupFilters() {
  document.getElementById('searchBookingInput')?.addEventListener('input', () => {
    loadBookings();
  });
  document.getElementById('filterBookingStatus')?.addEventListener('change', () => {
    loadBookings();
  });
  document.getElementById('filterPaymentStatus')?.addEventListener('change', () => {
    loadBookings();
  });
}
