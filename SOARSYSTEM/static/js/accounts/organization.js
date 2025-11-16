// Load sample data
function loadSampleData() {
    renderMembers(currentMembers);
    updateMemberCount();
}

// Helper function to add event listeners with cleanup
function addListener(element, event, handler, options) {
    if (!element) return null;
    element.addEventListener(event, handler, options);
    eventListeners.push({ element, event, handler });
    return handler;
}

// Cleanup all event listeners
function cleanupEventListeners() {
    eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    eventListeners = [];
}

// Modal functions
function showModal(modal) {
    try {
        if (!modal) return;
        
        // First remove display: none if it's set inline
        modal.style.display = '';
        
        // Add the active class
        modal.classList.add('active');
        modal.classList.add('show');
        
        // Add overflow hidden to body
        document.body.style.overflow = 'hidden';
        
        // Add escape key handler for this modal
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                hideModal(modal);
            }
        };
        
        // Add click outside handler
        const clickOutsideHandler = (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        };
        
        addListener(document, 'keydown', escapeHandler);
        addListener(modal, 'click', clickOutsideHandler);
        
        // Trigger a reflow to ensure the transition works
        void modal.offsetWidth;
        
    } catch (error) {
        console.error('Error showing modal:', error);
    }
}

function hideModal(modal) {
    try {
        if (!modal) return;
        
        // Remove active class
        modal.classList.remove('active');
        modal.classList.remove('show');
        
        // Reset body overflow
        document.body.style.overflow = 'auto';
        
        // Cleanup any modal-specific event listeners
        cleanupEventListeners();
    } catch (error) {
        console.error('Error hiding modal:', error);
    }
}

// Cleanup on page unload
addListener(window, 'beforeunload', cleanupEventListeners);

// Organization profile functions
function showOrganizationDetails() {
    const orgDetailsSection = document.getElementById('org-details-section');
    const viewDetailsBtn = document.getElementById('view-details-btn');
    
    if (orgDetailsSection && viewDetailsBtn) {
        orgDetailsSection.style.display = 'block';
        viewDetailsBtn.style.display = 'none';
        
        // Smooth scroll to details
        orgDetailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function hideOrganizationDetails() {
    const orgDetailsSection = document.getElementById('org-details-section');
    const viewDetailsBtn = document.getElementById('view-details-btn');
    
    if (orgDetailsSection && viewDetailsBtn) {
        orgDetailsSection.style.display = 'none';
        viewDetailsBtn.style.display = 'inline-flex';
    }
}

function showEditForm() {
    const editForm = document.getElementById('edit-org-form');
    const orgDetailsSection = document.getElementById('org-details-section');
    
    if (editForm) {
        // Hide the details section and show the edit form
        if (orgDetailsSection) {
            orgDetailsSection.style.display = 'none';
        }
        
        // Populate form fields with current values
        populateEditForm();
        
        // Show the edit form
        editForm.style.display = 'block';
        
        // Scroll to the top of the form
        editForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function populateEditForm() {
    // Get the organization name and description from the profile
    const orgName = document.getElementById('org-name')?.textContent.trim();
    const orgDescription = document.getElementById('org-description')?.textContent.trim();
    
    // Populate the form fields
    const nameInput = document.getElementById('org-name-input');
    const descriptionInput = document.getElementById('org-description');
    
    if (nameInput && orgName) {
        nameInput.value = orgName;
    }
    
    if (descriptionInput && orgDescription) {
        descriptionInput.value = orgDescription;
    }
}

function cancelEdit() {
    const editForm = document.getElementById('edit-org-form');
    const orgDetailsSection = document.getElementById('org-details-section');
    
    if (editForm) {
        editForm.style.display = 'none';
    }
    
    if (orgDetailsSection) {
        orgDetailsSection.style.display = 'block';
    }
}

function saveOrganizationChanges(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('org-name-input')?.value.trim();
    const description = document.getElementById('org-description')?.value.trim();
    
    // Basic validation
    if (!name) {
        showError('name-error', 'Organization name is required');
        return;
    }
    
    if (!description) {
        showError('description-error', 'Description is required');
        return;
    }
    
    // Update the organization profile
    const orgNameElement = document.getElementById('org-name');
    const orgDescriptionElement = document.getElementById('org-description');
    
    if (orgNameElement) orgNameElement.textContent = name;
    if (orgDescriptionElement) orgDescriptionElement.textContent = description;
    
    // Show success message
    showSuccessMessage('Organization profile updated successfully!');
    
    // Switch back to view mode
    cancelEdit();
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cancel edit button
    const cancelEditBtn = document.getElementById('cancel-edit-org');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            cancelEdit();
        });
    }

    // Save organization form submission
    const editOrgForm = document.getElementById('edit-org-form');
    if (editOrgForm) {
        editOrgForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveOrganizationChanges(e);
        });
    }

    // Add member form submission
    const addMemberForm = document.getElementById('add-member-form');
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewMember();
        });
    }

    // Character counter for organization description
    const descriptionInput = document.getElementById('org-description');
    if (descriptionInput) {
        descriptionInput.addEventListener('input', function() {
            const charCount = this.value.length;
            const charCounter = document.getElementById('char-count');
            if (charCounter) {
                charCounter.textContent = charCount;
            }
        });
    }
});

function saveOrganizationChanges() {
    const nameInput = document.getElementById('edit-org-name');
    const descInput = document.getElementById('edit-org-description');
    const imageInput = document.getElementById('edit-org-image');
    
    // Clear previous errors
    clearErrors();
    
    let isValid = true;
    
    // Validate organization name
    if (!nameInput.value.trim()) {
        showError('name-error', 'Organization name is required.');
        isValid = false;
    }
    
    // Validate description
    if (!descInput.value.trim()) {
        showError('desc-error', 'Description is required.');
        isValid = false;
    }
    
    // Validate file if selected
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type)) {
            showError('image-error', 'Please upload a JPG or PNG image.');
            isValid = false;
        } else if (file.size > maxSize) {
            showError('image-error', 'File size must be less than 10MB.');
            isValid = false;
        }
    }
    
    if (isValid) {
        // Update the organization info
        document.getElementById('org-name').textContent = nameInput.value.trim();
        document.getElementById('org-description').textContent = descInput.value.trim();
        document.getElementById('detail-org-name').textContent = nameInput.value.trim();
        document.getElementById('detail-org-description').textContent = descInput.value.trim();
        
        // Update profile image if selected
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('org-profile-img').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
        
        // Close modal and show success message
        hideModal(document.getElementById('edit-org-modal'));
        showSuccessMessage('Profile updated successfully!');
        
        // Reset form
        document.getElementById('edit-org-form').reset();
        document.getElementById('desc-count').textContent = '0';
    }
}

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
    }
}

// Member management functions
function renderMembers(members) {
    const membersList = document.getElementById('members-list');
    
    if (members.length === 0) {
        membersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No members found</h3>
                <p>Try adjusting your search or add new members to get started.</p>
            </div>
        `;
        return;
    }
    
    membersList.innerHTML = members.map(member => `
        <div class="member-item" data-member-id="${member.id}">
            <img src="${member.avatar}" alt="${member.name}" class="member-avatar">
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-role">
                    <span class="role-badge ${member.role.toLowerCase()}">${member.role}</span>
                </div>
            </div>
            <div class="member-actions">
                <button class="btn btn-sm ${member.role === 'Officer' ? 'btn-demote' : 'btn-promote'}" 
                        onclick="${member.role === 'Officer' ? 'demoteMember' : 'promoteMember'}(${member.id})">
                    <i class="fas ${member.role === 'Officer' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                    ${member.role === 'Officer' ? 'Demote' : 'Promote'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmRemoveMember(${member.id}, '${member.name}')">
                    <i class="fas fa-trash"></i>
                    Remove
                </button>
            </div>
        </div>
    `).join('');
}

function filterMembers(searchTerm) {
    const filteredMembers = currentMembers.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderMembers(filteredMembers);
}

function addNewMember() {
    const emailInput = document.getElementById('member-email');
    const roleSelect = document.getElementById('member-role');
    
    // Clear previous errors
    clearMemberErrors();
    
    let isValid = true;
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
        showError('member-email-error', 'Email address is required.');
        isValid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
        showError('member-email-error', 'Please enter a valid email address.');
        isValid = false;
    }
    
    // Validate role
    if (!roleSelect.value) {
        showError('member-role-error', 'Please select a role.');
        isValid = false;
    }
    
    if (isValid) {
        // Extract username from email (part before @)
        const username = emailInput.value.trim().split('@')[0];
        const formattedName = username.split('.').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        const newMember = {
            id: memberIdCounter++,
            name: formattedName,
            email: emailInput.value.trim(),
            role: roleSelect.value.charAt(0).toUpperCase() + roleSelect.value.slice(1), // Capitalize first letter
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=2563eb&color=fff&size=150`,
            status: 'pending' // New members are pending by default
        };
        
        currentMembers.push(newMember);
        renderMembers(currentMembers);
        updateMemberCount();
        hideModal(document.getElementById('add-member-modal'));
        showSuccessMessage('Member invitation sent successfully!');
        
        // Reset form
        resetAddMemberForm();
    }
}

// Update the renderMembers function to handle the new member structure
function renderMembers(members) {
    const tbody = document.querySelector('#members-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    members.forEach(member => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="member-info">
                <img src="${member.avatar}" alt="${member.name}" class="member-avatar">
                <div>
                    <div class="member-name">${member.name}</div>
                    <div class="member-email">${member.email || 'No email'}</div>
                </div>
            </td>
            <td><span class="role-badge ${member.role.toLowerCase()}">${member.role}</span></td>
            <td><span class="status-badge ${member.status || 'active'}">${member.status ? member.status.charAt(0).toUpperCase() + member.status.slice(1) : 'Active'}</span></td>
            <td class="actions">
                ${member.role.toLowerCase() === 'member' ? 
                    `<button class="btn-icon" onclick="promoteMember(${member.id})" title="Promote to Admin">
                        <i class="fas fa-arrow-up"></i>
                    </button>` : 
                    member.role.toLowerCase() === 'admin' ?
                    `<button class="btn-icon" onclick="demoteMember(${member.id})" title="Demote to Member">
                        <i class="fas fa-arrow-down"></i>
                    </button>` : ''
                }
                <button class="btn-icon danger" onclick="confirmRemoveMember(${member.id}, '${member.name}')" title="Remove Member">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function promoteMember(memberId) {
    const member = currentMembers.find(m => m.id === memberId);
    if (member && member.role === 'Member') {
        member.role = 'Officer';
        renderMembers(currentMembers);
        showSuccessMessage(`${member.name} has been promoted to Officer!`);
    }
}

function demoteMember(memberId) {
    const member = currentMembers.find(m => m.id === memberId);
    if (member && member.role === 'Officer') {
        member.role = 'Member';
        renderMembers(currentMembers);
        showSuccessMessage(`${member.name} has been demoted to Member.`);
    }
}

function confirmRemoveMember(memberId, memberName) {
    const removeModal = document.getElementById('remove-member-modal');
    const removeMemberName = document.getElementById('remove-member-name');
    
    removeMemberName.textContent = memberName;
    
    // Store the member ID for removal
    removeModal.dataset.memberId = memberId;
    
    showModal(removeModal);
    
    // Set up the confirm button
    const confirmRemoveBtn = document.getElementById('confirm-remove-btn');
    const cancelRemoveBtn = document.getElementById('cancel-remove-btn');
    const closeRemoveModal = document.getElementById('close-remove-modal');
    
    // Remove existing listeners
    const newConfirmBtn = confirmRemoveBtn.cloneNode(true);
    confirmRemoveBtn.parentNode.replaceChild(newConfirmBtn, confirmRemoveBtn);
    
    const newCancelBtn = cancelRemoveBtn.cloneNode(true);
    cancelRemoveBtn.parentNode.replaceChild(newCancelBtn, cancelRemoveBtn);
    
    const newCloseBtn = closeRemoveModal.cloneNode(true);
    closeRemoveModal.parentNode.replaceChild(newCloseBtn, closeRemoveModal);
    
    // Add new listeners
    newConfirmBtn.addEventListener('click', function() {
        removeMember(memberId);
        hideModal(removeModal);
    });
    
    newCancelBtn.addEventListener('click', function() {
        hideModal(removeModal);
    });
    
    newCloseBtn.addEventListener('click', function() {
        hideModal(removeModal);
    });
}

function removeMember(memberId) {
    const member = currentMembers.find(m => m.id === memberId);
    if (member) {
        // Find the member element and add removing class
        const memberElement = document.querySelector(`[data-member-id="${memberId}"]`);
        if (memberElement) {
            memberElement.classList.add('removing');
            
            // Remove from array after animation
            setTimeout(() => {
                currentMembers = currentMembers.filter(m => m.id !== memberId);
                renderMembers(currentMembers);
                updateMemberCount();
                showSuccessMessage(`${member.name} has been removed from the organization.`);
            }, 300);
        }
    }
}

function updateMemberCount() {
    const memberCountElement = document.getElementById('member-count');
    if (memberCountElement) {
        memberCountElement.textContent = currentMembers.length;
    }
}

function resetAddMemberForm() {
    document.getElementById('add-member-form').reset();
    clearMemberErrors();
}

// Utility functions
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

function clearErrors() {
    clearError('name-error');
    clearError('desc-error');
    clearError('image-error');
}

function clearMemberErrors() {
    clearError('member-name-error');
    clearError('member-role-error');
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

document.addEventListener('DOMContentLoaded', function () {
  const openModalBtn = document.getElementById('openModalBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const saveBtn = document.getElementById('saveBtn');
  const programChips = document.getElementById('programChips');
  const displayChips = document.getElementById('displayChips');
  const programsChecklist = document.getElementById('programsChecklist');
  const allowedProgramsHidden = document.getElementById('allowedProgramsHidden');
  const isPublicSelect = document.getElementById('is-public');
  const programsHelperText = document.getElementById('programsHelperText');

  if (!openModalBtn || !modalOverlay || !programsChecklist) return;

  // Modal control
  function openModal() {
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
    renderModalChips();
  }

  function closeModal() {
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
  }

  function getChecked() {
    return Array.from(programsChecklist.querySelectorAll('.program-check:checked'))
      .map(cb => ({ id: cb.value, name: cb.parentElement.querySelector('span')?.textContent || '' }));
  }

  function renderModalChips() {
    if (!programChips) return;
    programChips.innerHTML = '';
    getChecked().forEach(({ id, name }) => {
      const chip = document.createElement('span');
      chip.className = 'inline-flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full';
      chip.innerHTML = `${name} <button type="button" class="ml-1" data-remove-id="${id}">×</button>`;
      programChips.appendChild(chip);
    });
    // Remove handlers
    programChips.querySelectorAll('[data-remove-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-remove-id');
        const cb = programsChecklist.querySelector(`.program-check[value="${id}"]`);
        if (cb) cb.checked = false;
        renderModalChips();
      });
    });
  }

  // Live update chips when checking/unchecking
  programsChecklist.addEventListener('change', (e) => {
    if (e.target.classList.contains('program-check')) {
      renderModalChips();
    }
  });

  // Save: update visible chips and hidden inputs for form submission
  saveBtn?.addEventListener('click', () => {
    if (displayChips) {
      displayChips.innerHTML = '';
      getChecked().forEach(({ name }) => {
        const chip = document.createElement('span');
        chip.className = 'inline-flex items-center bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full';
        chip.textContent = name;
        displayChips.appendChild(chip);
      });
    }
    if (allowedProgramsHidden) {
      allowedProgramsHidden.innerHTML = '';
      getChecked().forEach(({ id }) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'allowed_programs';
        input.value = id;
        allowedProgramsHidden.appendChild(input);
      });
    }
    closeModal();
  });

  cancelBtn?.addEventListener('click', closeModal);
  closeModalBtn?.addEventListener('click', closeModal);
  openModalBtn?.addEventListener('click', openModal);

  // Toggle add/edit availability based on Visibility (Public/Private)
  if (isPublicSelect && openModalBtn) {
    const updateProgramsControls = () => {
      const isPublic = (isPublicSelect.value === 'true');
      openModalBtn.disabled = isPublic;
      if (programsHelperText) {
        programsHelperText.textContent = isPublic
          ? 'Visibility is Public. Set to Private to manage affiliated programs.'
          : 'Select which programs are allowed to join when visibility is Private.';
      }
      // If it became public while modal is open, close it
      if (isPublic && !modalOverlay.classList.contains('hidden')) {
        closeModal();
      }
    };
    // Initialize and listen for changes
    updateProgramsControls();
    isPublicSelect.addEventListener('change', updateProgramsControls);
  }
});

