/**
 * USER LOGIN JAVASCRIPT (login.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to my-bookings
  if (localStorage.getItem('token')) {
    window.location.href = 'my-bookings.html';
    return;
  }

  setupPasswordToggle();
  setupLoginForm();
});

function setupPasswordToggle() {
  const toggleBtn = document.getElementById('togglePasswordBtn');
  const passwordInput = document.getElementById('loginPassword');

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      toggleBtn.innerHTML = type === 'password' ? '<i class="fa-regular fa-eye"></i>' : '<i class="fa-regular fa-eye-slash"></i>';
    });
  }
}

function setupLoginForm() {
  const form = document.getElementById('userLoginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('loginSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Signing In...';

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showToast('Login successful! Redirecting...', 'success');

        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('returnUrl') || 'my-bookings.html';

        setTimeout(() => {
          window.location.href = returnUrl;
        }, 800);
      } else {
        showToast(data.message || 'Invalid email or password.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket me-2"></i> Sign In to Account';
      }
    } catch (err) {
      console.error('[Login] Error:', err);
      showToast('Network error during login. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket me-2"></i> Sign In to Account';
    }
  });
}
