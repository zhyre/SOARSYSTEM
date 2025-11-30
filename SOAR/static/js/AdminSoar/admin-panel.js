// Data structure for all sections
const sectionData = {
    users: {
        title: 'Select user to change',
        addButton: 'ADD USER',
        columns: ['USERNAME', 'EMAIL', 'FIRST NAME', 'LAST NAME'],
        formFields: [
            { name: 'username', label: 'Username', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'firstName', label: 'First Name', type: 'text', required: true },
            { name: 'lastName', label: 'Last Name', type: 'text', required: true },
            { name: 'password', label: 'Password', type: 'password', required: true }
        ],
        data: [
            { id: 1, username: 'smnta', email: 'samantha@example.com', firstName: 'Samantha', lastName: 'Zhyre' },
            { id: 2, username: 'andi', email: 'andi@example.com', firstName: 'Andi', lastName: 'Cruz' },
            { id: 3, username: 'nico', email: 'nico@example.com', firstName: 'Nico', lastName: 'Reyes' }
        ]
    },
    groups: {
        title: 'Select group to change',
        addButton: 'ADD GROUP',
        columns: ['GROUP NAME', 'PERMISSIONS', 'MEMBERS', 'CREATED'],
        formFields: [
            { name: 'groupName', label: 'Group Name', type: 'text', required: true },
            { name: 'permissions', label: 'Permissions', type: 'textarea', required: false },
            { name: 'description', label: 'Description', type: 'textarea', required: false }
        ],
        data: [
            { id: 1, groupName: 'Administrators', permissions: 'All permissions', members: '3', created: 'Nov. 1, 2025' },
            { id: 2, groupName: 'Moderators', permissions: 'Limited permissions', members: '5', created: 'Oct. 15, 2025' }
        ]
    },
    'event-rsvps': {
        title: 'Select event RSVP to change',
        addButton: 'ADD EVENT RSVP',
        columns: ['EVENT NAME', 'STUDENT', 'STATUS', 'RSVP DATE'],
        formFields: [
            { name: 'eventName', label: 'Event Name', type: 'text', required: true },
            { name: 'student', label: 'Student', type: 'text', required: true },
            { name: 'status', label: 'Status', type: 'select', options: ['Attending', 'Not Attending', 'Maybe'], required: true },
            { name: 'rsvpDate', label: 'RSVP Date', type: 'date', required: true }
        ],
        data: [
            { id: 1, eventName: 'Tech Summit 2025', student: 'smnta', status: 'Attending', rsvpDate: 'Nov. 18, 2025' },
            { id: 2, eventName: 'Code Workshop', student: 'andi', status: 'Maybe', rsvpDate: 'Nov. 17, 2025' }
        ]
    },
    'organization-events': {
        title: 'Select organization event to change',
        addButton: 'ADD ORGANIZATION EVENT',
        columns: ['EVENT NAME', 'ORGANIZATION', 'DATE', 'LOCATION'],
        formFields: [
            { name: 'eventName', label: 'Event Name', type: 'text', required: true },
            { name: 'organization', label: 'Organization', type: 'text', required: true },
            { name: 'date', label: 'Event Date', type: 'datetime-local', required: true },
            { name: 'location', label: 'Location', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea', required: false }
        ],
        data: [
            { id: 1, eventName: 'Annual Coding Competition', organization: 'College of Computer Studies', date: 'Dec. 15, 2025', location: 'Main Auditorium' },
            { id: 2, eventName: 'Tech Talk Series', organization: 'Technologian Wit', date: 'Dec. 1, 2025', location: 'Room 301' }
        ]
    },
    'organization-members': {
        title: 'Select organization member to change',
        addButton: 'ADD ORGANIZATION MEMBER',
        columns: ['ORGANIZATION', 'STUDENT', 'ROLE', 'DATE JOINED'],
        formFields: [
            { name: 'organization', label: 'Organization', type: 'text', required: true },
            { name: 'student', label: 'Student', type: 'text', required: true },
            { name: 'role', label: 'Role', type: 'select', options: ['Member', 'Officer', 'Leader', 'Adviser'], required: true },
            { name: 'dateJoined', label: 'Date Joined', type: 'date', required: true }
        ],
        data: [
            { id: 1, organization: 'Test Organization 1', student: 'smnta', role: 'Adviser', dateJoined: 'Nov. 1, 2025' },
            { id: 2, organization: 'College of Computer Studies', student: 'andi', role: 'Officer', dateJoined: 'Oct. 18, 2025' }
        ]
    },
    organizations: {
        title: 'Select organization to change',
        addButton: 'ADD ORGANIZATION',
        columns: ['ORGANIZATION NAME', 'TYPE', 'MEMBERS', 'CREATED'],
        formFields: [
            { name: 'orgName', label: 'Organization Name', type: 'text', required: true },
            { name: 'type', label: 'Type', type: 'select', options: ['Academic', 'Sports', 'Cultural', 'Special Interest'], required: true },
            { name: 'description', label: 'Description', type: 'textarea', required: false },
            { name: 'contactEmail', label: 'Contact Email', type: 'email', required: false }
        ],
        data: [
            { id: 1, orgName: 'Test Organization 1', type: 'Academic', members: '15', created: 'Oct. 1, 2025' },
            { id: 2, orgName: 'College of Computer Studies', type: 'Academic', members: '42', created: 'Sept. 15, 2025' }
        ]
    },
    programs: {
        title: 'Select program to change',
        addButton: 'ADD PROGRAM',
        columns: ['PROGRAM NAME', 'CODE', 'DEPARTMENT', 'STUDENTS'],
        formFields: [
            { name: 'programName', label: 'Program Name', type: 'text', required: true },
            { name: 'code', label: 'Program Code', type: 'text', required: true },
            { name: 'department', label: 'Department', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea', required: false }
        ],
        data: [
            { id: 1, programName: 'Bachelor of Science in Computer Science', code: 'BSCS', department: 'CCS', students: '150' },
            { id: 2, programName: 'Bachelor of Science in Information Technology', code: 'BSIT', department: 'CCS', students: '120' }
        ]
    }
};

let currentSection = 'users';
let deleteItemId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadAdminSection('users');
});

// Load section
function loadAdminSection(section) {
    currentSection = section;
    const data = sectionData[section];
    
    // Update active nav link
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update page title and breadcrumb
    const sectionNames = {
        'users': 'Accounts › Users',
        'groups': 'Authentication › Groups',
        'event-rsvps': 'Event › Event RSVPs',
        'organization-events': 'Event › Organization Events',
        'organization-members': 'Organization › Organization Members',
        'organizations': 'Organization › Organizations',
        'programs': 'Organization › Programs'
    };
    document.getElementById('breadcrumb').textContent = sectionNames[section];
    document.getElementById('section-title').textContent = data.title;
    document.getElementById('add-button-text').textContent = data.addButton;
    
    // Show/hide Create Organization button based on section
    const createOrgBtn = document.getElementById('create-org-btn');
    if (section === 'organizations') {
        createOrgBtn.classList.remove('hidden');
        createOrgBtn.classList.add('flex');
    } else {
        createOrgBtn.classList.add('hidden');
        createOrgBtn.classList.remove('flex');
    }
    
    // Update table headers
    document.getElementById('col1-header').textContent = data.columns[0];
    document.getElementById('col2-header').textContent = data.columns[1];
    document.getElementById('col3-header').textContent = data.columns[2];
    document.getElementById('col4-header').textContent = data.columns[3];
    
    // Render table data
    renderTable();
}

// Render table
function renderTable() {
    const data = sectionData[currentSection];
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    
    data.data.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        
        const values = Object.values(item).slice(1); // Skip id
        row.innerHTML = `
            <td class="px-6 py-4">
                <input type="checkbox" class="item-checkbox rounded border-gray-300" data-id="${item.id}">
            </td>
            <td class="px-6 py-4 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer">${values[0]}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${values[1]}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${values[2]}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${values[3]}</td>
            <td class="px-6 py-4">
                <button onclick="editItem(${item.id})" class="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteItem(${item.id})" class="text-red-600 hover:text-red-800 font-medium text-sm">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateCounts();
}

// Update counts
function updateCounts() {
    const total = sectionData[currentSection].data.length;
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
document.getElementById('search-input').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Update selected count on checkbox change
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('item-checkbox')) {
        updateCounts();
    }
});
