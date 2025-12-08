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
            { name: 'programs', label: 'Allowed Programs', type: 'multiselect', options: [], required: false },
            { name: 'adviser', label: 'Adviser', type: 'select', options: [], required: false }
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

// Fetch staff users for adviser selection
async function fetchStaffUsers() {
    try {
        const response = await fetch('/admin-panel/api/users/');
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const result = await response.json();
        // Filter staff users and return as options
        return result.data
            .filter(user => user.role === 'Staff' || user.role === 'Admin')
            .map(user => ({
                value: user.id,
                label: user.email
            }));
    } catch (error) {
        console.error('Error fetching staff users:', error);
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
                // Make first column clickable for certain sections
                if (currentSection === 'users' && value) {
                    html += `<td class="px-6 py-4 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer user-clickable" data-user-id="${item.id}">${value}</td>`;
                } else if (currentSection === 'event-rsvps' && value) {
                    html += `<td class="px-6 py-4 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer rsvp-clickable" data-rsvp-id="${item.id}">${value}</td>`;
                } else if (currentSection === 'organization-events' && value) {
                    html += `<td class="px-6 py-4 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer event-clickable" data-event-id="${item.id}">${value}</td>`;
                } else if (currentSection === 'organization-members' && value) {
                    html += `<td class="px-6 py-4 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer org-member-clickable" data-member-id="${item.id}">${value}</td>`;
                } else if (currentSection === 'organizations' && value) {
                    html += `<td class="px-6 py-4 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer org-clickable" data-org-id="${item.id}">${value}</td>`;
                } else {
                    html += `<td class="px-6 py-4 text-sm ${value ? 'text-blue-600 hover:text-blue-800 font-medium cursor-pointer' : 'text-gray-700'}">${value}</td>`;
                }
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
        
        // Add click event listener for detail modals
        if (currentSection === 'users') {
            const userClickable = row.querySelector('.user-clickable');
            if (userClickable) {
                userClickable.addEventListener('click', function() {
                    const userId = this.getAttribute('data-user-id');
                    openUserDetailsModal(userId);
                });
            }
        } else if (currentSection === 'event-rsvps') {
            const rsvpClickable = row.querySelector('.rsvp-clickable');
            if (rsvpClickable) {
                rsvpClickable.addEventListener('click', function() {
                    const rsvpId = this.getAttribute('data-rsvp-id');
                    openRsvpDetailsModal(rsvpId);
                });
            }
        } else if (currentSection === 'organization-events') {
            const eventClickable = row.querySelector('.event-clickable');
            if (eventClickable) {
                eventClickable.addEventListener('click', function() {
                    const eventId = this.getAttribute('data-event-id');
                    openEventDetailsModal(eventId);
                });
            }
        } else if (currentSection === 'organization-members') {
            const memberClickable = row.querySelector('.org-member-clickable');
            if (memberClickable) {
                memberClickable.addEventListener('click', function() {
                    const memberId = this.getAttribute('data-member-id');
                    openOrgMemberDetailsModal(memberId);
                });
            }
        } else if (currentSection === 'organizations') {
            const orgClickable = row.querySelector('.org-clickable');
            if (orgClickable) {
                orgClickable.addEventListener('click', function() {
                    const orgId = this.getAttribute('data-org-id');
                    openOrgDetailsModal(orgId);
                });
            }
        }
        
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
    } else if (currentSection === 'organizations') {
        const programs = await fetchPrograms();
        const staffUsers = await fetchStaffUsers();
        const programsField = (data.formFields || []).find(f => f.name === 'programs');
        const adviserField = (data.formFields || []).find(f => f.name === 'adviser');
        if (programsField) {
            programsField.options = programs;
        }
        if (adviserField) {
            adviserField.options = [{ value: '', label: '-- Select Adviser --' }, ...staffUsers];
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
        } else if (field.type === 'multiselect') {
            // Multi-select for programs
            const optionsHTML = (field.options || []).map(opt => {
                if (typeof opt === 'object' && opt.value && opt.label) {
                    return `<option value="${opt.value}">${opt.label}</option>`;
                } else {
                    return `<option value="${opt}">${opt}</option>`;
                }
            }).join('');
            
            fieldDiv.innerHTML = `
                <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                <select name="${field.name}" multiple class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${requiredAttr} ${readonlyAttr} size="5">
                    ${optionsHTML}
                </select>
                <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
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
        } else if (f.type === 'multiselect') {
            // Handle multiselect - get all selected values
            const selectEl = event.target.querySelector(`[name="${f.name}"]`);
            if (selectEl) {
                const selectedValues = Array.from(selectEl.selectedOptions).map(opt => opt.value);
                itemData[f.name] = selectedValues.join(','); // Send as comma-separated string
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
        } else if (currentSection === 'organizations') {
            const programs = await fetchPrograms();
            const staffUsers = await fetchStaffUsers();
            const programsField = (data.formFields || []).find(f => f.name === 'programs');
            const adviserField = (data.formFields || []).find(f => f.name === 'adviser');
            if (programsField) {
                programsField.options = programs;
            }
            if (adviserField) {
                adviserField.options = [{ value: '', label: '-- Select Adviser --' }, ...staffUsers];
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
            } else if (field.type === 'multiselect') {
                // Multi-select with current values selected
                const selectedValues = value ? String(value).split(',').map(v => v.trim()) : [];
                const optionsHTML = (field.options || []).map(opt => {
                    let optValue = '';
                    let optLabel = '';
                    if (typeof opt === 'object' && opt.value && opt.label) {
                        optValue = opt.value;
                        optLabel = opt.label;
                    } else {
                        optValue = opt;
                        optLabel = opt;
                    }
                    const isSelected = selectedValues.includes(String(optValue));
                    return `<option value="${optValue}" ${isSelected ? 'selected' : ''}>${optLabel}</option>`;
                }).join('');
                
                fieldDiv.innerHTML = `
                    <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
                    <select name="${field.name}" multiple class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${requiredAttr} ${readonlyAttr} size="5">
                        ${optionsHTML}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
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

// User Details Modal Functions
async function openUserDetailsModal(userId) {
    const modal = document.getElementById('user-details-modal');
    const content = document.getElementById('user-details-content');
    
    if (!modal || !content) return;
    
    // Show loading state
    content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i><p class="mt-4 text-gray-600">Loading user details...</p></div>';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    try {
        const response = await fetch(`/admin-panel/api/users/${userId}/details/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }
        
        const user = await response.json();
        
        // Render user details using the template
        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Profile Picture Section -->
                <div class="md:col-span-1 flex flex-col items-center">
                    <div class="w-48 h-48 rounded-full overflow-hidden bg-gray-200 border-4 border-gray-300 shadow-lg">
                        ${user.profilePicture 
                            ? `<img src="${user.profilePicture}" alt="${user.firstName} ${user.lastName}" class="w-full h-full object-cover">`
                            : `<div class="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                                <i class="fas fa-user"></i>
                               </div>`
                        }
                    </div>
                    <div class="mt-4 text-center">
                        <h4 class="text-xl font-bold text-gray-800">${user.firstName} ${user.lastName}</h4>
                        <p class="text-sm text-gray-500 mt-1">${user.role}</p>
                        <span class="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${user.status}
                        </span>
                    </div>
                </div>
                
                <!-- User Details Section -->
                <div class="md:col-span-2">
                    <h4 class="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                        <i class="fas fa-info-circle text-blue-600 mr-2"></i>Personal Information
                    </h4>
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-medium text-gray-500 uppercase">Student ID</label>
                                <p class="text-sm text-gray-800 font-medium mt-1">${user.studentId}</p>
                            </div>
                            <div>
                                <label class="text-xs font-medium text-gray-500 uppercase">Username</label>
                                <p class="text-sm text-gray-800 font-medium mt-1">${user.username}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-medium text-gray-500 uppercase">First Name</label>
                                <p class="text-sm text-gray-800 font-medium mt-1">${user.firstName}</p>
                            </div>
                            <div>
                                <label class="text-xs font-medium text-gray-500 uppercase">Last Name</label>
                                <p class="text-sm text-gray-800 font-medium mt-1">${user.lastName}</p>
                            </div>
                        </div>
                        
                        <div>
                            <label class="text-xs font-medium text-gray-500 uppercase">Email Address</label>
                            <p class="text-sm text-gray-800 font-medium mt-1">
                                <i class="fas fa-envelope text-gray-400 mr-2"></i>${user.email}
                            </p>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-medium text-gray-500 uppercase">Program</label>
                                <p class="text-sm text-gray-800 font-medium mt-1" title="${user.courseName}">${user.courseAbbreviation}</p>
                                ${user.courseName !== user.courseAbbreviation && user.courseName !== 'N/A' ? `<p class="text-xs text-gray-500 mt-0.5">${user.courseName}</p>` : ''}
                            </div>
                            <div>
                                <label class="text-xs font-medium text-gray-500 uppercase">Year Level</label>
                                <p class="text-sm text-gray-800 font-medium mt-1">${user.yearLevel}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-medium text-gray-500 uppercase">Role</label>
                                <p class="text-sm text-gray-800 font-medium mt-1">
                                    <i class="fas ${user.role === 'Admin' ? 'fa-shield-alt text-red-500' : user.role === 'Staff' ? 'fa-user-tie text-blue-500' : 'fa-user text-gray-500'} mr-2"></i>${user.role}
                                </p>
                            </div>
                            <div>
                                <label class="text-xs font-medium text-gray-500 uppercase">Account Status</label>
                                <p class="text-sm text-gray-800 font-medium mt-1">${user.status}</p>
                            </div>
                        </div>
                    </div>
                    
                    <h4 class="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 mt-6">
                        <i class="fas fa-clock text-blue-600 mr-2"></i>Account Activity
                    </h4>
                    <div class="space-y-4">
                        <div>
                            <label class="text-xs font-medium text-gray-500 uppercase">Date Joined</label>
                            <p class="text-sm text-gray-800 font-medium mt-1">
                                <i class="fas fa-calendar-plus text-gray-400 mr-2"></i>${user.dateJoined}
                            </p>
                        </div>
                        <div>
                            <label class="text-xs font-medium text-gray-500 uppercase">Last Login</label>
                            <p class="text-sm text-gray-800 font-medium mt-1">
                                <i class="fas fa-sign-in-alt text-gray-400 mr-2"></i>${user.lastLogin}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching user details:', error);
        content.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-3xl text-red-600"></i>
                <p class="mt-4 text-gray-600">Failed to load user details. Please try again.</p>
            </div>
        `;
    }
}

function closeUserDetailsModal() {
    const modal = document.getElementById('user-details-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// RSVP Details Modal Functions
async function openRsvpDetailsModal(rsvpId) {
    const modal = document.getElementById('rsvp-details-modal');
    const content = document.getElementById('rsvp-details-content');

    if (!modal || !content) return;

    content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i><p class="mt-4 text-gray-600">Loading RSVP details...</p></div>';
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    try {
        const response = await fetch(`/admin-panel/api/rsvps/${rsvpId}/details/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch RSVP details');
        }

        const data = await response.json();
        const user = data.user || {};
        const event = data.event || {};

        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- RSVP / Event Badge Column -->
                <div class="md:col-span-1 space-y-4">
                    <div class="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
                        <div class="flex items-center justify-between">
                            <div class="text-sm font-semibold text-blue-900">RSVP Status</div>
                            <span class="px-3 py-1 rounded-full text-xs font-semibold ${data.rsvpStatus === 'Going' ? 'bg-green-100 text-green-800' : data.rsvpStatus === 'Interested' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}">${data.rsvpStatus}</span>
                        </div>
                        <p class="mt-2 text-xs text-blue-800"><i class="fas fa-calendar-plus mr-2"></i>${data.rsvpDate || 'N/A'}</p>
                    </div>

                    <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm text-center">
                        <div class="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200 border-4 border-gray-300 shadow">
                            ${user.profilePicture ? `<img src="${user.profilePicture}" alt="${user.firstName || ''} ${user.lastName || ''}" class="w-full h-full object-cover">` : `<div class=\"w-full h-full flex items-center justify-center text-gray-400 text-5xl\"><i class=\"fas fa-user\"></i></div>`}
                        </div>
                        <div class="mt-3">
                            <h4 class="text-lg font-bold text-gray-800">${user.firstName || 'N/A'} ${user.lastName || ''}</h4>
                            <p class="text-sm text-gray-500">${user.username || ''}</p>
                            <p class="text-xs text-gray-500 mt-1">${user.email || ''}</p>
                        </div>
                    </div>
                </div>

                <!-- Details Column -->
                <div class="md:col-span-2 space-y-8">
                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <i class="fas fa-calendar-alt text-blue-600"></i>
                            Event Information
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Event</p>
                                <p class="text-sm font-semibold text-gray-900 mt-1">${event.title || 'N/A'}</p>
                                <p class="text-xs text-gray-500 mt-1">${event.organization || 'N/A'}</p>
                            </div>
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Date & Time</p>
                                <p class="text-sm font-semibold text-gray-900 mt-1">${event.date || 'N/A'}</p>
                                <p class="text-xs text-gray-500 mt-1">${event.location || 'TBA'}</p>
                            </div>
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Activity Type</p>
                                <p class="text-sm font-semibold text-gray-900 mt-1">${event.activityType || 'N/A'}</p>
                            </div>
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Event Status</p>
                                <p class="text-sm font-semibold text-gray-900 mt-1">${event.status || 'N/A'}</p>
                            </div>
                        </div>
                        ${event.description ? `<div class="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"><p class="text-xs text-gray-500">Description</p><p class="text-sm text-gray-800 mt-1">${event.description}</p></div>` : ''}
                    </div>

                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <i class="fas fa-user-graduate text-blue-600"></i>
                            Student Information
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Student ID</p>
                                <p class="text-sm font-semibold text-gray-900 mt-1">${user.studentId || 'N/A'}</p>
                            </div>
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Program</p>
                                <p class="text-sm font-semibold text-gray-900 mt-1" title="${user.courseName || ''}">${user.courseAbbreviation || 'N/A'}</p>
                                ${(user.courseName && user.courseName !== user.courseAbbreviation) ? `<p class="text-xs text-gray-500 mt-1">${user.courseName}</p>` : ''}
                            </div>
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Year Level</p>
                                <p class="text-sm font-semibold text-gray-900 mt-1">${user.yearLevel ?? 'N/A'}</p>
                            </div>
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Email</p>
                                <p class="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-2"><i class="fas fa-envelope text-gray-400"></i>${user.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching RSVP details:', error);
        content.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-3xl text-red-600"></i>
                <p class="mt-4 text-gray-600">Failed to load RSVP details. Please try again.</p>
            </div>
        `;
    }
}

function closeRsvpDetailsModal() {
    const modal = document.getElementById('rsvp-details-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Organization Event Details Modal Functions
async function openEventDetailsModal(eventId) {
    const modal = document.getElementById('event-details-modal');
    const content = document.getElementById('event-details-content');

    if (!modal || !content) return;

    content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i><p class="mt-4 text-gray-600">Loading event details...</p></div>';
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    try {
        const response = await fetch(`/admin-panel/api/events/${eventId}/details/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch event details');
        }

        const event = await response.json();

        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-1 space-y-4">
                    <div class="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
                        <div class="text-xs text-blue-900 uppercase font-semibold">Event Status</div>
                        <div class="mt-2 flex items-center justify-between">
                            <span class="text-base font-bold text-blue-900">${event.status || 'N/A'}</span>
                            ${event.cancelled ? '<span class="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">Cancelled</span>' : ''}
                        </div>
                        <p class="mt-2 text-xs text-blue-800"><i class="fas fa-calendar-day mr-2"></i>${event.date || 'N/A'}</p>
                        <p class="mt-1 text-xs text-blue-800"><i class="fas fa-map-marker-alt mr-2"></i>${event.location || 'TBA'}</p>
                    </div>

                    <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                        <div class="text-xs text-gray-500 uppercase">RSVPs</div>
                        <div class="mt-2 grid grid-cols-3 gap-2 text-center">
                            <div class="p-2 rounded-lg bg-green-50 text-green-800 text-xs font-semibold">Going<br>${event.rsvps?.going ?? 0}</div>
                            <div class="p-2 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold">Interested<br>${event.rsvps?.interested ?? 0}</div>
                            <div class="p-2 rounded-lg bg-red-50 text-red-800 text-xs font-semibold">Not Going<br>${event.rsvps?.not_going ?? 0}</div>
                        </div>
                    </div>

                    <div class="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div class="text-xs text-gray-500 uppercase">Created By</div>
                        <p class="text-sm font-semibold text-gray-900 mt-1">${event.createdBy || 'N/A'}</p>
                        <p class="text-xs text-gray-500 mt-1">${event.createdAt || 'N/A'}</p>
                    </div>
                </div>

                <div class="md:col-span-2 space-y-6">
                    <div class="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div class="flex items-center justify-between gap-2">
                            <div>
                                <p class="text-xs text-gray-500 uppercase">Event</p>
                                <h3 class="text-xl font-bold text-gray-900 mt-1">${event.title || 'N/A'}</h3>
                                <p class="text-sm text-gray-600 mt-1">${event.organization || 'N/A'} · ${event.activityType || 'N/A'}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">${event.status || 'N/A'}</span>
                        </div>
                        ${event.description ? `<div class="mt-4 text-sm text-gray-800 leading-relaxed">${event.description}</div>` : ''}
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <p class="text-xs text-gray-500 uppercase">Date & Time</p>
                            <p class="text-sm font-semibold text-gray-900 mt-1">${event.date || 'N/A'}</p>
                        </div>
                        <div class="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <p class="text-xs text-gray-500 uppercase">Location</p>
                            <p class="text-sm font-semibold text-gray-900 mt-1">${event.location || 'TBA'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching event details:', error);
        content.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-3xl text-red-600"></i>
                <p class="mt-4 text-gray-600">Failed to load event details. Please try again.</p>
            </div>
        `;
    }
}

function closeEventDetailsModal() {
    const modal = document.getElementById('event-details-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Organization Member Details Modal Functions
async function openOrgMemberDetailsModal(memberId) {
    const modal = document.getElementById('org-member-details-modal');
    const content = document.getElementById('org-member-details-content');

    if (!modal || !content) return;

    content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i><p class="mt-4 text-gray-600">Loading member details...</p></div>';
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    try {
        const response = await fetch(`/admin-panel/api/organization-members/${memberId}/details/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch organization member details');
        }

        const data = await response.json();
        const user = data.user || {};
        const org = data.organization || {};

        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-1 space-y-4">
                    <div class="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
                        <div class="text-xs text-blue-900 uppercase font-semibold">Member Status</div>
                        <div class="mt-2 flex items-center justify-between">
                            <span class="text-base font-bold text-blue-900">${data.status || 'N/A'}</span>
                            <span class="px-3 py-1 rounded-full text-xs font-semibold ${data.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">${data.status || 'N/A'}</span>
                        </div>
                        <p class="mt-2 text-xs text-blue-800"><i class="fas fa-calendar-day mr-2"></i>${data.dateJoined || 'N/A'}</p>
                        <p class="mt-1 text-xs text-blue-800"><i class="fas fa-user-tag mr-2"></i>${data.role || 'N/A'}</p>
                    </div>

                    <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm text-center">
                        <div class="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-200 border-4 border-gray-300 shadow">
                            ${user.profilePicture ? `<img src="${user.profilePicture}" alt="${user.firstName || ''} ${user.lastName || ''}" class="w-full h-full object-cover">` : `<div class=\"w-full h-full flex items-center justify-center text-gray-400 text-5xl\"><i class=\"fas fa-user\"></i></div>`}
                        </div>
                        <div class="mt-3">
                            <h4 class="text-lg font-bold text-gray-800">${user.firstName || 'N/A'} ${user.lastName || ''}</h4>
                            <p class="text-sm text-gray-500">${user.username || ''}</p>
                            <p class="text-xs text-gray-500 mt-1">${user.email || ''}</p>
                        </div>
                    </div>
                </div>

                <div class="md:col-span-2 space-y-8">
                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <i class="fas fa-building text-blue-600"></i>
                            Organization Information
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Organization</p>
                                <p class="text-sm font-semibold text-gray-900 mt-1">${org.name || 'N/A'}</p>
                                <p class="text-xs text-gray-500 mt-1">${org.isPublic ? 'Public' : 'Private'}</p>
                            </div>
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Description</p>
                                <p class="text-sm text-gray-800 mt-1">${org.description || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <i class="fas fa-user-graduate text-blue-600"></i>
                            Member Information
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Student ID</p>
                                <p class="text-sm font-semibold text-gray-900 mt-1">${user.studentId || 'N/A'}</p>
                            </div>
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Program</p>
                                <p class="text-sm font-semibold text-gray-900 mt-1" title="${user.courseName || ''}">${user.courseAbbreviation || 'N/A'}</p>
                                ${(user.courseName && user.courseName !== user.courseAbbreviation) ? `<p class="text-xs text-gray-500 mt-1">${user.courseName}</p>` : ''}
                            </div>
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Year Level</p>
                                <p class="text-sm font-semibold text-gray-900 mt-1">${user.yearLevel ?? 'N/A'}</p>
                            </div>
                            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p class="text-xs text-gray-500">Role</p>
                                <p class="text-sm font-semibold text-gray-900 mt-1">${data.role || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching organization member details:', error);
        content.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-3xl text-red-600"></i>
                <p class="mt-4 text-gray-600">Failed to load member details. Please try again.</p>
            </div>
        `;
    }
}

function closeOrgMemberDetailsModal() {
    const modal = document.getElementById('org-member-details-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Organization Details Modal Functions
async function openOrgDetailsModal(orgId) {
    const modal = document.getElementById('org-details-modal');
    const content = document.getElementById('org-details-content');

    if (!modal || !content) return;

    content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i><p class="mt-4 text-gray-600">Loading organization details...</p></div>';
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    try {
        const response = await fetch(`/admin-panel/api/organizations/${orgId}/details/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch organization details');
        }

        const org = await response.json();

        // Build member counts display
        const memberCountsHTML = `
            <div class="grid grid-cols-4 gap-2 mt-3">
                <div class="p-2 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold text-center">
                    Leaders<br>${org.memberCounts?.leader ?? 0}
                </div>
                <div class="p-2 rounded-lg bg-purple-50 text-purple-800 text-xs font-semibold text-center">
                    Officers<br>${org.memberCounts?.officer ?? 0}
                </div>
                <div class="p-2 rounded-lg bg-green-50 text-green-800 text-xs font-semibold text-center">
                    Members<br>${org.memberCounts?.member ?? 0}
                </div>
                <div class="p-2 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold text-center">
                    Advisers<br>${org.memberCounts?.adviser ?? 0}
                </div>
            </div>
        `;

        // Build adviser section
        const adviserHTML = org.adviser ? `
            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p class="text-xs text-gray-500 uppercase">Adviser</p>
                <p class="text-sm font-semibold text-gray-900 mt-1">${org.adviser.name}</p>
                <p class="text-xs text-gray-600 mt-1"><i class="fas fa-envelope text-gray-400 mr-2"></i>${org.adviser.email}</p>
            </div>
        ` : '';

        // Build programs section
        const programsHTML = org.programs && org.programs.length > 0 ? `
            <div class="mt-4">
                <h4 class="text-sm font-bold text-gray-800 mb-2">Allowed Programs</h4>
                <div class="flex flex-wrap gap-2">
                    ${org.programs.map(prog => `<span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${prog}</span>`).join('')}
                </div>
            </div>
        ` : '';

        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-1 space-y-4">
                    <div class="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
                        <div class="text-xs text-blue-900 uppercase font-semibold">Organization Status</div>
                        <p class="text-base font-bold text-blue-900 mt-2">${org.type || 'N/A'}</p>
                        <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${org.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                            ${org.isPublic ? 'Public' : 'Private'}
                        </span>
                        <p class="text-xs text-blue-800 mt-2"><i class="fas fa-calendar-day mr-2"></i>${org.dateCreated || 'N/A'}</p>
                    </div>

                    <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                        <div class="text-xs text-gray-500 uppercase font-semibold">Total Members</div>
                        <p class="text-3xl font-bold text-gray-900 mt-2">${org.totalMembers || 0}</p>
                        ${memberCountsHTML}
                    </div>

                    ${adviserHTML}
                </div>

                <div class="md:col-span-2 space-y-6">
                    <div class="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div>
                            <p class="text-xs text-gray-500 uppercase">Organization</p>
                            <h3 class="text-2xl font-bold text-gray-900 mt-1">${org.name || 'N/A'}</h3>
                            <p class="text-sm text-gray-600 mt-1">${org.type || 'N/A'}</p>
                        </div>
                        <div class="mt-4">
                            <p class="text-xs text-gray-500 uppercase">Description</p>
                            <p class="text-sm text-gray-800 mt-1">${org.description || 'No description provided'}</p>
                        </div>
                        ${programsHTML}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching organization details:', error);
        content.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-3xl text-red-600"></i>
                <p class="mt-4 text-gray-600">Failed to load organization details. Please try again.</p>
            </div>
        `;
    }
}

function closeOrgDetailsModal() {
    const modal = document.getElementById('org-details-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}
