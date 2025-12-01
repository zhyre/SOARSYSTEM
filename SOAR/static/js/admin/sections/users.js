// Section data for users
const sectionData = {
    users: {
        title: 'Select user to change',
        addButton: 'ADD USER',
        columns: ['USER ID', 'USERNAME', 'EMAIL', 'REGISTRATION DATE', 'PROGRAM', 'ACCOUNT STATUS'],
        formFields: [
            { name: 'username', label: 'Username', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'firstName', label: 'First Name', type: 'text', required: true },
            { name: 'lastName', label: 'Last Name', type: 'text', required: true },
            { name: 'password', label: 'Password', type: 'password', required: true }
        ],
        data: [] // Will be loaded dynamically
    }
};


// Load users section specific logic
function loadUsersSection() {
    // Update page title and breadcrumb
    const sectionNames = {
        'users': 'Accounts › Users'
    };
    document.getElementById('breadcrumb').textContent = sectionNames[currentSection];
    document.getElementById('section-title').textContent = sectionData[currentSection].title;
    document.getElementById('add-button-text').textContent = sectionData[currentSection].addButton;

    // Update table headers
    document.getElementById('col1-header').textContent = sectionData[currentSection].columns[0];
    document.getElementById('col2-header').textContent = sectionData[currentSection].columns[1];
    document.getElementById('col3-header').textContent = sectionData[currentSection].columns[2];
    document.getElementById('col4-header').textContent = sectionData[currentSection].columns[3];
    document.getElementById('col5-header').textContent = sectionData[currentSection].columns[4];
    // Show actions column for users
    document.getElementById('col6-header').style.display = 'table-cell';
    document.getElementById('col6-header').textContent = sectionData[currentSection].columns[5];

    // Fetch data
    fetchUsersData();
}

// Fetch users data from API
function fetchUsersData(search = '', status = '', program = '', page = 1) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading users...</td></tr>';

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (program) params.append('program', program);
    if (page > 1) params.append('page', page);

    fetch(`/admin-panel/users/?${params}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-red-500"><i class="fas fa-exclamation-triangle mr-2"></i>${data.error}</td></tr>`;
            return;
        }

        // Update sectionData with fetched data
        sectionData.users.data = data.users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            date_joined: user.date_joined,
            course: user.course,
            is_active: user.is_active
        }));

        // Update programs for filter
        if (data.programs) {
            const programFilter = document.getElementById('users-program-filter');
            programFilter.innerHTML = '<option value="">All Programs</option>';
            data.programs.forEach(program => {
                const option = document.createElement('option');
                option.value = program;
                option.textContent = program;
                programFilter.appendChild(option);
            });
        }

        // Render the table
        renderUsersTable(data.users);

        // Update pagination info
        document.getElementById('total-count').textContent = data.total_count;
        document.getElementById('item-count').textContent = data.total_count;

        // Render pagination
        renderUsersPagination(data);
    })
    .catch(error => {
        console.error('Error fetching users:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-red-500"><i class="fas fa-exclamation-triangle mr-2"></i>Failed to load users. Please try again.</td></tr>';
    });
}

// Render users table with specific columns
function renderUsersTable(users) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500"><i class="fas fa-users mr-2"></i>No users found</td></tr>';
        return;
    }

    users.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';

        const statusBadge = user.is_active
            ? '<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"><i class="fas fa-check-circle mr-1"></i>Active</span>'
            : '<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"><i class="fas fa-times-circle mr-1"></i>Inactive</span>';

        row.innerHTML = `
            <td class="px-6 py-4">
                <input type="checkbox" class="item-checkbox rounded border-gray-300" data-id="${user.id}">
            </td>
            <td class="px-6 py-4 text-sm font-mono text-gray-900">${user.id}</td>
            <td class="px-6 py-4 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer">${user.username}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${user.email}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${user.date_joined}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${user.course}</td>
            <td class="px-6 py-4">${statusBadge}</td>
            <td class="px-6 py-4">
                <button onclick="editUser('${user.id}')" class="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteUser('${user.id}')" class="text-red-600 hover:text-red-800 font-medium text-sm">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    updateCounts();
}

// Apply users filters
function applyUsersFilters() {
    const search = document.getElementById('users-search-input').value;
    const status = document.getElementById('users-status-filter').value;
    const program = document.getElementById('users-program-filter').value;
    fetchUsersData(search, status, program, 1);
}

// Clear users filters
function clearUsersFilters() {
    document.getElementById('users-search-input').value = '';
    document.getElementById('users-status-filter').value = '';
    document.getElementById('users-program-filter').value = '';
    fetchUsersData();
}

// Edit user (placeholder function)
function editUser(userId) {
    alert(`Edit user functionality for user ID: ${userId}\n\nThis would open an edit modal with user details.`);
    // TODO: Implement edit user modal and API call
}

// Delete user (placeholder function)
function deleteUser(userId) {
    if (confirm(`Are you sure you want to delete user with ID: ${userId}?\n\nThis action cannot be undone.`)) {
        alert(`Delete user functionality for user ID: ${userId}\n\nThis would send a DELETE request to the API.`);
        // TODO: Implement delete user API call
    }
}

// Render users pagination
function renderUsersPagination(data) {
    const paginationContainer = document.getElementById('users-pagination');
    paginationContainer.innerHTML = '';

    if (data.total_pages <= 1) {
        return;
    }

    const search = document.getElementById('users-search-input').value;
    const status = document.getElementById('users-status-filter').value;
    const program = document.getElementById('users-program-filter').value;

    // Previous button
    if (data.has_previous) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left mr-1"></i>Previous';
        prevBtn.onclick = () => fetchUsersData(search, status, program, data.current_page - 1);
        paginationContainer.appendChild(prevBtn);
    }

    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.className = 'px-3 py-2 text-sm text-gray-700';
    pageInfo.textContent = `Page ${data.current_page} of ${data.total_pages}`;
    paginationContainer.appendChild(pageInfo);

    // Next button
    if (data.has_next) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors';
        nextBtn.innerHTML = 'Next<i class="fas fa-chevron-right ml-1"></i>';
        nextBtn.onclick = () => fetchUsersData(search, status, program, data.current_page + 1);
        paginationContainer.appendChild(nextBtn);
    }
}

// Call loadUsersSection when script loads
loadUsersSection();