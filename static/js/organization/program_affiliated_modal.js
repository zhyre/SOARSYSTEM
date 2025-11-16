// static/js/organization/program_affiliated_modal.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('program_affiliated_modal.js loaded!');

  // --- Elements ---
  const openBtn = document.getElementById('openProgramsModal');
  const modal = document.getElementById('programsModal');
  const closeBtn = document.getElementById('closeProgramsModal');
  const cancelBtn = document.getElementById('cancelProgramsBtn');
  const saveBtn = document.getElementById('saveProgramsBtn');
  const programsList = document.getElementById('programsList');
  const displayChips = document.getElementById('displayChips');
  const visibilitySelect = document.getElementById('id_is_public');
  const searchInput = document.getElementById('programSearch');

  // Check if all elements exist before proceeding
  if (!openBtn || !modal || !closeBtn || !cancelBtn || !saveBtn || !programsList || !displayChips || !visibilitySelect || !searchInput) {
    console.error('Program modal script: A required element was not found!');
    return;
  }

  let selectedPrograms = currentAllowedPrograms || [];

  // --- Function to check visibility ---
  function isPrivate() {
    console.log('visibilitySelect.value:', visibilitySelect.value);
    return visibilitySelect.value === 'false';
  }

  // --- Open/Close Modal ---
  openBtn.addEventListener('click', async () => {
    console.log('Open button clicked, isPrivate:', isPrivate());
    if (isPrivate()) {
      modal.classList.remove('hidden');
      await loadPrograms();
      searchInput.value = ''; // Clear search when opening
    } else {
      alert('The "Add Programs" button can only be accessed when visibility is set to Private.');
    }
  });
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

  // --- Search Functionality ---
  searchInput.addEventListener('input', () => {
    renderPrograms(programsData);
  });

  // --- Load Programs from Django ---
  async function loadPrograms() {
    programsList.innerHTML = `<p class="text-gray-400 text-sm italic">Loading programs...</p>`;
    try {
      // Use programsData from Django
      const data = programsData;

      if (!data || data.length === 0) {
        programsList.innerHTML = `<p class="text-gray-400 text-sm italic">No programs found</p>`;
        return;
      }
      renderPrograms(data);
    } catch (err) {
      console.error('Error loading programs:', err);
      programsList.innerHTML = `<p class="text-red-500 text-sm italic">Error loading programs: ${err.message}</p>`;
    }
  }

  // --- Render Programs ---
  function renderPrograms(data) {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredData = data.filter(program => program.name.toLowerCase().includes(searchTerm));

    if (filteredData.length === 0) {
      programsList.innerHTML = `<p class="text-gray-400 text-sm italic">No programs found matching "${searchInput.value}"</p>`;
      return;
    }

    programsList.innerHTML = filteredData.map(program => `
      <label class="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
        <input type="checkbox" value="${program.id}"
          class="programCheckbox rounded text-blue-600 focus:ring-blue-500"
          ${selectedPrograms.includes(program.id.toString()) ? 'checked' : ''}>
        <span class="text-gray-800 text-sm">${program.name}</span>
      </label>
    `).join('');
  }

  // --- Save Selected Programs ---
  saveBtn.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.programCheckbox');
    selectedPrograms = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    displaySelectedPrograms();
    modal.classList.add('hidden');

    // Update hidden input (make sure this ID is correct)
    const hiddenInput = document.getElementById('selectedProgramsInput');
    if (hiddenInput) {
      hiddenInput.value = selectedPrograms.join(',');
    }
  });

  // --- Display Chips for Selected Programs ---
  // Inside program_affiliated_modal.js

  // --- Display Chips for Selected Programs ---
  function displaySelectedPrograms() {
    if (selectedPrograms.length === 0) {
      displayChips.innerHTML = `<span class="text-gray-400 text-sm italic">No programs selected yet</span>`;
      return;
    }

    try {
      // Use programsData from Django to get program names
      const selectedProgramObjects = programsData.filter(program => selectedPrograms.includes(program.id.toString()));

      displayChips.innerHTML = selectedProgramObjects.map(program => `
        <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2" data-id="${program.id}">
          ${program.name}
          <button type="button" class="remove-chip" data-id="${program.id}">
            <i class="fas fa-times text-xs"></i>
          </button>
        </span>
      `).join('');

      // --- Add Remove Chip Listeners ---
      // 2. ADDED HYPHEN HERE
      document.querySelectorAll('.remove-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          selectedPrograms = selectedPrograms.filter(p => p !== id);
          displaySelectedPrograms(); // Re-render chips
          // Also update the hidden input
          const hiddenInput = document.getElementById('selectedProgramsInput');
          if (hiddenInput) {
            hiddenInput.value = selectedPrograms.join(',');
          }
        });
      });
    } catch (err) {
      console.error('Error in displaySelectedPrograms:', err);
      displayChips.innerHTML = `<span class="text-red-500 text-sm italic">Error loading program names</span>`;
    }
  }
  // --- Disable/Enable button based on visibility ---
  function updateButtonState() {
    if (isPrivate()) {
      openBtn.disabled = false;
      openBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
      openBtn.disabled = true;
      openBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  }

  // --- INITIALIZE ---

  // Listen for visibility changes
  visibilitySelect.addEventListener('change', updateButtonState);

  // Set initial state for button
  updateButtonState();

  // Call it on page load to display the initial state.
  displaySelectedPrograms();

}); // End of DOMContentLoaded