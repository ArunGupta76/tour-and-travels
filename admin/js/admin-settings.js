/**
 * ADMIN SETTINGS JAVASCRIPT (admin-settings.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  loadAdminSettings();
  setupSettingsForm();
  setupAdminPasswordForm();
});

async function loadAdminSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();

    if (data.success && data.settings) {
      const s = data.settings;

      document.getElementById('setPhone').value = s.phone || '';
      document.getElementById('setWhatsapp').value = s.whatsappNumber || '';
      document.getElementById('setEmail').value = s.email || '';
      document.getElementById('setAddress').value = s.address || '';
      document.getElementById('setMapUrl').value = s.googleMapsEmbedUrl || '';

      if (s.socialLinks) {
        document.getElementById('setFb').value = s.socialLinks.facebook || '';
        document.getElementById('setIg').value = s.socialLinks.instagram || '';
        document.getElementById('setTw').value = s.socialLinks.twitter || '';
        document.getElementById('setYt').value = s.socialLinks.youtube || '';
        document.getElementById('setLi').value = s.socialLinks.linkedin || '';
      }
    }
  } catch (err) {
    console.error('[AdminSettings] Error:', err);
  }
}

function setupSettingsForm() {
  const form = document.getElementById('companySettingsForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      phone: document.getElementById('setPhone').value.trim(),
      whatsappNumber: document.getElementById('setWhatsapp').value.trim(),
      email: document.getElementById('setEmail').value.trim(),
      address: document.getElementById('setAddress').value.trim(),
      googleMapsEmbedUrl: document.getElementById('setMapUrl').value.trim(),
      socialLinks: {
        facebook: document.getElementById('setFb').value.trim(),
        instagram: document.getElementById('setIg').value.trim(),
        twitter: document.getElementById('setTw').value.trim(),
        youtube: document.getElementById('setYt').value.trim(),
        linkedin: document.getElementById('setLi').value.trim(),
      },
    };

    try {
      const res = await adminApi('/api/settings/admin', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showAdminToast('Business contact details updated successfully!', 'success');
      } else {
        showAdminToast(data.message || 'Failed to update settings.', 'error');
      }
    } catch (err) {
      console.error('[Settings] Error:', err);
      showAdminToast('Server error while saving settings.', 'error');
    }
  });
}

function setupAdminPasswordForm() {
  const form = document.getElementById('adminPasswordChangeForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('adminCurrPass').value;
    const newPassword = document.getElementById('adminNewPass').value;
    const confirmPassword = document.getElementById('adminConfirmPass').value;

    if (newPassword !== confirmPassword) {
      showAdminToast('New passwords do not match!', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showAdminToast('New password must be at least 6 characters long.', 'warning');
      return;
    }

    try {
      const res = await adminApi('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        showAdminToast('Admin password changed successfully!', 'success');
        form.reset();
      } else {
        showAdminToast(data.message || 'Failed to change password.', 'error');
      }
    } catch (err) {
      console.error('[PasswordChange] Error:', err);
      showAdminToast('Server error while updating password.', 'error');
    }
  });
}
