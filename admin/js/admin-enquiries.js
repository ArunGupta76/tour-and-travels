/**
 * ADMIN ENQUIRIES JAVASCRIPT (admin-enquiries.js)
 */

let allEnquiries = [];
let activeEnquiryId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadEnquiries();
  setupFilter();
  setupUpdateForm();
});

async function loadEnquiries() {
  const tbody = document.getElementById('enquiriesTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>`;

  const status = document.getElementById('filterEnquiryStatus')?.value || '';
  const params = status ? `?status=${encodeURIComponent(status)}` : '';

  try {
    const res = await adminApi(`/api/enquiries/admin/all${params}`);
    const data = await res.json();

    if (data.success && data.enquiries) {
      allEnquiries = data.enquiries;
      renderTable(allEnquiries);
    }
  } catch (err) {
    console.error('[AdminEnquiries] Error:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load enquiries.</td></tr>`;
  }
}

function renderTable(enquiries) {
  const tbody = document.getElementById('enquiriesTableBody');
  if (!tbody) return;

  if (enquiries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No customer enquiries found.</td></tr>`;
    return;
  }

  tbody.innerHTML = enquiries.map((enq) => {
    const dateFormatted = new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const badgeClass = enq.status === 'New' ? 'bg-danger' : (enq.status === 'In Progress' ? 'bg-warning text-dark' : 'bg-success');

    return `
      <tr>
        <td>
          <div class="fw-bold">${enq.name}</div>
          <div class="text-muted small">${dateFormatted}</div>
        </td>
        <td>
          <div><i class="fa-regular fa-envelope me-1 text-muted"></i> ${enq.email}</div>
          <div class="small text-muted"><i class="fa-solid fa-phone me-1"></i> ${enq.phone}</div>
        </td>
        <td>
          <span class="enquiry-subject-text">${enq.subject}</span>
          <div class="text-muted small text-truncate" style="max-width: 250px;">${enq.message}</div>
        </td>
        <td><span class="badge ${badgeClass}">${enq.status}</span></td>
        <td>
          <span class="text-muted small">${enq.adminNotes || '—'}</span>
        </td>
        <td>
          <div class="table-action-btns">
            <button type="button" class="btn btn-sm btn-outline-primary" onclick="openEnquiryModal('${enq._id}')">
              <i class="fa-solid fa-reply"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteEnquiry('${enq._id}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.openEnquiryModal = function (id) {
  const enq = allEnquiries.find(e => e._id === id);
  if (!enq) return;

  activeEnquiryId = id;
  document.getElementById('modalEnqName').textContent = enq.name;
  document.getElementById('modalEnqContact').textContent = `${enq.email} | ${enq.phone}`;
  document.getElementById('modalEnqSubject').textContent = enq.subject;
  document.getElementById('modalEnqMessage').textContent = enq.message;
  document.getElementById('modalEnqStatus').value = enq.status;
  document.getElementById('modalEnqNotes').value = enq.adminNotes || '';

  new bootstrap.Modal(document.getElementById('enquiryModal')).show();
};

function setupUpdateForm() {
  const form = document.getElementById('enquiryUpdateForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeEnquiryId) return;

    const status = document.getElementById('modalEnqStatus').value;
    const adminNotes = document.getElementById('modalEnqNotes').value.trim();

    try {
      const res = await adminApi(`/api/enquiries/admin/${activeEnquiryId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminNotes }),
      });

      const data = await res.json();
      if (data.success) {
        bootstrap.Modal.getInstance(document.getElementById('enquiryModal')).hide();
        showAdminToast('Enquiry updated successfully!', 'success');
        loadEnquiries();
      } else {
        showAdminToast(data.message || 'Failed to update enquiry.', 'error');
      }
    } catch (err) {
      console.error('[EnquiryUpdate] Error:', err);
      showAdminToast('Error saving enquiry notes.', 'error');
    }
  });
}

window.deleteEnquiry = async function (id) {
  if (!confirm('Are you sure you want to delete this enquiry?')) return;

  try {
    const res = await adminApi(`/api/enquiries/admin/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showAdminToast('Enquiry deleted successfully.', 'success');
      loadEnquiries();
    }
  } catch (err) {
    console.error('[DeleteEnquiry] Error:', err);
    showAdminToast('Failed to delete enquiry.', 'error');
  }
};

function setupFilter() {
  document.getElementById('filterEnquiryStatus')?.addEventListener('change', loadEnquiries);
}
