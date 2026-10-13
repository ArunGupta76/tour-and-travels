/**
 * USER PROFILE JAVASCRIPT (profile.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html?returnUrl=profile.html';
    return;
  }

  loadProfileData();
  setupProfileForms();
});

async function loadProfileData() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.success && data.user) {
      document.getElementById('profName').value = data.user.name || '';
      document.getElementById('profEmail').value = data.user.email || '';
      document.getElementById('profPhone').value = data.user.phone || '';
      document.getElementById('profAvatarInitial').textContent = data.user.name.charAt(0).toUpperCase();
      document.getElementById('profDisplayName').textContent = data.user.name;
    }
  } catch (err) {
    console.error('[Profile] Error loading data:', err);
  }
}

function setupProfileForms() {
  const token = localStorage.getItem('token');

  // Profile Details Form
  const profileForm = document.getElementById('editProfileForm');
  profileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('profName').value.trim();
    const phone = document.getElementById('profPhone').value.trim();

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Profile information updated successfully!', 'success');
        document.getElementById('profDisplayName').textContent = name;
        document.getElementById('profAvatarInitial').textContent = name.charAt(0).toUpperCase();
      } else {
        showToast(data.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      console.error('[Profile] Update error:', err);
      showToast('Network error while updating profile.', 'error');
    }
  });

  // Change Password Form
  const passwordForm = document.getElementById('changePasswordForm');
  passwordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('currPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match!', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Password changed successfully!', 'success');
        passwordForm.reset();
      } else {
        showToast(data.message || 'Failed to change password.', 'error');
      }
    } catch (err) {
      console.error('[Profile] Password change error:', err);
      showToast('Network error while changing password.', 'error');
    }
  });
}
