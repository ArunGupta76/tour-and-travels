/**
 * ABOUT US PAGE JAVASCRIPT (about.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  loadAboutContent();
});

async function loadAboutContent() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();

    if (data.success && data.settings) {
      const s = data.settings;

      if (s.companyName) {
        document.querySelectorAll('.site-company-name').forEach((el) => {
          el.textContent = s.companyName;
        });
      }

      if (s.aboutIntro) document.getElementById('aboutIntroText').textContent = s.aboutIntro;
      if (s.aboutStory) document.getElementById('aboutStoryText').textContent = s.aboutStory;
      if (s.aboutMission) document.getElementById('aboutMissionText').textContent = s.aboutMission;
      if (s.aboutVision) document.getElementById('aboutVisionText').textContent = s.aboutVision;

      // Render features
      if (s.whyChooseUs && s.whyChooseUs.length > 0) {
        const container = document.getElementById('aboutFeaturesContainer');
        if (container) {
          container.innerHTML = s.whyChooseUs.map((f) => `
            <div class="col-lg-3 col-md-6 mb-4">
              <div class="feature-box h-100">
                <div class="feature-icon-wrapper"><i class="fa-solid ${f.icon || 'fa-gem'}"></i></div>
                <h5 class="fw-bold mb-2">${f.title}</h5>
                <p class="text-muted small mb-0">${f.description}</p>
              </div>
            </div>
          `).join('');
        }
      }
    }
  } catch (err) {
    console.error('[About] Error loading content:', err);
  }
}
