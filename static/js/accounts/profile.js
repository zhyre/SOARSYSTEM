// Student Profile JavaScript
// Handles all interactive functionality for student profile management

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeProfileApp();
});

function initializeProfileApp() {
    // Initialize sidebar functionality
    initializeSidebar();
    
    // Initialize profile functionality
    initializeProfile();
    
    // Load sample data
    loadSampleData();
}

// Sidebar functionality
function initializeSidebar() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.classList.toggle('sidebar-active');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('sidebar-active');
        });
    }
}

// Profile functionality
function initializeProfile() {
    const uploadBtn = document.getElementById('upload-photo-btn');
    const deleteBtn = document.getElementById('delete-photo-btn');
    const fileInput = document.getElementById('edit-profile-image');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const aboutTextarea = document.getElementById('edit-about');
    const charCounter = document.getElementById('about-count');
    
    // File upload functionality
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            handleFileUpload(this);
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            deleteProfileImage();
        });
    }
    
    // Save profile changes
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveProfileChanges();
        });
    }
    
    // Cancel button - redirect to dashboard
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            window.location.href = '/accounts/index/';
        });
    }
    
    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            confirmLogout();
        });
    }
    
    // Character counter for about section
    if (aboutTextarea && charCounter) {
        aboutTextarea.addEventListener('input', function() {
            charCounter.textContent = this.value.length;
        });
    }
    
    // Form validation on input
    initializeFormValidation();
}

// Sample data
const sampleProfileData = {
    studentId: "23-3938-601",
    fullName: "Nico John Colo",
    email: "nico.john.colo@citu.edu",
    contact: "+63 912 345 6789",
    about: "Passionate computer science student at CIT-U with interests in web development, artificial intelligence, and software engineering. Always eager to learn new technologies and contribute to meaningful projects.",
    country: "Philippines",
    city: "Cebu City",
    postcode: "6000",
    state: "Cebu"
};

// Load sample data
function loadSampleData() {
    // Populate form fields with sample data
    document.getElementById('edit-student-id').value = sampleProfileData.studentId;
    document.getElementById('edit-full-name').value = sampleProfileData.fullName;
    document.getElementById('edit-email').value = sampleProfileData.email;
    document.getElementById('edit-contact').value = sampleProfileData.contact;
    document.getElementById('edit-about').value = sampleProfileData.about;
    document.getElementById('edit-country').value = sampleProfileData.country;
    document.getElementById('edit-city').value = sampleProfileData.city;
    document.getElementById('edit-postcode').value = sampleProfileData.postcode;
    document.getElementById('edit-state').value = sampleProfileData.state;
    
    // Update character counter
    const charCounter = document.getElementById('about-count');
    if (charCounter) {
        charCounter.textContent = sampleProfileData.about.length;
    }
    
    // Update preview name
    const previewName = document.getElementById('preview-student-name');
    if (previewName) {
        previewName.textContent = sampleProfileData.fullName;
    }
}

// File upload handling
function handleFileUpload(input) {
    const file = input.files[0];
    if (file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showError('image-error', 'Please upload a JPG or PNG image.');
            input.value = '';
            return;
        }
        
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            showError('image-error', 'File size must be less than 10MB.');
            input.value = '';
            return;
        }
        
        // Clear any previous errors
        clearError('image-error');
        
        // Preview the image
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview-image').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Delete profile image
function deleteProfileImage() {
    // Reset to default avatar
    const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(sampleProfileData.fullName)}&background=2563eb&color=fff&size=150`;
    document.getElementById('preview-image').src = defaultImage;
    document.getElementById('edit-profile-image').value = '';
    clearError('image-error');
}

// Form validation
function initializeFormValidation() {
    const requiredFields = [
        { id: 'edit-student-id', errorId: 'student-id-error', message: 'Student ID is required.' },
        { id: 'edit-full-name', errorId: 'full-name-error', message: 'Full Name is required.' },
        { id: 'edit-email', errorId: 'email-error', message: 'Email Address is required.' }
    ];
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorId = field.errorId;
        
        if (input) {
            input.addEventListener('blur', function() {
                validateField(this, errorId, field.message);
            });
            
            input.addEventListener('input', function() {
                clearError(errorId);
            });
        }
    });
    
    // Email validation
    const emailInput = document.getElementById('edit-email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                if (!isValidEmail(this.value.trim())) {
                    showError('email-error', 'Please enter a valid email address.');
                } else {
                    clearError('email-error');
                }
            }
        });
    }
}

// Validate individual field
function validateField(field, errorId, message) {
    if (!field.value.trim()) {
        showError(errorId, message);
        return false;
    } else {
        clearError(errorId);
        return true;
    }
}

// Save profile changes
function saveProfileChanges() {
    const requiredFields = [
        { id: 'edit-student-id', errorId: 'student-id-error', message: 'Student ID is required.' },
        { id: 'edit-full-name', errorId: 'full-name-error', message: 'Full Name is required.' },
        { id: 'edit-email', errorId: 'email-error', message: 'Email Address is required.' }
    ];
    
    // Clear previous errors
    clearAllErrors();
    
    let isValid = true;
    
    // Validate required fields
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!validateField(input, field.errorId, field.message)) {
            isValid = false;
        }
    });
    
    // Validate email format
    const emailInput = document.getElementById('edit-email');
    if (emailInput.value.trim() && !isValidEmail(emailInput.value.trim())) {
        showError('email-error', 'Please enter a valid email address.');
        isValid = false;
    }
    
    // Validate about section
    const aboutInput = document.getElementById('edit-about');
    if (aboutInput.value.trim() && aboutInput.value.length > 500) {
        showError('about-error', 'About section must not exceed 500 characters.');
        isValid = false;
    }
    
    if (isValid) {
        // Show loading state
        const saveBtn = document.getElementById('save-profile-btn');
        saveBtn.classList.add('loading');
        saveBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Update profile data
            updateProfileData();
            
            // Show success message
            showSuccessMessage('Profile updated successfully!');
            
            // Reset button state
            saveBtn.classList.remove('loading');
            saveBtn.disabled = false;
            
            // Redirect to dashboard after a delay
            setTimeout(() => {
                window.location.href = '/accounts/index/';
            }, 2000);
        }, 1500);
    }
}

// Update profile data
function updateProfileData() {
    const fullName = document.getElementById('edit-full-name').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    
    // Update preview name
    const previewName = document.getElementById('preview-student-name');
    if (previewName) {
        previewName.textContent = fullName;
    }
    
    // Update avatar if name changed
    if (fullName !== sampleProfileData.fullName) {
        const newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563eb&color=fff&size=150`;
        document.getElementById('preview-image').src = newAvatar;
    }
    
    // Update sample data
    sampleProfileData.fullName = fullName;
    sampleProfileData.email = email;
}

// Confirm logout
function confirmLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Show loading state
        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn.classList.add('loading');
        logoutBtn.disabled = true;
        
        // Simulate logout process
        setTimeout(() => {
            window.location.href = '/accounts/logout/';
        }, 1000);
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

function clearAllErrors() {
    const errorIds = [
        'student-id-error',
        'full-name-error',
        'email-error',
        'image-error',
        'about-error'
    ];
    
    errorIds.forEach(errorId => {
        clearError(errorId);
    });
}

function showSuccessMessage(message) {
    const successMessage = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    
    if (successMessage && successText) {
        successText.textContent = message;
        successMessage.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 3000);
    }
}

// Form auto-save functionality (optional)
function initializeAutoSave() {
    const form = document.getElementById('edit-profile-form');
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Save to localStorage
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            localStorage.setItem('profileDraft', JSON.stringify(data));
        });
    });
    
    // Load draft on page load
    const draft = localStorage.getItem('profileDraft');
    if (draft) {
        const data = JSON.parse(draft);
        Object.keys(data).forEach(key => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = data[key];
            }
        });
    }
    
    // Clear draft on successful save
    window.addEventListener('beforeunload', function() {
        const saveBtn = document.getElementById('save-profile-btn');
        if (!saveBtn.disabled) {
            localStorage.removeItem('profileDraft');
        }
    });
}

// Keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            document.getElementById('save-profile-btn').click();
        }
        
        // Escape to cancel
        if (e.key === 'Escape') {
            document.getElementById('cancel-profile-btn').click();
        }
    });
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auto-save (optional)
    // initializeAutoSave();
    
    // Initialize keyboard shortcuts
    initializeKeyboardShortcuts();
});

// Accessibility enhancements
function initializeAccessibility() {
    // Add ARIA labels to form elements
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        const label = group.querySelector('label');
        const input = group.querySelector('input, textarea, select');
        
        if (label && input) {
            input.setAttribute('aria-labelledby', label.id || label.textContent);
        }
    });
    
    // Add role attributes
    const form = document.getElementById('edit-profile-form');
    if (form) {
        form.setAttribute('role', 'form');
        form.setAttribute('aria-label', 'Student Profile Form');
    }
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', function() {
    initializeAccessibility();
});
