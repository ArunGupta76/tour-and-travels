/**
 * CONTACT US PAGE JAVASCRIPT (contact.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  loadContactDetails();
  setupContactForm();
});

async function loadContactDetails() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();

    if (data.success && data.settings) {
      const s = data.settings;

      if (s.googleMapsEmbedUrl) {
        const mapIframe = document.getElementById('contactGoogleMap');
        if (mapIframe) mapIframe.src = s.googleMapsEmbedUrl;
      }
    }
  } catch (err) {
    console.error('[Contact] Failed to load contact settings:', err);
  }
}

function setupContactForm() {
  const form = document.getElementById('contactUsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitContactBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Sending Message...';

    const payload = {
      name: document.getElementById('contactName').value.trim(),
      email: document.getElementById('contactEmail').value.trim(),
      phone: document.getElementById('contactPhone').value.trim(),
      subject: document.getElementById('contactSubject').value.trim(),
      message: document.getElementById('contactMessage').value.trim(),
    };

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        showToast('Thank you! Your enquiry has been received. Our concierge will contact you shortly.', 'success');
        form.reset();
      } else {
        showToast(data.message || 'Failed to submit enquiry. Please try again.', 'error');
      }
    } catch (err) {
      console.error('[Contact] Error submitting form:', err);
      showToast('A network error occurred. Please try again later.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i> Send Message';
    }
  });
}
