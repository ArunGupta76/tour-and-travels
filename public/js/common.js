/**
 * WANDERLUST TOURS & TRAVELS - SHARED FRONTEND JAVASCRIPT
 */

// Helper to format currency in Indian Rupee format
function formatPrice(num) {
  if (num === undefined || num === null) return '₹0';
  return '₹' + Number(num).toLocaleString('en-IN');
}

// Global Toast Notification System
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;

  let icon = 'fa-circle-check text-success';
  if (type === 'error') icon = 'fa-circle-xmark text-danger';
  if (type === 'warning') icon = 'fa-triangle-exclamation text-warning';

  toast.innerHTML = `
    <i class="fa-solid ${icon} fa-lg"></i>
    <div class="flex-grow-1">${message}</div>
    <button type="button" class="btn-close btn-close-sm ms-2" aria-label="Close"></button>
  `;

  toast.querySelector('.btn-close').addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Fetch and Apply Dynamic Site Settings
async function loadSiteSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      const s = data.settings;

      // Update company names
      document.querySelectorAll('.site-brand-name').forEach((el) => {
        el.textContent = s.companyName || 'Wanderlust Tours & Travels';
      });

      // Update phone
      document.querySelectorAll('.site-phone').forEach((el) => {
        el.textContent = s.phone || '+91 98765 43210';
        if (el.tagName === 'A') el.href = `tel:${s.phone}`;
      });

      // Update email
      document.querySelectorAll('.site-email').forEach((el) => {
        el.textContent = s.email || 'contact@wanderlusttravels.com';
        if (el.tagName === 'A') el.href = `mailto:${s.email}`;
      });

      // Update address
      document.querySelectorAll('.site-address').forEach((el) => {
        el.textContent = s.address || 'MG Road, Bengaluru, India';
      });

      // Update footer text
      document.querySelectorAll('.site-footer-text').forEach((el) => {
        el.textContent = s.footerText || '© 2026 Wanderlust Tours & Travels. All Rights Reserved.';
      });

      // Update floating WhatsApp
      const whatsappBtn = document.getElementById('floatingWhatsApp');
      if (whatsappBtn && s.whatsappNumber) {
        whatsappBtn.href = `https://wa.me/${s.whatsappNumber}?text=${encodeURIComponent('Hello Wanderlust, I would like to inquire about tour packages.')}`;
      }

      // Update social links
      if (s.socialLinks) {
        if (document.getElementById('socialFb')) document.getElementById('socialFb').href = s.socialLinks.facebook || '#';
        if (document.getElementById('socialIg')) document.getElementById('socialIg').href = s.socialLinks.instagram || '#';
        if (document.getElementById('socialTw')) document.getElementById('socialTw').href = s.socialLinks.twitter || '#';
        if (document.getElementById('socialYt')) document.getElementById('socialYt').href = s.socialLinks.youtube || '#';
      }

      // Update promotional banner text
      const promoBanner = document.getElementById('promoTopBanner');
      if (promoBanner && s.promoBannerText) {
        promoBanner.textContent = s.promoBannerText;
      }
    }
  } catch (err) {
    console.warn('[SiteSettings] Failed to fetch live site settings:', err);
  }
}

// User Authentication State Manager
async function checkAuthState() {
  const token = localStorage.getItem('token');
  const userAuthContainer = document.getElementById('navAuthContainer');
  if (!userAuthContainer) return;

  if (!token) {
    userAuthContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <a href="login.html" class="btn-outline-custom">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Login
        </a>
        <a href="register.html" class="btn-primary-custom">
          <i class="fa-solid fa-user-plus"></i> Register
        </a>
      </div>
    `;
    return;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.success && data.user) {
      const user = data.user;
      userAuthContainer.innerHTML = `
        <div class="dropdown">
          <button class="user-menu-btn dropdown-toggle" type="button" id="userMenuBtn" data-bs-toggle="dropdown" aria-expanded="false">
            <span class="user-avatar-badge">${user.name.charAt(0).toUpperCase()}</span>
            <span>${user.name}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0" aria-labelledby="userMenuBtn">
            <li><a class="dropdown-item py-2" href="my-bookings.html"><i class="fa-solid fa-suitcase-rolling me-2 text-primary"></i> My Bookings</a></li>
            <li><a class="dropdown-item py-2" href="profile.html"><i class="fa-solid fa-user-gear me-2 text-primary"></i> My Profile</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><button class="dropdown-item py-2 text-danger" id="logoutBtn"><i class="fa-solid fa-arrow-right-from-bracket me-2"></i> Logout</button></li>
          </ul>
        </div>
      `;

      document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      checkAuthState();
    }
  } catch (err) {
    console.error('[Auth] Failed to verify user token:', err);
  }
}

// Handle Logout
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('Logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
}

// Highlight Current Navigation Link
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav .nav-link').forEach((link) => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Auto Initialize Common Components on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  loadSiteSettings();
  checkAuthState();
  highlightActiveNav();
});
