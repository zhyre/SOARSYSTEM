// Data structure for all sections - configuration only
const sectionData = {
    users: {
        title: 'Select user to change',
        addButton: 'ADD USER',
        // Columns: student id - school email - program - year level - role - status
        // Keep 6th column present (empty) because the table layout expects 6 data columns.
        columns: ['STUDENT ID', 'SCHOOL EMAIL', 'PROGRAM', 'YEAR LEVEL', 'ROLE', 'STATUS'],
        // Field mapping: try multiple common keys per column to resolve values robustly
        // Exact backend keys from get_users_data in AdminSoar.views.py
        fields: [
            ['studentId'],
            ['email'],
            ['course'],
            ['yearLevel'],
            ['role'],
            ['status']
        ],
        apiEndpoint: '/admin-panel/api/users/',
        formFields: [
            { name: 'studentId', label: 'Student ID', type: 'text', required: false },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'firstName', label: 'First Name', type: 'text', required: true },
            { name: 'lastName', label: 'Last Name', type: 'text', required: true },
            { name: 'role', label: 'Role', type: 'select', options: ['student', 'staff', 'admin'], required: true },
            { name: 'course', label: 'Program / Course', type: 'select', options: [], required: false },
            { name: 'yearLevel', label: 'Year Level', type: 'number', required: false },
            { name: 'password', label: 'Password', type: 'password', required: true }
        ],
        data: []
    },
    groups: {
        title: 'Select group to change',
        addButton: 'ADD GROUP',
        columns: ['GROUP NAME', 'PERMISSIONS', 'MEMBERS', 'CREATED'],
        apiEndpoint: null, // No API endpoint yet
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
        // Columns: event name - org name - student name - rsvp date - status
        columns: ['EVENT NAME', 'ORG NAME', 'STUDENT NAME', 'RSVP DATE', 'STATUS'],
        // Exact backend keys from get_rsvps_data in AdminSoar.views.py
        fields: [
            ['eventName'],
            ['organization'],
            ['student'],
            ['rsvpDate'],
            ['status'],
        ],
        apiEndpoint: '/admin-panel/api/rsvps/',
        formFields: [
            { name: 'eventName', label: 'Event Name', type: 'text', required: false, readonly: true },
            { name: 'organization', label: 'Organization', type: 'text', required: false, readonly: true },
            { name: 'student', label: 'Student', type: 'text', required: false, readonly: true },
            { name: 'status', label: 'Status', type: 'select', options: ['going', 'not_going', 'interested'], required: false },
            { name: 'rsvpDate', label: 'RSVP Date', type: 'date', required: false, readonly: true }
        ],
        data: []
    },
    'organization-events': {
        title: 'Select organization event to change',
        addButton: 'ADD ORGANIZATION EVENT',
        // Columns: event name - org name - event date - event location
        columns: ['EVENT NAME', 'ORG NAME', 'EVENT DATE', 'EVENT LOCATION', 'ACTIVITY TYPE', 'STATUS'],
        // Exact backend keys from get_events_data in AdminSoar.views.py
        fields: [
            ['eventName'],
            ['organization'],
            ['date'],
            ['location'],
            ['activityType'],
            ['status']
        ],
        apiEndpoint: '/admin-panel/api/events/',
        formFields: [
            { name: 'eventName', label: 'Event Name', type: 'text', required: true },
            { name: 'organization', label: 'Organization', type: 'select', options: [], required: true },
            { name: 'date', label: 'Event Date', type: 'datetime-local', required: true },
            { name: 'location', label: 'Location', type: 'text', required: false },
            { name: 'activityType', label: 'Activity Type', type: 'select', options: ['workshop','seminar','meeting','social','other'], required: false },
            { name: 'description', label: 'Description', type: 'textarea', required: false },
            { name: 'cancelled', label: 'Cancelled', type: 'checkbox', required: false }
        ],
        data: []
    },
    'organization-members': {
        title: 'Select organization member to change',
        addButton: 'ADD ORGANIZATION MEMBER',
        columns: ['ORGANIZATION', 'STUDENT', 'ROLE', 'DATE JOINED', 'STATUS'],
          fields: [
              ['organization'],
              ['student'],
              ['role'],
              ['dateJoined'],
              ['status']
          ],
        apiEndpoint: '/admin-panel/api/organization-members/',
        formFields: [
            { name: 'organization', label: 'Organization', type: 'select', options: [], required: true },
            { name: 'student', label: 'Student (Email)', type: 'text', required: true },
            { name: 'role', label: 'Role', type: 'select', options: ['member', 'officer', 'leader', 'adviser'], required: false },
            { name: 'isApproved', label: 'Approved', type: 'checkbox', required: false }
        ],
        data: []
    },
    organizations: {
        title: 'Select organization to change',
        addButton: 'ADD ORGANIZATION',
        // Columns: org name - program affiliated - type - members count - date created
        columns: ['ORG NAME', 'PROGRAM AFFILIATED', 'TYPE', 'MEMBERS COUNT', 'DATE CREATED', 'ADVISER'],
        // Exact backend keys from get_organizations_data in AdminSoar.views.py
        // Note: backend does not provide a "program affiliated" field yet.
        fields: [
            ['orgName'],
            ['programs'],
            ['type'],
            ['members'],
            ['created'],
            ['adviser']
        ],
        apiEndpoint: '/admin-panel/api/organizations/',
        formFields: [
            { name: 'orgName', label: 'Organization Name', type: 'text', required: false },
            { name: 'description', label: 'Description', type: 'textarea', required: false },
            { name: 'isPublic', label: 'Public', type: 'checkbox', required: false },
            { name: 'programs', label: 'Programs (comma-separated)', type: 'text', required: false },
            { name: 'adviser', label: 'Adviser (user id)', type: 'text', required: false }
        ],
        data: []
    },
    programs: {
        title: 'Select program to change',
        addButton: 'ADD PROGRAM',
        columns: ['PROGRAM NAME', 'CODE', 'DEPARTMENT', 'STUDENTS'],
        // Exact backend keys from get_programs_data in AdminSoar.views.py
        fields: [
            ['programName'],
            ['code'],
            ['department'],
            ['students'],
        ],
        apiEndpoint: '/admin-panel/api/programs/',
        formFields: [
            { name: 'programName', label: 'Program Name', type: 'text', required: false },
            { name: 'code', label: 'Program Code', type: 'text', required: false }
        ],
        data: []
    },
    analytics: {
        title: 'Analytics Dashboard',
        addButton: '',
        columns: [],
        fields: [],
        apiEndpoint: null,
        formFields: [],
        data: []
    }
};

let currentSection = 'users';
let deleteItemId = null;

// Fetch data from API
async function fetchSectionData(section) {
    const config = sectionData[section];

    // If no API endpoint, use static data
    if (!config.apiEndpoint) {
        return;
    }

    try {
        const response = await fetch(config.apiEndpoint);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        sectionData[section].data = result.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load data', 'error');
    }
}

// Fetch organizations for select options
async function fetchOrganizations() {
    try {
        const response = await fetch('/admin-panel/api/organizations/');
        if (!response.ok) {
            throw new Error('Failed to fetch organizations');
        }
        const result = await response.json();
        return result.data.map(org => org.orgName);
    } catch (error) {
        console.error('Error fetching organizations:', error);
        return [];
    }
}

// Fetch programs for select options
async function fetchPrograms() {
    try {
        const response = await fetch('/admin-panel/api/programs/');
        if (!response.ok) {
            throw new Error('Failed to fetch programs');
        }
        const result = await response.json();
        return result.data.map(prog => ({
            value: prog.code,
            label: prog.code + ' - ' + prog.programName
        }));
    } catch (error) {
        console.error('Error fetching programs:', error);
        return [];
    }
}


// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadAdminSection('users');
});

// Load section
async function loadAdminSection(section) {
    currentSection = section;
    let data = sectionData[section];
    if (!data) {
        if (section === 'analytics') {
            data = {
                title: 'Analytics Dashboard',
                addButton: '',
                columns: [],
                fields: [],
                apiEndpoint: null,
                formFields: [],
                data: []
            };
        } else {
            console.error('Section data not found for:', section);
            return;
        }
    }
    
    // Update active nav link (guard against missing elements)
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const navEl = document.querySelector(`[data-section="${section}"]`);
    if (navEl && navEl.classList) {
        navEl.classList.add('active');
    }
    
    // Update page title and breadcrumb
    const sectionNames = {
        'users': 'Accounts › Users',
        'groups': 'Authentication › Groups',
        'event-rsvps': 'Event › Event RSVPs',
        'organization-events': 'Event › Organization Events',
        'organization-members': 'Organization › Organization Members',
        'organizations': 'Organization › Organizations',
        'programs': 'Organization › Programs',
        'analytics': 'Analytics › Dashboard'
    };
    const breadcrumbEl = document.getElementById('breadcrumb');
    const sectionTitleEl = document.getElementById('section-title');
    const addButtonTextEl = document.getElementById('add-button-text');

    if (breadcrumbEl) breadcrumbEl.textContent = sectionNames[section] || section;

    // Defensive: ensure `data` is an object before accessing properties
    if (!data || typeof data !== 'object') {
        console.warn('loadAdminSection: missing sectionData for', section);
        // Provide a minimal fallback so UI still renders
        data = {
            title: sectionNames[section] || String(section || ''),
            addButton: '',
            columns: [],
            fields: [],
            apiEndpoint: null,
            formFields: [],
            data: []
        };
    }

    if (sectionTitleEl) sectionTitleEl.textContent = data.title || '';
    if (addButtonTextEl) addButtonTextEl.textContent = data.addButton || '';
    
    // Clear search input when switching sections
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Show/hide Create Organization button based on section
    const createOrgBtn = document.getElementById('create-org-btn');
    if (section === 'organizations') {
        createOrgBtn.classList.remove('hidden');
        createOrgBtn.classList.add('flex');
    } else {
        createOrgBtn.classList.add('hidden');
        createOrgBtn.classList.remove('flex');
    }

    const tableDiv = document.querySelector('.bg-white.rounded-lg.shadow-sm.border.border-gray-200');
    const analyticsDiv = document.getElementById('analytics-content');

    if (section === 'analytics') {
        if (tableDiv && tableDiv.classList) tableDiv.classList.add('hidden');
        if (analyticsDiv && analyticsDiv.classList) analyticsDiv.classList.remove('hidden');
        // Only call loadAnalytics if it's available; catch runtime errors so UI doesn't break
        if (typeof loadAnalytics === 'function') {
            try {
                await loadAnalytics();
            } catch (err) {
                console.error('loadAnalytics error:', err);
                showToast('Failed to load analytics', 'error');
            }
        } else {
            console.warn('loadAnalytics is not defined');
            showToast('Analytics functionality is unavailable.', 'error');
        }
    } else {
        if (tableDiv && tableDiv.classList) tableDiv.classList.remove('hidden');
        if (analyticsDiv && analyticsDiv.classList) analyticsDiv.classList.add('hidden');

        // Update table headers
        document.getElementById('col1-header').textContent = data.columns[0] || '';
        document.getElementById('col2-header').textContent = data.columns[1] || '';
        document.getElementById('col3-header').textContent = data.columns[2] || '';
        document.getElementById('col4-header').textContent = data.columns[3] || '';
        document.getElementById('col5-header').textContent = data.columns[4] || '';
        document.getElementById('col6-header').textContent = data.columns[5] || '';

        // Fetch data from API
        await fetchSectionData(section);

        // Render table data
        renderTable();
    }
}

// Render table
function renderTable() {
    const data = sectionData[currentSection];
    if (!data || typeof data !== 'object') {
        console.warn('renderTable: no data for section', currentSection);
        return;
    }

    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Helper to resolve field values. Supports array of candidate keys and nested keys using dot notation.
    function resolveFieldValue(item, field) {
        if (!field) return '';
        const getVal = (obj, key) => key.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);

        if (Array.isArray(field)) {
            for (const k of field) {
                const v = getVal(item, k);
                if (v !== undefined && v !== null && v !== '') return v;
            }
            return '';
        }

        const v = getVal(item, field);
        return (v === undefined || v === null) ? '' : v;
    }

    (data.data || []).forEach(item => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';

        let html = '';
        html += `<td class="px-6 py-4"><input type="checkbox" class="item-checkbox rounded border-gray-300" data-id="${item.id}"></td>`;

        // Determine which fields to show for this section (fall back to object keys minus id)
        const fields = data.fields || Object.keys(item || {}).filter(k => k !== 'id');

        // Render up to 6 data columns to match table layout
        for (let i = 0; i < 6; i++) {
            const fieldKey = fields[i];
            const value = fieldKey ? resolveFieldValue(item, fieldKey) : '';

            if (i === 0) {
                html += `<td class="px-6 py-4 text-sm ${value ? 'text-blue-600 hover:text-blue-800 font-medium cursor-pointer' : 'text-gray-700'}">${value}</td>`;
            } else {
                html += `<td class="px-6 py-4 text-sm text-gray-700">${value}</td>`;
            }
        }

        html += `
            <td class="px-6 py-4">
                <button onclick="editItem('${item.id}')" class="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteItem('${item.id}')" class="text-red-600 hover:text-red-800 font-medium text-sm">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;

        row.innerHTML = html;
        tbody.appendChild(row);
    });

    updateCounts();
}

// Update counts
function updateCounts() {
    const sec = sectionData[currentSection];
    const total = (sec && sec.data) ? sec.data.length : 0;
    const totalEl = document.getElementById('total-count');
    const itemCountEl = document.getElementById('item-count');
    const selectedCountEl = document.getElementById('selected-count');
    if (totalEl) totalEl.textContent = total;
    if (itemCountEl) itemCountEl.textContent = total;

    const selected = document.querySelectorAll('.item-checkbox:checked').length;
    if (selectedCountEl) selectedCountEl.textContent = selected;
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
async function openAddModal() {
    const data = sectionData[currentSection];
    if (!data || typeof data !== 'object') {
        console.warn('openAddModal: no sectionData for', currentSection);
        showToast('Cannot open form for unknown section', 'error');
        return;
    }

    const modalTitleEl = document.getElementById('modal-title');
    if (modalTitleEl) modalTitleEl.textContent = 'Add ' + String(data.title || '').replace('Select ', '').replace(' to change', '');

    // Fetch options for selects
    if (currentSection === 'organization-events' || currentSection === 'organization-members') {
        const orgs = await fetchOrganizations();
        const orgField = (data.formFields || []).find(f => f.name === 'organization');
        if (orgField) {
            orgField.options = orgs;
        }
    } else if (currentSection === 'users') {
        const programs = await fetchPrograms();
        const courseField = (data.formFields || []).find(f => f.name === 'course');
        if (courseField) {
            courseField.options = programs;
        }
    }

    // Generate form fields
    const formFields = document.getElementById('form-fields');
    if (!formFields) {
        console.warn('openAddModal: form fields container not found');
        showToast('Form container missing', 'error');
        return;
    }
    formFields.innerHTML = '';

    (data.formFields || []).forEach(field => {
        const fieldDiv = document.createElement('div');
        const requiredAttr = field.required ? 'required' : '';
        const readonlyAttr = field.readonly ? 'readonly' : '';

        if (field.type === 'textarea') {
            fieldDiv.innerHTML = `
                <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                <textarea name="${field.name}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" ${requiredAttr} ${readonlyAttr}></textarea>
            `;
        } else if (field.type === 'select') {
            // Handle both array of strings and array of objects with value/label
            const optionsHTML = field.options.map(opt => {
                if (typeof opt === 'object' && opt.value && opt.label) {
                    return `<option value="${opt.value}">${opt.label}</option>`;
                } else {
                    return `<option value="${opt}">${opt}</option>`;
                }
            }).join('');
            
            fieldDiv.innerHTML = `
                <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                <select name="${field.name}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${requiredAttr} ${readonlyAttr}>
                    <option value="">Select ${field.label}</option>
                    ${optionsHTML}
                </select>
            `;
        } else if (field.type === 'checkbox') {
            fieldDiv.innerHTML = `
                <label class="inline-flex items-center space-x-2">
                    <input type="checkbox" name="${field.name}" class="form-checkbox h-4 w-4 text-blue-600" ${readonlyAttr}>
                    <span class="text-sm font-medium text-gray-700">${field.label}</span>
                </label>
            `;
        } else {
            fieldDiv.innerHTML = `
                <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                <input type="${field.type}" name="${field.name}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${requiredAttr} ${readonlyAttr}>
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
    async function handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const itemData = {};
    
    for (let [key, value] of formData.entries()) {
        itemData[key] = value;
    }
    
    console.log('DEBUG: Form data before submit:', itemData);
    
    // Ensure checkbox values are captured (FormData omits unchecked boxes)
    // Read checkbox fields from the form directly so we can send true/false
    const currentFormFields = sectionData[currentSection].formFields || [];
    for (const f of currentFormFields) {
        if (f.type === 'checkbox') {
            const el = event.target.querySelector(`[name="${f.name}"]`);
            if (el) {
                itemData[f.name] = !!el.checked;
            }
        }
    }
    
    // Check if editing existing item
    if (window.editingItemId) {
        // Update existing item: attempt server PATCH if endpoint exists
        const section = currentSection;
        const config = sectionData[section];
        const id = window.editingItemId;

        if (config && config.apiEndpoint) {
            const base = config.apiEndpoint;
            const url = base.endsWith('/') ? `${base}${id}/` : `${base}/${id}/`;
            try {
                // Only send fields that changed (partial update)
                const original = (sectionData[section].data || []).find(it => it.id === id) || {};
                const payload = {};
                for (const k of Object.keys(itemData)) {
                    const origVal = (original[k] === undefined || original[k] === null) ? '' : String(original[k]);
                    const newVal = (itemData[k] === undefined || itemData[k] === null) ? '' : String(itemData[k]);
                    if (origVal !== newVal) {
                        // For checkbox-like boolean values or empty strings, still include as change
                        payload[k] = itemData[k];
                    }
                }

                if (Object.keys(payload).length === 0) {
                    showToast('No changes to save.', 'error');
                } else {
                    const token = (typeof csrftoken !== 'undefined') ? csrftoken : (window.csrftoken || '');
                    const resp = await fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': token,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!resp.ok) {
                        let msg = 'Failed to update item.';
                        try { const j = await resp.json(); msg = j.error || j.message || msg; } catch (e) {}
                        showToast(msg, 'error');
                    } else {
                        // Refetch data to get updated values (e.g., recalculated counts)
                        await fetchSectionData(section);
                        showToast('Item updated successfully!', 'success');
                    }
                }
            } catch (err) {
                console.error('Update error', err);
                showToast('Failed to update item', 'error');
            }
        } else {
            // No API endpoint: just update locally
            const index = sectionData[currentSection].data.findIndex(item => item.id === window.editingItemId);
            if (index > -1) {
                sectionData[currentSection].data[index] = {
                    ...sectionData[currentSection].data[index],
                    ...itemData
                };
                showToast('Item updated locally', 'success');
            }
        }

        // Clear editing id
        window.editingItemId = null;
    } else {
        // Add new item: send POST to API if endpoint exists
        const section = currentSection;
        const config = sectionData[section];

        if (config && config.apiEndpoint) {
            try {
                const token = (typeof csrftoken !== 'undefined') ? csrftoken : (window.csrftoken || '');
                const resp = await fetch(config.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': token,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(itemData)
                });

                if (!resp.ok) {
                    let msg = 'Failed to add item.';
                    try {
                        const j = await resp.json();
                        if (j.errors) {
                            // Collect all errors
                            const errorMsgs = [];
                            for (const field in j.errors) {
                                errorMsgs.push(`${field}: ${j.errors[field]}`);
                            }
                            msg = errorMsgs.join('; ');
                        } else {
                            msg = j.error || j.message || msg;
                        }
                    } catch (e) {}
                    showToast(msg, 'error');
                } else {
                    // Refetch data to get updated list
                    await fetchSectionData(section);
                    showToast('Item added successfully!', 'success');
                }
            } catch (err) {
                console.error('Add error', err);
                showToast('Failed to add item', 'error');
            }
        } else {
            // Fallback: local add
            const newItem = { id: Date.now(), ...itemData };
            sectionData[section].data.push(newItem);
            showToast('Item added locally', 'success');
        }
    }
    
    // Re-render table
    renderTable();
    
    // Close modal
    closeAddModal();
}

// Edit item
function editItem(id) {
    const data = sectionData[currentSection];
    if (!data || typeof data !== 'object') {
        console.warn('editItem: no sectionData for', currentSection);
        showToast('Cannot edit item for unknown section', 'error');
        return;
    }

    const item = (data.data || []).find(item => item.id === id);
    if (!item) {
        console.warn('editItem: item not found', id, 'in', currentSection);
        showToast('Item not found', 'error');
        return;
    }

    // Update modal title
    const modalTitleEl = document.getElementById('modal-title');
    if (modalTitleEl) modalTitleEl.textContent = 'Edit ' + String(data.title || '').replace('Select ', '').replace(' to change', '');

    // Fetch options for selects (same as in openAddModal)
    (async () => {
        if (currentSection === 'organization-events' || currentSection === 'organization-members') {
            const orgs = await fetchOrganizations();
            const orgField = (data.formFields || []).find(f => f.name === 'organization');
            if (orgField) {
                orgField.options = orgs;
            }
        } else if (currentSection === 'users') {
            const programs = await fetchPrograms();
            const courseField = (data.formFields || []).find(f => f.name === 'course');
            if (courseField) {
                courseField.options = programs;
            }
        }

        // Generate form fields with existing data
        const formFields = document.getElementById('form-fields');
        if (!formFields) {
            console.warn('editItem: form fields container missing');
            showToast('Form container not found', 'error');
            return;
        }
        formFields.innerHTML = '';

        (data.formFields || []).forEach(field => {
            const fieldDiv = document.createElement('div');
            const value = (item[field.name] !== undefined && item[field.name] !== null) ? item[field.name] : '';
            // When editing, do not enforce 'required' so fields are optional
            const requiredAttr = '';
            const readonlyAttr = field.readonly ? 'readonly' : '';

            if (field.type === 'textarea') {
                fieldDiv.innerHTML = `
                    <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                    <textarea name="${field.name}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" ${requiredAttr} ${readonlyAttr}>${value}</textarea>
                `;
            } else if (field.type === 'select') {
                // Handle both array of strings and array of objects with value/label
                const optionsHTML = field.options.map(opt => {
                    if (typeof opt === 'object' && opt.value && opt.label) {
                        return `<option value="${opt.value}" ${String(opt.value) === String(value) ? 'selected' : ''}>${opt.label}</option>`;
                    } else {
                        return `<option value="${opt}" ${String(opt) === String(value) ? 'selected' : ''}>${opt}</option>`;
                    }
                }).join('');
                
                fieldDiv.innerHTML = `
                    <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                    <select name="${field.name}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${requiredAttr} ${readonlyAttr}>
                        <option value="">Select ${field.label}</option>
                        ${optionsHTML}
                    </select>
                `;
            } else if (field.type === 'checkbox') {
                const checked = value === true || String(value) === 'true' || String(value) === '1' ? 'checked' : '';
                fieldDiv.innerHTML = `
                    <label class="inline-flex items-center space-x-2">
                        <input type="checkbox" name="${field.name}" class="form-checkbox h-4 w-4 text-blue-600" ${checked} ${readonlyAttr}>
                        <span class="text-sm font-medium text-gray-700">${field.label}</span>
                    </label>
                `;
            } else {
                // escape value for attribute
                const safeVal = String(value).replace(/"/g, '&quot;');
                fieldDiv.innerHTML = `
                    <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                    <input type="${field.type}" name="${field.name}" value="${safeVal}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${requiredAttr} ${readonlyAttr}>
                `;
            }

            formFields.appendChild(fieldDiv);
        });

        // Store editing item id
        window.editingItemId = id;

        // Show modal
        const addModalEl = document.getElementById('add-modal');
        if (addModalEl) {
            addModalEl.classList.remove('hidden');
            addModalEl.classList.add('flex');
        }
    })();
}

// Delete item
function deleteItem(id) {
    console.log('deleteItem called with id=', id);
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
async function confirmDelete() {
    console.log('confirmDelete starting for id=', deleteItemId, 'section=', currentSection);
    if (!deleteItemId) {
        console.warn('confirmDelete called but deleteItemId is empty');
        closeDeleteModal();
        return;
    }

    const section = currentSection;
    const config = sectionData[section];

    // If the section has an API endpoint, attempt server-side delete
    if (config && config.apiEndpoint) {
        // Construct delete URL: apiEndpoint + id + '/'
        const base = config.apiEndpoint;
        const deleteUrl = base.endsWith('/') ? `${base}${deleteItemId}/` : `${base}/${deleteItemId}/`;

        try {
            console.log('sending DELETE to', deleteUrl);
            const token = (typeof csrftoken !== 'undefined') ? csrftoken : (window.csrftoken || '');
            const resp = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': token,
                    'Accept': 'application/json'
                }
            });

            console.log('delete response status', resp.status);

            if (!resp.ok) {
                let msg = 'Failed to delete item.';
                try {
                    const j = await resp.json();
                    msg = j.error || j.message || msg;
                } catch (e) {}
                showToast(msg, 'error');
                closeDeleteModal();
                return;
            }

            // On success, remove from local data and re-render
            const index = sectionData[section].data.findIndex(item => item.id === deleteItemId);
            if (index > -1) sectionData[section].data.splice(index, 1);
            renderTable();
            showToast('Deleted successfully!', 'success');
        } catch (err) {
            console.error('Delete error', err);
            showToast('Failed to delete', 'error');
        }
    } else {
        // Fallback: local-only delete
        const index = sectionData[section].data.findIndex(item => item.id === deleteItemId);
        if (index > -1) {
            sectionData[section].data.splice(index, 1);
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
    let visibleCount = 0;
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm);
        row.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
    });

    // Update item count to show filtered results
    const itemCountEl = document.getElementById('item-count');
    if (itemCountEl) {
        if (searchTerm) {
            itemCountEl.textContent = `${visibleCount} (filtered from ${rows.length})`;
        } else {
            itemCountEl.textContent = rows.length;
        }
    }

    // Clear "select all" checkbox if some rows are hidden
    const selectAll = document.getElementById('select-all');
    if (selectAll && searchTerm) {
        selectAll.checked = false;
    }
});

// Update selected count on checkbox change
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('item-checkbox')) {
        updateCounts();
    }
});
