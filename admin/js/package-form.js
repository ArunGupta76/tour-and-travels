/**
 * PACKAGE FORM JAVASCRIPT (package-form.js)
 */

let editPackageId = null;
let dayCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  editPackageId = urlParams.get('id');

  if (editPackageId) {
    document.getElementById('formPageHeading').textContent = 'Edit Tour Package';
    document.getElementById('formSubmitBtn').textContent = 'Update Tour Package';
    loadPackageForEdit(editPackageId);
  } else {
    // Add 3 default itinerary days for easy setup
    addItineraryDay();
    addItineraryDay();
    addItineraryDay();
  }

  setupImageUpload();
  setupPricingCalculation();
  setupItineraryHandlers();
  setupFormSubmit();
});

// Load Existing Package Data for Edit Mode
async function loadPackageForEdit(id) {
  try {
    const res = await adminApi(`/api/packages/${id}`);
    const data = await res.json();

    if (data.success && data.package) {
      const p = data.package;

      document.getElementById('pkgTitle').value = p.title || '';
      document.getElementById('pkgDestination').value = p.destination || '';
      document.getElementById('pkgCategory').value = p.category || 'Domestic';
      document.getElementById('pkgStartingLocation').value = p.startingLocation || '';
      document.getElementById('pkgDurationDays').value = p.duration?.days || 1;
      document.getElementById('pkgDurationNights').value = p.duration?.nights || 0;
      document.getElementById('pkgOriginalPrice').value = p.originalPrice || 0;
      document.getElementById('pkgDiscountPct').value = p.discountPercentage || 0;
      document.getElementById('pkgDiscountedPrice').value = p.discountedPrice || 0;
      document.getElementById('pkgCoverImage').value = p.coverImage || '';
      document.getElementById('pkgAdditionalImages').value = (p.images || []).join(', ');
      document.getElementById('pkgDescription').value = p.description || '';
      document.getElementById('pkgInclusions').value = (p.inclusions || []).join('\n');
      document.getElementById('pkgExclusions').value = (p.exclusions || []).join('\n');
      document.getElementById('pkgAccommodation').value = p.accommodationDetails || '';
      document.getElementById('pkgTransport').value = p.transportDetails || '';
      document.getElementById('pkgCancellation').value = p.cancellationPolicy || '';
      document.getElementById('pkgInstructions').value = p.importantInstructions || '';
      document.getElementById('pkgAvailability').value = p.availabilityStatus || 'Available';
      document.getElementById('pkgMaxTravellers').value = p.maxTravellers || 20;
      document.getElementById('pkgPublished').checked = Boolean(p.isPublished);
      document.getElementById('pkgFeatured').checked = Boolean(p.isFeatured);

      // Update image preview
      if (p.coverImage) {
        document.getElementById('coverImagePreview').src = p.coverImage;
        document.getElementById('coverImagePreview').classList.remove('d-none');
        document.getElementById('imagePlaceholderText').classList.add('d-none');
      }

      // Render Itinerary Days
      const itineraryContainer = document.getElementById('itineraryDaysContainer');
      itineraryContainer.innerHTML = '';
      dayCount = 0;

      if (p.itinerary && p.itinerary.length > 0) {
        p.itinerary.forEach((dayItem) => {
          addItineraryDay(dayItem);
        });
      } else {
        addItineraryDay();
      }
    }
  } catch (err) {
    console.error('[PackageEdit] Error loading package:', err);
    showAdminToast('Failed to load package for editing.', 'error');
  }
}

// Multer Image Upload Handler
function setupImageUpload() {
  const fileInput = document.getElementById('coverImageFileInput');
  const urlInput = document.getElementById('pkgCoverImage');
  const previewImg = document.getElementById('coverImagePreview');
  const placeholderText = document.getElementById('imagePlaceholderText');

  // URL input change updates preview
  urlInput?.addEventListener('input', () => {
    const val = urlInput.value.trim();
    if (val) {
      previewImg.src = val;
      previewImg.classList.remove('d-none');
      placeholderText.classList.add('d-none');
    }
  });

  // File upload to backend Multer endpoint
  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const uploadStatus = document.getElementById('uploadStatusText');
    if (uploadStatus) uploadStatus.textContent = 'Uploading image...';

    try {
      const res = await adminApi('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.fileUrl) {
        urlInput.value = data.fileUrl;
        previewImg.src = data.fileUrl;
        previewImg.classList.remove('d-none');
        placeholderText.classList.add('d-none');
        if (uploadStatus) uploadStatus.textContent = 'Uploaded successfully!';
        showAdminToast('Image uploaded successfully!', 'success');
      } else {
        showAdminToast(data.message || 'Image upload failed.', 'error');
        if (uploadStatus) uploadStatus.textContent = '';
      }
    } catch (err) {
      console.error('[Upload] Error:', err);
      showAdminToast('Failed to upload image.', 'error');
      if (uploadStatus) uploadStatus.textContent = '';
    }
  });
}

// Live Pricing Calculator
function setupPricingCalculation() {
  const origInput = document.getElementById('pkgOriginalPrice');
  const discPctInput = document.getElementById('pkgDiscountPct');
  const discPriceInput = document.getElementById('pkgDiscountedPrice');

  const calc = () => {
    const orig = Number(origInput?.value) || 0;
    const pct = Number(discPctInput?.value) || 0;

    if (pct > 0 && orig > 0) {
      const finalPrice = Math.round(orig * (1 - pct / 100));
      discPriceInput.value = Math.max(0, finalPrice);
    } else {
      discPriceInput.value = orig;
    }
  };

  origInput?.addEventListener('input', calc);
  discPctInput?.addEventListener('input', calc);
}

// Dynamic Itinerary Day Handlers
function setupItineraryHandlers() {
  document.getElementById('addItineraryDayBtn')?.addEventListener('click', () => {
    addItineraryDay();
  });
}

function addItineraryDay(data = null) {
  dayCount++;
  const container = document.getElementById('itineraryDaysContainer');
  if (!container) return;

  const dayNumber = dayCount;
  const dayTitle = data?.title || '';
  const dayDesc = data?.description || '';
  const dayMeals = data?.meals || 'Breakfast & Dinner';
  const dayHotel = data?.accommodation || 'Certified 4-Star Resort';

  const dayRow = document.createElement('div');
  dayRow.className = 'itinerary-row-card';
  dayRow.id = `itineraryRow_${dayNumber}`;

  dayRow.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="fw-bold mb-0 text-primary"><i class="fa-solid fa-calendar-day me-1"></i> Day <span class="day-number-label">${dayNumber}</span></h6>
      <button type="button" class="btn btn-outline-danger btn-sm py-0 px-2" onclick="removeItineraryDay('${dayRow.id}')">
        <i class="fa-solid fa-trash-can"></i> Remove
      </button>
    </div>
    <div class="row g-2">
      <div class="col-md-12">
        <input type="text" class="form-control form-control-sm itin-title" placeholder="Day Title (e.g. Arrival in Manali & Local Sightseeing)" value="${dayTitle}" required>
      </div>
      <div class="col-md-12">
        <textarea class="form-control form-control-sm itin-desc" rows="2" placeholder="Detailed day description and activities..." required>${dayDesc}</textarea>
      </div>
      <div class="col-md-6">
        <input type="text" class="form-control form-control-sm itin-meals" placeholder="Meals included (e.g. Daily Breakfast & Dinner)" value="${dayMeals}">
      </div>
      <div class="col-md-6">
        <input type="text" class="form-control form-control-sm itin-hotel" placeholder="Accommodation stay details" value="${dayHotel}">
      </div>
    </div>
  `;

  container.appendChild(dayRow);
  reindexDays();
}

window.removeItineraryDay = function (rowId) {
  const row = document.getElementById(rowId);
  if (row) {
    row.remove();
    reindexDays();
  }
};

function reindexDays() {
  const labels = document.querySelectorAll('.day-number-label');
  dayCount = labels.length;
  labels.forEach((label, i) => {
    label.textContent = i + 1;
  });
}

// Gather & Submit Package Form
function setupFormSubmit() {
  const form = document.getElementById('packageAdminForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('formSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Saving Package...';

    // Collect itinerary items
    const rows = document.querySelectorAll('.itinerary-row-card');
    const itinerary = [];
    rows.forEach((row, i) => {
      itinerary.push({
        day: i + 1,
        title: row.querySelector('.itin-title')?.value.trim() || `Day ${i + 1}`,
        description: row.querySelector('.itin-desc')?.value.trim() || '',
        meals: row.querySelector('.itin-meals')?.value.trim() || 'Breakfast included',
        accommodation: row.querySelector('.itin-hotel')?.value.trim() || 'Certified Stay',
      });
    });

    const payload = {
      title: document.getElementById('pkgTitle').value.trim(),
      destination: document.getElementById('pkgDestination').value.trim(),
      category: document.getElementById('pkgCategory').value,
      startingLocation: document.getElementById('pkgStartingLocation').value.trim(),
      durationDays: Number(document.getElementById('pkgDurationDays').value),
      durationNights: Number(document.getElementById('pkgDurationNights').value),
      originalPrice: Number(document.getElementById('pkgOriginalPrice').value),
      discountPercentage: Number(document.getElementById('pkgDiscountPct').value),
      discountedPrice: Number(document.getElementById('pkgDiscountedPrice').value),
      coverImage: document.getElementById('pkgCoverImage').value.trim(),
      images: document.getElementById('pkgAdditionalImages').value.split(',').map(s => s.trim()).filter(Boolean),
      description: document.getElementById('pkgDescription').value.trim(),
      itinerary: JSON.stringify(itinerary),
      inclusions: document.getElementById('pkgInclusions').value.split('\n').map(s => s.trim()).filter(Boolean),
      exclusions: document.getElementById('pkgExclusions').value.split('\n').map(s => s.trim()).filter(Boolean),
      accommodationDetails: document.getElementById('pkgAccommodation').value.trim(),
      transportDetails: document.getElementById('pkgTransport').value.trim(),
      cancellationPolicy: document.getElementById('pkgCancellation').value.trim(),
      importantInstructions: document.getElementById('pkgInstructions').value.trim(),
      availabilityStatus: document.getElementById('pkgAvailability').value,
      maxTravellers: Number(document.getElementById('pkgMaxTravellers').value),
      isPublished: document.getElementById('pkgPublished').checked,
      isFeatured: document.getElementById('pkgFeatured').checked,
    };

    try {
      const url = editPackageId ? `/api/packages/admin/${editPackageId}` : '/api/packages/admin';
      const method = editPackageId ? 'PUT' : 'POST';

      const res = await adminApi(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        showAdminToast(data.message || 'Package saved successfully!', 'success');
        setTimeout(() => {
          window.location.href = 'packages.html';
        }, 800);
      } else {
        showAdminToast(data.message || 'Failed to save package.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = editPackageId ? 'Update Tour Package' : 'Save & Publish Package';
      }
    } catch (err) {
      console.error('[PackageForm] Error saving:', err);
      showAdminToast('Server error while saving package.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = editPackageId ? 'Update Tour Package' : 'Save & Publish Package';
    }
  });
}
