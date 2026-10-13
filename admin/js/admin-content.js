/**
 * ADMIN CONTENT MANAGEMENT JAVASCRIPT (admin-content.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  loadSiteContent();
  setupFaqHandlers();
  setupContentForm();
});

async function loadSiteContent() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();

    if (data.success && data.settings) {
      const s = data.settings;

      document.getElementById('cntCompanyName').value = s.companyName || '';
      document.getElementById('cntTagline').value = s.tagline || '';
      document.getElementById('cntHeroHeadline').value = s.heroHeadline || '';
      document.getElementById('cntHeroSubtitle').value = s.heroSubtitle || '';
      document.getElementById('cntHeroBannerUrl').value = s.heroBannerUrl || '';
      document.getElementById('cntHeroCtaText').value = s.heroCtaText || '';
      document.getElementById('cntPromoBanner').value = s.promoBannerText || '';

      document.getElementById('cntAboutIntro').value = s.aboutIntro || '';
      document.getElementById('cntAboutStory').value = s.aboutStory || '';
      document.getElementById('cntAboutMission').value = s.aboutMission || '';
      document.getElementById('cntAboutVision').value = s.aboutVision || '';
      document.getElementById('cntFooterText').value = s.footerText || '';

      // Policies
      if (s.policies) {
        document.getElementById('cntPolicyCancel').value = s.policies.cancellation || '';
        document.getElementById('cntPolicyBooking').value = s.policies.booking || '';
      }

      // FAQs
      const faqContainer = document.getElementById('faqsListContainer');
      faqContainer.innerHTML = '';
      if (s.faqs && s.faqs.length > 0) {
        s.faqs.forEach(f => addFaqRow(f.question, f.answer));
      } else {
        addFaqRow('How do I book a tour?', 'Select date, traveller count and click book.');
      }
    }
  } catch (err) {
    console.error('[AdminContent] Error loading content:', err);
    showAdminToast('Failed to load website content.', 'error');
  }
}

function setupFaqHandlers() {
  document.getElementById('addFaqBtn')?.addEventListener('click', () => {
    addFaqRow();
  });
}

function addFaqRow(q = '', a = '') {
  const container = document.getElementById('faqsListContainer');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'faq-row-item';
  row.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <span class="fw-bold small text-primary"><i class="fa-solid fa-circle-question me-1"></i> FAQ Item</span>
      <button type="button" class="btn btn-outline-danger btn-sm py-0 px-2" onclick="this.closest('.faq-row-item').remove()">
        <i class="fa-solid fa-trash-can"></i> Remove
      </button>
    </div>
    <div class="mb-2">
      <input type="text" class="form-control form-control-sm faq-question-input" placeholder="Question (e.g. What payment methods do you accept?)" value="${q}" required>
    </div>
    <div>
      <textarea class="form-control form-control-sm faq-answer-input" rows="2" placeholder="Answer..." required>${a}</textarea>
    </div>
  `;
  container.appendChild(row);
}

function setupContentForm() {
  const form = document.getElementById('websiteContentForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = document.getElementById('saveContentBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Updating Live Site...';

    // Collect FAQs
    const faqItems = [];
    document.querySelectorAll('.faq-row-item').forEach((row) => {
      const q = row.querySelector('.faq-question-input')?.value.trim();
      const a = row.querySelector('.faq-answer-input')?.value.trim();
      if (q && a) faqItems.push({ question: q, answer: a });
    });

    const payload = {
      companyName: document.getElementById('cntCompanyName').value.trim(),
      tagline: document.getElementById('cntTagline').value.trim(),
      heroHeadline: document.getElementById('cntHeroHeadline').value.trim(),
      heroSubtitle: document.getElementById('cntHeroSubtitle').value.trim(),
      heroBannerUrl: document.getElementById('cntHeroBannerUrl').value.trim(),
      heroCtaText: document.getElementById('cntHeroCtaText').value.trim(),
      promoBannerText: document.getElementById('cntPromoBanner').value.trim(),
      aboutIntro: document.getElementById('cntAboutIntro').value.trim(),
      aboutStory: document.getElementById('cntAboutStory').value.trim(),
      aboutMission: document.getElementById('cntAboutMission').value.trim(),
      aboutVision: document.getElementById('cntAboutVision').value.trim(),
      footerText: document.getElementById('cntFooterText').value.trim(),
      policies: {
        cancellation: document.getElementById('cntPolicyCancel').value.trim(),
        booking: document.getElementById('cntPolicyBooking').value.trim(),
      },
      faqs: faqItems,
    };

    try {
      const res = await adminApi('/api/settings/admin', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showAdminToast('Website content updated! Changes are now live on the public website.', 'success');
      } else {
        showAdminToast(data.message || 'Failed to update content.', 'error');
      }
    } catch (err) {
      console.error('[SaveContent] Error:', err);
      showAdminToast('Server error while saving content.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk me-2"></i> Save & Publish Content Changes';
    }
  });
}
