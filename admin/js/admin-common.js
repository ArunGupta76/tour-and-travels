/**
 * ADMIN PANEL - SHARED JAVASCRIPT & SECURITY GUARD (admin-common.js)
 */

// Helper to format currency
function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

// Global Admin Toast Notification
function showAdminToast(message, type = 'success') {
  let container = document.getElementById('adminToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'adminToastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `alert alert-${type === 'error' ? 'danger' : type} shadow-lg d-flex align-items-center gap-2 mb-0`;
  toast.style.minWidth = '320px';
  toast.style.animation = 'slideInRight 0.3s ease';

  let icon = 'fa-circle-check';
  if (type === 'error' || type === 'danger') icon = 'fa-circle-xmark';
  if (type === 'warning') icon = 'fa-triangle-exclamation';
  if (type === 'info') icon = 'fa-circle-info';

  toast.innerHTML = `
    <i class="fa-solid ${icon} fa-lg"></i>
    <div class="flex-grow-1">${message}</div>
    <button type="button" class="btn-close btn-close-sm" aria-label="Close"></button>
  `;

  toast.querySelector('.btn-close').addEventListener('click', () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Authenticated Admin Fetch Wrapper
async function adminApi(url, options = {}) {
  const token = localStorage.getItem('adminToken');
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  // If body is JSON and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'login.html';
    throw new Error('Unauthorized or session expired');
  }

  return res;
}

// Verify Admin Session on Page Load
async function verifyAdminAuth() {
  const isLoginPage = window.location.pathname.endsWith('login.html');
  const token = localStorage.getItem('adminToken');

  if (!token) {
    if (!isLoginPage) {
      window.location.href = 'login.html';
    }
    return;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!data.success || !data.isAdmin) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (!isLoginPage) window.location.href = 'login.html';
      return;
    }

    if (isLoginPage) {
      window.location.href = 'dashboard.html';
      return;
    }

    // Populate topbar profile info
    const admin = data.user;
    if (document.getElementById('topbarAdminName')) {
      document.getElementById('topbarAdminName').textContent = admin.name;
    }
    if (document.getElementById('topbarAdminInitial')) {
      document.getElementById('topbarAdminInitial').textContent = admin.name.charAt(0).toUpperCase();
    }
  } catch (err) {
    console.error('[AdminAuth] Error verifying credentials:', err);
  }
}

// Admin Logout
function handleAdminLogout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  showAdminToast('Admin signed out successfully.', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 600);
}

// Highlight Current Active Nav Link
function highlightActiveAdminNav() {
  const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar-nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentFile) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Mobile Sidebar Toggle
function setupSidebarToggle() {
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebar = document.querySelector('.admin-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  verifyAdminAuth();
  highlightActiveAdminNav();
  setupSidebarToggle();

  document.getElementById('adminLogoutBtn')?.addEventListener('click', handleAdminLogout);
});
