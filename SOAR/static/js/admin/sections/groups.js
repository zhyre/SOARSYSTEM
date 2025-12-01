// Section data for groups
const sectionData = {
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
    }
};

// Load groups section specific logic
function loadGroupsSection() {
    // Update page title and breadcrumb
    const sectionNames = {
        'groups': 'Authentication › Groups'
    };
    document.getElementById('breadcrumb').textContent = sectionNames[currentSection];
    document.getElementById('section-title').textContent = sectionData[currentSection].title;
    document.getElementById('add-button-text').textContent = sectionData[currentSection].addButton;

    // Update table headers
    document.getElementById('col1-header').textContent = sectionData[currentSection].columns[0];
    document.getElementById('col2-header').textContent = sectionData[currentSection].columns[1];
    document.getElementById('col3-header').textContent = sectionData[currentSection].columns[2];
    document.getElementById('col4-header').textContent = sectionData[currentSection].columns[3];
    // Hide additional columns
    document.getElementById('col5-header').style.display = 'none';
    document.getElementById('col6-header').style.display = 'none';

    // Render table
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
        let rowHtml = `
            <td class="px-6 py-4">
                <input type="checkbox" class="item-checkbox rounded border-gray-300" data-id="${item.id}">
            </td>`;

        // Add data columns
        rowHtml += `
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
            </td>`;

        row.innerHTML = rowHtml;
        tbody.appendChild(row);
    });

    updateCounts();
}

// Call loadGroupsSection when script loads
loadGroupsSection();