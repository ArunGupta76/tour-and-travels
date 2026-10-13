/**
 * ADMIN USERS MANAGEMENT (admin-users.js)
 */

let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
  setupUserSearch();
});

async function loadUsers(search = '') {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary"></div><p class="text-muted small mt-2">Loading users...</p></td></tr>`;

  try {
    const res = await adminApi(`/api/users/admin/all?search=${encodeURIComponent(search)}`);
    const data = await res.json();

    if (data.success && data.users) {
      allUsers = data.users;
      renderUsersTable(allUsers);
      document.getElementById('totalUsersCount').textContent = `${data.users.length} Users`;
    }
  } catch (err) {
    console.error('[AdminUsers] Error loading users:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load users.</td></tr>`;
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No registered users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map((u) => {
    const joinedDate = new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const isAct = u.status === 'active' ? 'checked' : '';

    return `
      <tr>
        <td>
          <div class="user-avatar-circle">${u.name.charAt(0).toUpperCase()}</div>
        </td>
        <td>
          <h6 class="fw-bold mb-0 text-primary">${u.name}</h6>
          <span class="text-muted small">Joined: ${joinedDate}</span>
        </td>
        <td>
          <div><i class="fa-regular fa-envelope me-1 text-muted"></i> ${u.email}</div>
          <div class="small text-muted"><i class="fa-solid fa-phone me-1"></i> ${u.phone}</div>
        </td>
        <td>
          <span class="badge bg-primary px-3 py-2 fs-6">${u.bookingCount || 0} Bookings</span>
        </td>
        <td>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" ${isAct} onchange="toggleUserStatus('${u._id}')">
          </div>
        </td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-primary" onclick="viewUserHistory('${u._id}')">
            <i class="fa-solid fa-list-check me-1"></i> View Bookings
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Toggle User Status
window.toggleUserStatus = async function (id) {
  try {
    const res = await adminApi(`/api/users/admin/${id}/toggle-status`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      showAdminToast(data.message, 'success');
    }
  } catch (err) {
    console.error('[ToggleUser] Error:', err);
    showAdminToast('Failed to update user status.', 'error');
  }
};

// View User History Modal
window.viewUserHistory = async function (id) {
  try {
    const res = await adminApi(`/api/users/admin/${id}`);
    const data = await res.json();

    if (data.success && data.user) {
      const u = data.user;
      const bookings = data.bookings || [];

      document.getElementById('userModalName').textContent = u.name;
      document.getElementById('userModalDetails').textContent = `${u.email} | ${u.phone}`;

      const historyContainer = document.getElementById('userBookingsListContainer');
      if (bookings.length === 0) {
        historyContainer.innerHTML = `<p class="text-muted small text-center py-3">No bookings placed by this customer yet.</p>`;
      } else {
        historyContainer.innerHTML = bookings.map(b => `
          <div class="p-3 border rounded mb-2 bg-light d-flex justify-content-between align-items-center">
            <div>
              <strong class="font-monospace text-primary">${b.bookingRef}</strong> - ${b.packageSnapshot?.title}
              <div class="text-muted small">Travel Date: ${new Date(b.travelDate).toLocaleDateString()} | Travellers: ${b.travellerCount}</div>
            </div>
            <div class="text-end">
              <span class="badge bg-secondary mb-1">${b.bookingStatus}</span>
              <div class="fw-bold">${formatCurrency(b.totalAmount)}</div>
            </div>
          </div>
        `).join('');
      }

      new bootstrap.Modal(document.getElementById('userHistoryModal')).show();
    }
  } catch (err) {
    console.error('[UserHistory] Error:', err);
  }
};

function setupUserSearch() {
  document.getElementById('searchUserInput')?.addEventListener('input', (e) => {
    loadUsers(e.target.value.trim());
  });
}
