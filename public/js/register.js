/**
 * USER REGISTRATION JAVASCRIPT (register.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('token')) {
    window.location.href = 'my-bookings.html';
    return;
  }

  setupPasswordToggle();
  setupRegisterForm();
});

function setupPasswordToggle() {
  const toggleBtn = document.getElementById('toggleRegisterPasswordBtn');
  const passwordInput = document.getElementById('regPassword');

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      toggleBtn.innerHTML = type === 'password' ? '<i class="fa-regular fa-eye"></i>' : '<i class="fa-regular fa-eye-slash"></i>';
    });
  }
}

function setupRegisterForm() {
  const form = document.getElementById('userRegisterForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('registerSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Creating Account...';

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'warning');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-user-plus me-2"></i> Create Free Account';
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showToast('Registration successful! Welcome to Wanderlust.', 'success');

        setTimeout(() => {
          window.location.href = 'my-bookings.html';
        }, 900);
      } else {
        showToast(data.message || 'Registration failed. Please check your details.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus me-2"></i> Create Free Account';
      }
    } catch (err) {
      console.error('[Register] Error:', err);
      showToast('Network error during registration. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-user-plus me-2"></i> Create Free Account';
    }
  });
}
