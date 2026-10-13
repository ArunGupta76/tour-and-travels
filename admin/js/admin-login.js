/**
 * ADMIN LOGIN JAVASCRIPT (admin-login.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already authenticated as admin, redirect to dashboard
  if (localStorage.getItem('adminToken')) {
    window.location.href = 'dashboard.html';
    return;
  }

  setupPasswordToggle();
  setupAdminLoginForm();
});

function setupPasswordToggle() {
  const toggleBtn = document.getElementById('toggleAdminPass');
  const passInput = document.getElementById('adminPassword');

  toggleBtn?.addEventListener('click', () => {
    const isPassword = passInput.getAttribute('type') === 'password';
    passInput.setAttribute('type', isPassword ? 'text' : 'password');
    toggleBtn.innerHTML = isPassword ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
  });
}

function setupAdminLoginForm() {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('adminLoginSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Authenticating...';

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));

        showAdminToast('Welcome, Administrator! Launching Dashboard...', 'success');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 700);
      } else {
        showAdminToast(data.message || 'Invalid administrator credentials.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket me-2"></i> Access Admin Console';
      }
    } catch (err) {
      console.error('[AdminLogin] Error:', err);
      showAdminToast('Server or network connection error.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket me-2"></i> Access Admin Console';
    }
  });
}
