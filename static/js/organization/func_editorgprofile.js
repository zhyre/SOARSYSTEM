// static/js/organization/func_editorgprofile.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ func_editorgprofile.js loaded');

  // --- Elements ---
  const form = document.getElementById('organizationForm');
  const submitBtn = document.querySelector('button[type="submit"]');
  const fileInput = document.getElementById('id_profile_picture');
  const fileInfo = document.getElementById('file-info');
  const fileName = document.getElementById('file-name');

  if (!form || !submitBtn) {
    console.error('❌ Edit profile script: Form or Submit Button not found!');
    return;
  }

  // --- File input change handler (optional preview info) ---
  if (fileInput) {
    fileInput.addEventListener('change', function () {
      if (this.files.length > 0) {
        fileName.textContent = this.files[0].name;
        fileInfo.classList.remove('hidden');
        console.log(`📁 Selected file: ${this.files[0].name}`);
      } else {
        fileInfo.classList.add('hidden');
      }
    });
  }

  // --- Debug: Click listener ---
  submitBtn.addEventListener('click', () => {
    console.log('🖱️ Submit button clicked');
  });

  // --- Main form submission ---
  form.addEventListener('submit', async (e) => {
    console.log('🚀 Form submit event triggered');
    e.preventDefault();

    const formData = new FormData(form); // ✅ Includes all fields + files automatically

    // ✅ Log what’s inside FormData (debug)
    console.log('📦 Submitting form data:');
    for (let [key, value] of formData.entries()) {
      if (key === 'profile_picture' && value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData, // ✅ Do not set Content-Type manually!
        headers: {
          'X-Requested-With': 'XMLHttpRequest', // lets Django know this is AJAX
        },
      });

      const result = await response.json();
      console.log('🧾 Response result:', result);

      if (response.ok && result.success) {
        // ✅ Show success message
        const successDiv = document.createElement('div');
        successDiv.className =
          'success-message bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4';
        successDiv.innerHTML =
          '<i class="fas fa-check-circle"></i> <span>' +
          (result.message || 'Organization updated successfully!') +
          '</span>';
        form.parentNode.insertBefore(successDiv, form);

        setTimeout(() => successDiv.remove(), 3000);
        console.log('✅ Update successful!');
      } else {
        console.error('❌ Error from server:', result.errors || result.error);
        alert('Error: ' + JSON.stringify(result.errors || result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('🌐 Network error:', err);
      alert('Network error: ' + err.message);
    }
  });
});
