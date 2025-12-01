let currentSection = 'users';
let deleteItemId = null;

// Content HTML for sections
const usersContentHTML = `
<div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Action Bar -->
    <div class="border-b border-gray-200 p-6">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800" id="section-title">Select user to change</h2>
            <div class="flex items-center space-x-3">
                <button onclick="openAddModal()" id="add-button" class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center space-x-2" style="display: none;">
                    <i class="fas fa-plus"></i>
                    <span id="add-button-text">ADD USER</span>
                </button>
            </div>
        </div>

        <!-- Users Search and Filters -->
        <div id="users-filters" class="mt-4">
            <div class="flex flex-wrap gap-4 items-end">
                <!-- Search -->
                <div class="flex-1 min-w-64">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                    <div class="relative">
                        <input type="text" id="users-search-input" placeholder="Search by username, email, name..."
                               class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>

                <!-- Status Filter -->
                <div class="min-w-32">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                    <select id="users-status-filter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <!-- Program Filter -->
                <div class="min-w-48">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Program</label>
                    <select id="users-program-filter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">All Programs</option>
                        <!-- Programs will be populated dynamically -->
                    </select>
                </div>

                <!-- Buttons -->
                <div class="flex gap-2">
                    <button onclick="applyUsersFilters()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        <i class="fas fa-search mr-2"></i>Search
                    </button>
                    <button onclick="clearUsersFilters()" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        <i class="fas fa-times mr-2"></i>Clear
                    </button>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="mt-4 flex items-center space-x-4">
            <div class="flex items-center space-x-2">
                <select class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>---------</option>
                    <option>Action 1</option>
                    <option>Action 2</option>
                </select>
                <button class="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">Go</button>
            </div>
            <span class="text-sm text-gray-500"><span id="selected-count">0</span> of <span id="total-count">0</span> selected</span>
        </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
        <table class="w-full" id="data-table">
            <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th class="px-6 py-3 text-left">
                        <input type="checkbox" id="select-all" onclick="toggleSelectAll()" class="rounded border-gray-300">
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                        <div class="flex items-center space-x-1">
                            <span id="col1-header">USER ID</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                        <div class="flex items-center space-x-1">
                            <span id="col2-header">USERNAME</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                        <div class="flex items-center space-x-1">
                            <span id="col3-header">EMAIL</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                        <div class="flex items-center space-x-1">
                            <span id="col4-header">REGISTRATION DATE</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                        <div class="flex items-center space-x-1">
                            <span id="col5-header">PROGRAM</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
                    <th id="account-status-header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACCOUNT STATUS</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                    <th id="col6-header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="display: none;"></th>
                    <th id="col7-header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="display: none;"></th>
                    <th id="col8-header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="display: none;"></th>
                </tr>
            </thead>
            <tbody id="table-body" class="bg-white divide-y divide-gray-200">
                <!-- Data will be inserted here -->
            </tbody>
        </table>
    </div>

    <!-- Footer -->
    <div class="border-t border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
            <p class="text-sm text-gray-600"><span id="item-count">0</span> items</p>
            <div id="users-pagination" class="flex space-x-2">
                <!-- Pagination will be inserted here -->
            </div>
        </div>
    </div>
</div>
`;

const groupsContentHTML = `
<div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Action Bar -->
    <div class="border-b border-gray-200 p-6">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800" id="section-title">Select group to change</h2>
            <div class="flex items-center space-x-3">
                <button onclick="openAddModal()" id="add-button" class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center space-x-2">
                    <i class="fas fa-plus"></i>
                    <span id="add-button-text">ADD GROUP</span>
                </button>
            </div>
        </div>

        <!-- Filters -->
        <div class="mt-4 flex items-center space-x-4">
            <div class="flex items-center space-x-2">
                <select class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>---------</option>
                    <option>Action 1</option>
                    <option>Action 2</option>
                </select>
                <button class="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">Go</button>
            </div>
            <span class="text-sm text-gray-500"><span id="selected-count">0</span> of <span id="total-count">0</span> selected</span>
        </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
        <table class="w-full" id="data-table">
            <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th class="px-6 py-3 text-left">
                        <input type="checkbox" id="select-all" onclick="toggleSelectAll()" class="rounded border-gray-300">
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                        <div class="flex items-center space-x-1">
                            <span id="col1-header">GROUP NAME</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                        <div class="flex items-center space-x-1">
                            <span id="col2-header">PERMISSIONS</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                        <div class="flex items-center space-x-1">
                            <span id="col3-header">MEMBERS</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                        <div class="flex items-center space-x-1">
                            <span id="col4-header">CREATED</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                    <th id="col5-header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="display: none;"></th>
                    <th id="col6-header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="display: none;"></th>
                    <th id="col7-header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="display: none;"></th>
                    <th id="col8-header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="display: none;"></th>
                </tr>
            </thead>
            <tbody id="table-body" class="bg-white divide-y divide-gray-200">
                <!-- Data will be inserted here -->
            </tbody>
        </table>
    </div>

    <!-- Footer -->
    <div class="border-t border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
            <p class="text-sm text-gray-600"><span id="item-count">0</span> items</p>
        </div>
    </div>
</div>
`;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadAdminSection('users');
});

// Load section
function loadAdminSection(section) {
    currentSection = section;

    // Update active nav link
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Load section content
    if (section === 'users') {
        document.getElementById('main-content').innerHTML = usersContentHTML;
    } else if (section === 'groups') {
        document.getElementById('main-content').innerHTML = groupsContentHTML;
    }
    // Add other sections here

    // Load section-specific JS
    const script = document.createElement('script');
    script.src = `/static/js/admin/sections/${section}.js`;
    script.onload = function() {
        // Call the section-specific load function
        if (section === 'users') {
            loadUsersSection();
        } else if (section === 'groups') {
            loadGroupsSection();
        }
        // Add other sections here
    };
    document.body.appendChild(script);
}

// Update counts
function updateCounts() {
    const total = document.querySelectorAll('#table-body tr').length;
    document.getElementById('total-count').textContent = total;
    document.getElementById('item-count').textContent = total;

    const selected = document.querySelectorAll('.item-checkbox:checked').length;
    document.getElementById('selected-count').textContent = selected;
}

// Toggle select all
function toggleSelectAll() {
    const selectAll = document.getElementById('select-all');
    document.querySelectorAll('.item-checkbox').forEach(cb => {
        cb.checked = selectAll.checked;
    });
    updateCounts();
}

// Open add modal
function openAddModal() {
    const data = sectionData[currentSection];
    document.getElementById('modal-title').textContent = 'Add ' + data.title.replace('Select ', '').replace(' to change', '');

    // Generate form fields
    const formFields = document.getElementById('form-fields');
    formFields.innerHTML = '';

    data.formFields.forEach(field => {
        const fieldDiv = document.createElement('div');

        if (field.type === 'textarea') {
            fieldDiv.innerHTML = `
                <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                <textarea name="${field.name}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" ${field.required ? 'required' : ''}></textarea>
            `;
        } else if (field.type === 'select') {
            fieldDiv.innerHTML = `
                <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                <select name="${field.name}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${field.required ? 'required' : ''}>
                    <option value="">Select ${field.label}</option>
                    ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>
            `;
        } else {
            fieldDiv.innerHTML = `
                <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                <input type="${field.type}" name="${field.name}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${field.required ? 'required' : ''}>
            `;
        }

        formFields.appendChild(fieldDiv);
    });

    document.getElementById('add-modal').classList.remove('hidden');
    document.getElementById('add-modal').classList.add('flex');
}

// Close add modal
function closeAddModal() {
    document.getElementById('add-modal').classList.add('hidden');
    document.getElementById('add-modal').classList.remove('flex');
    document.getElementById('add-form').reset();
}

// Handle form submit
function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const itemData = {};

    for (let [key, value] of formData.entries()) {
        itemData[key] = value;
    }

    // Check if editing existing item
    if (window.editingItemId) {
        // Update existing item
        const index = sectionData[currentSection].data.findIndex(item => item.id === window.editingItemId);
        if (index > -1) {
            // Update the item with new data, preserving id
            sectionData[currentSection].data[index] = {
                ...sectionData[currentSection].data[index],
                ...itemData
            };
            showToast('Item updated successfully!', 'success');
        }
        // Clear editing id
        window.editingItemId = null;
    } else {
        // Add new item
        const newItem = { id: Date.now(), ...itemData };
        sectionData[currentSection].data.push(newItem);
        showToast('Item added successfully!', 'success');
    }

    // Re-render table
    renderTable();

    // Close modal
    closeAddModal();
}

// Edit item
function editItem(id) {
    const data = sectionData[currentSection];
    const item = data.data.find(item => item.id === id);

    if (item) {
        // Update modal title
        document.getElementById('modal-title').textContent = 'Edit ' + data.title.replace('Select ', '').replace(' to change', '');

        // Generate form fields with existing data
        const formFields = document.getElementById('form-fields');
        formFields.innerHTML = '';

        data.formFields.forEach(field => {
            const fieldDiv = document.createElement('div');
            const value = item[field.name] || '';

            if (field.type === 'textarea') {
                fieldDiv.innerHTML = `
                    <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                    <textarea name="${field.name}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" ${field.required ? 'required' : ''}>${value}</textarea>
                `;
            } else if (field.type === 'select') {
                fieldDiv.innerHTML = `
                    <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                    <select name="${field.name}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${field.required ? 'required' : ''}>
                        <option value="">Select ${field.label}</option>
                        ${field.options.map(opt => `<option value="${opt}" ${opt === value ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                `;
            } else {
                fieldDiv.innerHTML = `
                    <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                    <input type="${field.type}" name="${field.name}" value="${value}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${field.required ? 'required' : ''}>
                `;
            }

            formFields.appendChild(fieldDiv);
        });

        // Store editing item id
        window.editingItemId = id;

        // Show modal
        document.getElementById('add-modal').classList.remove('hidden');
        document.getElementById('add-modal').classList.add('flex');
    }
}

// Delete item
function deleteItem(id) {
    deleteItemId = id;
    document.getElementById('delete-modal').classList.remove('hidden');
    document.getElementById('delete-modal').classList.add('flex');
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('delete-modal').classList.add('hidden');
    document.getElementById('delete-modal').classList.remove('flex');
    deleteItemId = null;
}

// Confirm delete
function confirmDelete() {
    if (deleteItemId) {
        const index = sectionData[currentSection].data.findIndex(item => item.id === deleteItemId);
        if (index > -1) {
            sectionData[currentSection].data.splice(index, 1);
            renderTable();
            showToast('Item deleted successfully!', 'success');
        }
    }
    closeDeleteModal();
}

// Show toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastDiv = toast.querySelector('div');

    toastMessage.textContent = message;

    if (type === 'success') {
        toastDiv.className = 'bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3';
    } else if (type === 'error') {
        toastDiv.className = 'bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3';
    }

    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#table-body tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
});

// Update selected count on checkbox change
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('item-checkbox')) {
        updateCounts();
    }
});