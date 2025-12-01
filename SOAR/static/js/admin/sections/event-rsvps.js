// Section data for event-rsvps
const sectionData = {
    'event-rsvps': {
        title: 'Select event RSVP to change',
        addButton: 'ADD EVENT RSVP',
        columns: ['EVENT NAME', 'ORGANIZATION', 'STUDENT', 'STATUS', 'RSVP DATE', 'ACTIONS'],
        formFields: [
            { name: 'eventName', label: 'Event Name', type: 'text', required: true },
            { name: 'student', label: 'Student', type: 'text', required: true },
            { name: 'status', label: 'Status', type: 'select', options: ['going', 'not_going', 'interested'], required: true },
            { name: 'rsvpDate', label: 'RSVP Date', type: 'date', required: true }
        ],
        data: [] // Will be loaded dynamically
    }
};

const contentHTML = `
<div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Action Bar -->
    <div class="border-b border-gray-200 p-6">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800" id="section-title">Select event RSVP to change</h2>
            <div class="flex items-center space-x-3">
                <button onclick="openAddModal()" id="add-button" class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center space-x-2">
                    <i class="fas fa-plus"></i>
                    <span id="add-button-text">ADD EVENT RSVP</span>
                </button>
            </div>
        </div>

        <!-- Event RSVPs Search and Filters -->
        <div id="event-rsvps-filters" class="mt-4">
            <div class="flex flex-wrap gap-4 items-end">
                <!-- Search -->
                <div class="flex-1 min-w-64">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Search RSVPs</label>
                    <div class="relative">
                        <input type="text" id="event-rsvps-search-input" placeholder="Search by event name, student, email..."
                               class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>

                <!-- Status Filter -->
                <div class="min-w-32">
                    <label class="block text-sm font-medium text-gray-700 mb-2">RSVP Status</label>
                    <select id="event-rsvps-status-filter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">All Status</option>
                        <option value="going">Going</option>
                        <option value="not_going">Not Going</option>
                        <option value="interested">Interested</option>
                    </select>
                </div>

                <!-- Buttons -->
                <div class="flex gap-2">
                    <button onclick="applyEventRsvpsFilters()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        <i class="fas fa-search mr-2"></i>Search
                    </button>
                    <button onclick="clearEventRsvpsFilters()" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
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
                            <span id="col1-header">EVENT NAME</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                        <div class="flex items-center space-x-1">
                            <span id="col2-header">ORGANIZATION</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                        <div class="flex items-center space-x-1">
                            <span id="col3-header">STUDENT</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                        <div class="flex items-center space-x-1">
                            <span id="col4-header">STATUS</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                        <div class="flex items-center space-x-1">
                            <span id="col5-header">RSVP DATE</span>
                            <i class="fas fa-sort text-gray-400"></i>
                        </div>
                    </th>
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
            <div id="event-rsvps-pagination" class="flex space-x-2">
                <!-- Pagination will be inserted here -->
            </div>
        </div>
    </div>
</div>
`;

// Load section specific logic
function loadSectionLogic() {
    // Set content
    document.getElementById('main-content').innerHTML = contentHTML;

    // Update page title and breadcrumb
    const sectionNames = {
        'event-rsvps': 'Event › Event RSVPs'
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
    document.getElementById('col6-header').textContent = sectionData[currentSection].columns[5];
    // Show all columns for event-rsvps
    document.getElementById('col6-header').style.display = 'table-cell';

    // Fetch data
    fetchEventRsvpsData();
}

// Fetch event RSVPs data from API
function fetchEventRsvpsData(search = '', status = '', page = 1) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading event RSVPs...</td></tr>';

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (page > 1) params.append('page', page);

    fetch(`/admin-panel/event-rsvps/?${params}`, {
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
        sectionData['event-rsvps'].data = data.rsvps.map(rsvp => ({
            id: rsvp.id,
            eventName: rsvp.event_name,
            organization: rsvp.organization,
            student: rsvp.student,
            status: rsvp.status,
            statusDisplay: rsvp.status_display,
            rsvpDate: rsvp.rsvp_date
        }));

        // Update statuses for filter
        if (data.statuses) {
            const statusFilter = document.getElementById('event-rsvps-status-filter');
            statusFilter.innerHTML = '<option value="">All Status</option>';
            data.statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
                statusFilter.appendChild(option);
            });
        }

        // Render the table
        renderEventRsvpsTable(data.rsvps);

        // Update pagination info
        document.getElementById('total-count').textContent = data.total_count;
        document.getElementById('item-count').textContent = data.total_count;

        // Render pagination
        renderEventRsvpsPagination(data);
    })
    .catch(error => {
        console.error('Error fetching event RSVPs:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-red-500"><i class="fas fa-exclamation-triangle mr-2"></i>Failed to load event RSVPs. Please try again.</td></tr>';
    });
}

// Render event RSVPs table
function renderEventRsvpsTable(rsvps) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    if (rsvps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500"><i class="fas fa-calendar-check mr-2"></i>No event RSVPs found</td></tr>';
        return;
    }

    rsvps.forEach(rsvp => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';

        const statusBadge = rsvp.status === 'going'
            ? `<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"><i class="fas fa-check-circle mr-1"></i>${rsvp.statusDisplay || 'Going'}</span>`
            : rsvp.status === 'not_going'
            ? `<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"><i class="fas fa-times-circle mr-1"></i>${rsvp.statusDisplay || 'Not Going'}</span>`
            : `<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800"><i class="fas fa-question-circle mr-1"></i>${rsvp.statusDisplay || 'Interested'}</span>`;

        row.innerHTML = `
            <td class="px-6 py-4">
                <input type="checkbox" class="item-checkbox rounded border-gray-300" data-id="${rsvp.id}">
            </td>
            <td class="px-6 py-4 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">${rsvp.event_name}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${rsvp.organization}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${rsvp.student}</td>
            <td class="px-6 py-4">${statusBadge}</td>
            <td class="px-6 py-4 text-sm text-gray-700">${rsvp.rsvp_date}</td>
            <td class="px-6 py-4">
                <button onclick="editEventRsvp('${rsvp.id}')" class="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteEventRsvp('${rsvp.id}')" class="text-red-600 hover:text-red-800 font-medium text-sm">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    updateCounts();
}

// Apply event RSVPs filters
function applyEventRsvpsFilters() {
    const search = document.getElementById('event-rsvps-search-input').value;
    const status = document.getElementById('event-rsvps-status-filter').value;
    fetchEventRsvpsData(search, status, 1);
}

// Clear event RSVPs filters
function clearEventRsvpsFilters() {
    document.getElementById('event-rsvps-search-input').value = '';
    document.getElementById('event-rsvps-status-filter').value = '';
    fetchEventRsvpsData();
}

// Edit event RSVP (placeholder function)
function editEventRsvp(rsvpId) {
    alert(`Edit event RSVP functionality for RSVP ID: ${rsvpId}\n\nThis would open an edit modal with RSVP details.`);
    // TODO: Implement edit event RSVP modal and API call
}

// Delete event RSVP (placeholder function)
function deleteEventRsvp(rsvpId) {
    if (confirm(`Are you sure you want to delete event RSVP with ID: ${rsvpId}?\n\nThis action cannot be undone.`)) {
        alert(`Delete event RSVP functionality for RSVP ID: ${rsvpId}\n\nThis would send a DELETE request to the API.`);
        // TODO: Implement delete event RSVP API call
    }
}

// Render event RSVPs pagination
function renderEventRsvpsPagination(data) {
    const paginationContainer = document.getElementById('event-rsvps-pagination');
    paginationContainer.innerHTML = '';

    if (data.total_pages <= 1) {
        return;
    }

    const search = document.getElementById('event-rsvps-search-input').value;
    const status = document.getElementById('event-rsvps-status-filter').value;

    // Previous button
    if (data.has_previous) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left mr-1"></i>Previous';
        prevBtn.onclick = () => fetchEventRsvpsData(search, status, data.current_page - 1);
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
        nextBtn.onclick = () => fetchEventRsvpsData(search, status, data.current_page + 1);
        paginationContainer.appendChild(nextBtn);
    }
}

// Call loadSectionLogic when script loads
loadSectionLogic();