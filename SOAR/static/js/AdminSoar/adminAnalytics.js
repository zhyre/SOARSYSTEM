// Analytics functionality
let userChart, orgChart, eventChart; // Global chart instances

async function loadAnalytics() {
    try {
        showLoadingStates();

        // Fetch summary data (check responses before parsing)
        const endpoints = [
            '/admin-panel/api/users/',
            '/admin-panel/api/organizations/',
            '/admin-panel/api/events/',
            '/admin-panel/api/rsvps/'
        ];

        const responses = await Promise.all(endpoints.map(url => fetch(url)));

        for (const resp of responses) {
            if (!resp.ok) {
                throw new Error(`Analytics API error: ${resp.status} ${resp.statusText}`);
            }
        }

        const [users, orgs, events, rsvps] = await Promise.all(responses.map(r => r.json()));

        // Update summary cards with animation
        animateCounter('total-users', users.data.length);
        animateCounter('total-orgs', orgs.data.length);
        animateCounter('total-events', events.data.length);
        animateCounter('total-rsvps', rsvps.data.length);

        // Update trend indicators
        updateTrends(users.data.length, orgs.data.length, events.data.length, rsvps.data.length);

        // Create charts with Chart.js
        const userData = getUserRegistrationData(users.data);
        const orgData = getOrgTypeData(orgs.data);
        const eventData = getEventTypeData(events.data);

        createUserChart(userData);
        createOrgChart(orgData);
        createEventChart(eventData);

        // Populate data tables
        populateUserTable(userData);
        populateOrgTable(orgData);
        populateEventTable(eventData);

        loadRecentActivity(events.data.slice(0, 5)); // Last 5 events

        hideLoadingStates();

    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('Failed to load analytics data', 'error');
        hideLoadingStates();
    }
}

function showLoadingStates() {
    // Show loading spinners for metrics
    document.querySelectorAll('.loading-spinner').forEach(spinner => {
        spinner.classList.remove('hidden');
    });

    // Show chart loading overlays
    document.querySelectorAll('.chart-loading').forEach(loading => {
        loading.style.display = 'flex';
    });

    // Show activity loading
    const activityContainer = document.getElementById('recent-activity');
    if (activityContainer) {
        activityContainer.innerHTML = `
            <div class="activity-loading flex items-center justify-center py-8">
                <div class="text-center">
                    <div class="w-8 h-8 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin mx-auto mb-2"></div>
                    <p class="text-sm text-gray-600">Loading activity...</p>
                </div>
            </div>
        `;
    }
}

function hideLoadingStates() {
    // Hide loading spinners
    document.querySelectorAll('.loading-spinner').forEach(spinner => {
        spinner.classList.add('hidden');
    });

    // Hide chart loading overlays
    document.querySelectorAll('.chart-loading').forEach(loading => {
        loading.style.display = 'none';
    });
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return; // Exit if element doesn't exist

    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function getUserRegistrationData(users) {
    // Group by month
    const monthly = {};
    users.forEach(user => {
        const date = new Date(user.dateJoined);
        const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthly[month] = (monthly[month] || 0) + 1;
    });
    return monthly;
}

function getOrgTypeData(orgs) {
    const types = {};
    orgs.forEach(org => {
        const type = org.type || 'Other';
        types[type] = (types[type] || 0) + 1;
    });
    return types;
}

function getEventTypeData(events) {
    const types = {};
    events.forEach(event => {
        const type = event.activityType || 'Other';
        types[type] = (types[type] || 0) + 1;
    });
    return types;
}

function createUserChart(data) {
    const ctx = document.getElementById('userRegistrationChart').getContext('2d');
    const chartType = document.getElementById('chart-type').value;

    if (userChart) {
        userChart.destroy();
    }

    const labels = Object.keys(data);
    const values = Object.values(data);

    userChart = new Chart(ctx, {
        type: chartType === 'doughnut' ? 'line' : chartType, // Doughnut doesn't make sense for trend
        data: {
            labels: labels,
            datasets: [{
                label: 'User Registrations',
                data: values,
                backgroundColor: chartType === 'doughnut' ? [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ] : 'rgba(59, 130, 246, 0.8)',
                borderColor: chartType === 'doughnut' ? 'transparent' : 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                fill: chartType === 'line',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    cornerRadius: 6
                }
            },
            scales: chartType !== 'doughnut' ? {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            } : {}
        }
    });
}

function createOrgChart(data) {
    const ctx = document.getElementById('organizationTypesChart').getContext('2d');
    const chartType = document.getElementById('chart-type').value;

    if (orgChart) {
        orgChart.destroy();
    }

    const labels = Object.keys(data);
    const values = Object.values(data);

    orgChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Organizations',
                data: values,
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: 'white',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    cornerRadius: 6
                }
            },
            scales: chartType !== 'doughnut' ? {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            } : {}
        }
    });
}

function createEventChart(data) {
    const ctx = document.getElementById('eventActivityChart').getContext('2d');
    const chartType = document.getElementById('chart-type').value;

    if (eventChart) {
        eventChart.destroy();
    }

    const labels = Object.keys(data);
    const values = Object.values(data);

    eventChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Events',
                data: values,
                backgroundColor: [
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: 'white',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    cornerRadius: 6
                }
            },
            scales: chartType !== 'doughnut' ? {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            } : {}
        }
    });
}

function loadRecentActivity(events) {
    const container = document.getElementById('recent-activity');
    container.innerHTML = '';

    if (events.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500">No recent activity</p>
            </div>
        `;
        return;
    }

    events.forEach(event => {
        const item = document.createElement('div');
        item.className = 'flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer';
        const eventDate = new Date(event.date).toLocaleDateString();
        item.innerHTML = `
            <div class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">${event.eventName || 'Unnamed Event'}</p>
                <p class="text-xs text-gray-500">${event.organization || 'Unknown Org'} • ${eventDate}</p>
            </div>
            <div class="flex-shrink-0">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${event.activityType || 'Event'}
                </span>
            </div>
        `;
        container.appendChild(item);
    });
}

// Event listeners for filters and buttons
document.addEventListener('DOMContentLoaded', function () {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-analytics');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
            loadAnalytics();
        });
    }

    // Export button
    const exportBtn = document.getElementById('export-analytics');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAnalytics);
    }


    // Auto-refresh toggle
    const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
    if (autoRefreshToggle) {
        autoRefreshToggle.addEventListener('change', toggleAutoRefresh);
    }

    // Chart type filter
    const chartTypeSelect = document.getElementById('chart-type');
    if (chartTypeSelect) {
        chartTypeSelect.addEventListener('change', function () {
            loadAnalytics(); // Reload to update all charts
        });
    }

    // Date range filter
    const dateRangeSelect = document.getElementById('date-range');
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', function () {
            const customRange = document.getElementById('custom-date-range');
            if (this.value === 'custom') {
                customRange.classList.remove('hidden');
            } else {
                customRange.classList.add('hidden');
                loadAnalytics(); // Reload with new date range
            }
        });
    }

    // Custom date range apply button
    const applyCustomRangeBtn = document.getElementById('apply-custom-range');
    if (applyCustomRangeBtn) {
        applyCustomRangeBtn.addEventListener('click', function () {
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;

            if (!startDate || !endDate) {
                showToast('Please select both start and end dates', 'error');
                return;
            }

            if (new Date(startDate) > new Date(endDate)) {
                showToast('Start date cannot be after end date', 'error');
                return;
            }

            // Store custom date range for API calls
            localStorage.setItem('customStartDate', startDate);
            localStorage.setItem('customEndDate', endDate);

            loadAnalytics(); // Reload with custom date range
        });
    }

    // Data table toggles
    const tableToggles = ['toggle-user-table', 'toggle-org-table', 'toggle-event-table'];
    tableToggles.forEach(toggleId => {
        const toggleBtn = document.getElementById(toggleId);
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function () {
                const tableId = toggleId.replace('toggle-', '') + '-data-table';
                const table = document.getElementById(tableId);
                const icon = this.querySelector('i.fa-chevron-down, i.fa-chevron-up');

                if (table.classList.contains('hidden')) {
                    table.classList.remove('hidden');
                    icon.className = 'fas fa-chevron-up text-xs';
                } else {
                    table.classList.add('hidden');
                    icon.className = 'fas fa-chevron-down text-xs';
                }
            });
        }
    });

    // Activity search and filter
    const activitySearch = document.getElementById('activity-search');
    const activityFilter = document.getElementById('activity-filter');

    if (activitySearch) {
        activitySearch.addEventListener('input', filterActivities);
    }

    if (activityFilter) {
        activityFilter.addEventListener('change', filterActivities);
    }
});

// Trend calculation and display
function updateTrends(currentUsers, currentOrgs, currentEvents, currentRsvps) {
    // Get previous values from localStorage or use defaults
    const prevUsers = parseInt(localStorage.getItem('prevUsers')) || currentUsers;
    const prevOrgs = parseInt(localStorage.getItem('prevOrgs')) || currentOrgs;
    const prevEvents = parseInt(localStorage.getItem('prevEvents')) || currentEvents;
    const prevRsvps = parseInt(localStorage.getItem('prevRsvps')) || currentRsvps;

    // Calculate percentages
    const userChange = ((currentUsers - prevUsers) / prevUsers * 100).toFixed(1);
    const orgChange = ((currentOrgs - prevOrgs) / prevOrgs * 100).toFixed(1);
    const eventChange = ((currentEvents - prevEvents) / prevEvents * 100).toFixed(1);
    const rsvpChange = ((currentRsvps - prevRsvps) / prevRsvps * 100).toFixed(1);

    // Update trend displays
    updateTrendDisplay('users-trend', userChange);
    updateTrendDisplay('orgs-trend', orgChange);
    updateTrendDisplay('events-trend', eventChange);
    updateTrendDisplay('rsvps-trend', rsvpChange);

    // Store current values for next comparison
    localStorage.setItem('prevUsers', currentUsers);
    localStorage.setItem('prevOrgs', currentOrgs);
    localStorage.setItem('prevEvents', currentEvents);
    localStorage.setItem('prevRsvps', currentRsvps);
}

function updateTrendDisplay(elementId, changePercent) {
    const element = document.getElementById(elementId);
    if (!element) return; // Exit if element doesn't exist

    const isPositive = parseFloat(changePercent) >= 0;
    const absChange = Math.abs(changePercent);

    element.innerHTML = `
        <i class="fas fa-arrow-${isPositive ? 'up' : 'down'} text-${isPositive ? 'green' : 'red'}-500 text-xs"></i>
        <span class="text-xs text-${isPositive ? 'green' : 'red'}-600 font-medium">${isPositive ? '+' : '-'}${absChange}%</span>
        <span class="text-xs text-gray-500">vs last month</span>
    `;
}

// Data table population
function populateUserTable(data) {
    const tbody = document.getElementById('user-table-body');
    tbody.innerHTML = '';

    Object.entries(data).forEach(([period, count]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-3 py-2 text-sm text-gray-900">${period}</td>
            <td class="px-3 py-2 text-sm text-gray-900">${count}</td>
            <td class="px-3 py-2 text-sm text-gray-500">-</td>
        `;
        tbody.appendChild(row);
    });
}

function populateOrgTable(data) {
    const tbody = document.getElementById('org-table-body');
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    tbody.innerHTML = '';

    Object.entries(data).forEach(([type, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-3 py-2 text-sm text-gray-900">${type}</td>
            <td class="px-3 py-2 text-sm text-gray-900">${count}</td>
            <td class="px-3 py-2 text-sm text-gray-500">${percentage}%</td>
        `;
        tbody.appendChild(row);
    });
}

function populateEventTable(data) {
    const tbody = document.getElementById('event-table-body');
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    tbody.innerHTML = '';

    Object.entries(data).forEach(([type, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-3 py-2 text-sm text-gray-900">${type}</td>
            <td class="px-3 py-2 text-sm text-gray-900">${count}</td>
            <td class="px-3 py-2 text-sm text-gray-500">${percentage}%</td>
        `;
        tbody.appendChild(row);
    });
}

// Activity filtering and search
function filterActivities() {
    const searchTerm = document.getElementById('activity-search').value.toLowerCase();
    const filterType = document.getElementById('activity-filter').value;
    const activities = document.querySelectorAll('#recent-activity .flex');

    let visibleCount = 0;

    activities.forEach(activity => {
        const eventName = activity.querySelector('p.font-medium').textContent.toLowerCase();
        const orgName = activity.querySelector('p.text-xs.text-gray-500').textContent.toLowerCase();
        const type = activity.querySelector('.rounded-full').textContent.toLowerCase();

        const matchesSearch = eventName.includes(searchTerm) || orgName.includes(searchTerm);
        const matchesFilter = filterType === 'all' ||
            (filterType === 'event' && type.includes('event')) ||
            (filterType === 'organization' && type.includes('org'));

        if (matchesSearch && matchesFilter) {
            activity.style.display = 'flex';
            visibleCount++;
        } else {
            activity.style.display = 'none';
        }
    });

    document.getElementById('activity-count').textContent = `${visibleCount} items`;
}

// Auto-refresh functionality
let autoRefreshInterval;

function toggleAutoRefresh() {
    const toggle = document.getElementById('auto-refresh-toggle');
    if (toggle.checked) {
        autoRefreshInterval = setInterval(() => {
            loadAnalytics();
        }, 30000); // 30 seconds
        showToast('Auto-refresh enabled', 'info');
    } else {
        clearInterval(autoRefreshInterval);
        showToast('Auto-refresh disabled', 'info');
    }
}


// Export functionality
function exportAnalytics() {
    const data = {
        timestamp: new Date().toISOString(),
        metrics: {
            users: document.getElementById('total-users').textContent,
            organizations: document.getElementById('total-orgs').textContent,
            events: document.getElementById('total-events').textContent,
            rsvps: document.getElementById('total-rsvps').textContent
        },
        charts: {
            userRegistration: getUserRegistrationData([]),
            organizationTypes: getOrgTypeData([]),
            eventTypes: getEventTypeData([])
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Analytics data exported successfully', 'success');
}