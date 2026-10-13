/**
 * ADMIN TOUR PACKAGES MANAGEMENT (admin-packages.js)
 */

let allPackages = [];
let packageToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadPackages();
  setupFilterHandlers();
});

async function loadPackages() {
  const tbody = document.getElementById('packagesTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="text-muted small mt-2">Loading packages...</p></td></tr>`;

  try {
    const res = await adminApi('/api/packages/admin/all');
    const data = await res.json();

    if (data.success && data.packages) {
      allPackages = data.packages;
      renderTable(allPackages);
      document.getElementById('totalCountLabel').textContent = `${data.packages.length} Packages Total`;
    }
  } catch (err) {
    console.error('[AdminPackages] Error:', err);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">Failed to load packages.</td></tr>`;
  }
}

function renderTable(packages) {
  const tbody = document.getElementById('packagesTableBody');
  if (!tbody) return;

  if (packages.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-muted">No tour packages match the criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = packages.map((pkg) => {
    const cover = pkg.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb';
    const isPub = pkg.isPublished ? 'checked' : '';
    const isFeat = pkg.isFeatured ? 'checked' : '';

    return `
      <tr>
        <td>
          <img src="${cover}" alt="${pkg.title}" class="package-table-thumb" onerror="this.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb'">
        </td>
        <td>
          <h6 class="fw-bold mb-0 text-primary">${pkg.title}</h6>
          <span class="text-muted small"><i class="fa-solid fa-location-dot me-1"></i> ${pkg.destination}</span>
        </td>
        <td>
          <span class="badge ${pkg.category === 'Domestic' ? 'bg-info bg-opacity-25 text-primary' : 'bg-warning bg-opacity-25 text-dark'}">
            ${pkg.category}
          </span>
        </td>
        <td>
          <div class="fw-bold">${formatCurrency(pkg.discountedPrice)}</div>
          ${pkg.discountPercentage > 0 ? `<div class="small text-danger"><del>${formatCurrency(pkg.originalPrice)}</del> (-${pkg.discountPercentage}%)</div>` : ''}
        </td>
        <td>${pkg.duration?.days || 1}D / ${pkg.duration?.nights || 0}N</td>
        <td>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" ${isPub} onchange="togglePublish('${pkg._id}')">
          </div>
        </td>
        <td>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" ${isFeat} onchange="toggleFeatured('${pkg._id}')">
          </div>
        </td>
        <td>
          <div class="table-action-btns">
            <a href="../package-details.html?id=${pkg._id}" class="btn btn-sm btn-outline-secondary" target="_blank" title="Preview on Website">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
            <a href="package-form.html?id=${pkg._id}" class="btn btn-sm btn-outline-primary" title="Edit Package">
              <i class="fa-solid fa-pen-to-square"></i>
            </a>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="confirmDelete('${pkg._id}', '${pkg.title.replace(/'/g, "\\'")}')" title="Delete Package">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Toggle Publish Status
window.togglePublish = async function (id) {
  try {
    const res = await adminApi(`/api/packages/admin/${id}/toggle-publish`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      showAdminToast(data.message, 'success');
    }
  } catch (err) {
    console.error('[TogglePublish] Error:', err);
    showAdminToast('Failed to update published status.', 'error');
  }
};

// Toggle Featured Status
window.toggleFeatured = async function (id) {
  try {
    const res = await adminApi(`/api/packages/admin/${id}/toggle-featured`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      showAdminToast(data.message, 'success');
    }
  } catch (err) {
    console.error('[ToggleFeatured] Error:', err);
    showAdminToast('Failed to update featured status.', 'error');
  }
};

// Confirm Delete Modal
window.confirmDelete = function (id, title) {
  packageToDeleteId = id;
  document.getElementById('deletePackageTitle').textContent = title;
  new bootstrap.Modal(document.getElementById('deleteConfirmModal')).show();
};

// Execute Delete
document.getElementById('executeDeleteBtn')?.addEventListener('click', async () => {
  if (!packageToDeleteId) return;

  try {
    const res = await adminApi(`/api/packages/admin/${packageToDeleteId}`, { method: 'DELETE' });
    const data = await res.json();

    if (data.success) {
      bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
      showAdminToast(data.message, 'success');
      loadPackages();
    } else {
      showAdminToast(data.message || 'Failed to delete package.', 'error');
    }
  } catch (err) {
    console.error('[DeletePackage] Error:', err);
    showAdminToast('Error deleting package.', 'error');
  }
});

// Setup Live Search & Category Filters
function setupFilterHandlers() {
  const searchInput = document.getElementById('searchPackageInput');
  const categorySelect = document.getElementById('filterCategorySelect');

  const filterFn = () => {
    const q = searchInput?.value.toLowerCase().trim() || '';
    const cat = categorySelect?.value || '';

    const filtered = allPackages.filter((pkg) => {
      const matchesSearch = !q || pkg.title.toLowerCase().includes(q) || pkg.destination.toLowerCase().includes(q);
      const matchesCat = !cat || pkg.category === cat;
      return matchesSearch && matchesCat;
    });

    renderTable(filtered);
  };

  searchInput?.addEventListener('input', filterFn);
  categorySelect?.addEventListener('change', filterFn);
}
