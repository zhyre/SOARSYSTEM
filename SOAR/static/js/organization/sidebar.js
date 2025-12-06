/**
 * Organization Sidebar - Consistent Navigation Across All Organization Pages
 * Provides mobile toggle functionality and responsive behavior
 */

// Mobile sidebar toggle function
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('hidden');
    }
}

// Initialize sidebar functionality
document.addEventListener('DOMContentLoaded', function() {
    // Remove any old overlay elements
    const oldOverlay = document.getElementById('overlay');
    if (oldOverlay) {
        oldOverlay.remove();
    }
    
    // Remove old hamburger menu toggle
    const oldToggle = document.getElementById('mobileMenuToggle');
    if (oldToggle) {
        oldToggle.remove();
    }
    
    // Create overlay for mobile sidebar
    const body = document.body;
    const mobileOverlay = document.createElement('div');
    mobileOverlay.id = 'overlay';
    mobileOverlay.className = 'hidden fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden';
    body.appendChild(mobileOverlay);
    
    // Add mobile menu toggle button for modern sidebar (only visible on mobile)
    const headerTitle = document.querySelector('.flex.items-center.space-x-4');
    if (headerTitle && window.innerWidth <= 768) {
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'p-2 rounded-lg hover:bg-gray-100 transition-colors';
        mobileToggle.setAttribute('aria-label', 'Toggle menu');
        mobileToggle.innerHTML = '<i class="fas fa-bars text-gray-600"></i>';
        mobileToggle.onclick = toggleMobileSidebar;
        headerTitle.insertBefore(mobileToggle, headerTitle.firstChild);
        
        // Hide on desktop
        if (window.innerWidth > 768) {
            mobileToggle.style.display = 'none';
        }
    }
    
    // Handle responsive behavior
    window.addEventListener('resize', function() {
        const mobileToggle = document.querySelector('.flex.items-center.space-x-4 button[aria-label="Toggle menu"]');
        if (mobileToggle) {
            mobileToggle.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
        }
    });
    
    // Close sidebar when clicking overlay
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('mobile-open');
                overlay.classList.add('hidden');
            }
        });
    }
    
    // Sidebar search functionality
    const searchInput = document.getElementById('sidebar-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
            
            navItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    // Add ripple effect to navigation items
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'absolute bg-blue-200 rounded-full opacity-50 animate-ping';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            
            const rect = this.getBoundingClientRect();
            ripple.style.left = (e.clientX - rect.left - 10) + 'px';
            ripple.style.top = (e.clientY - rect.top - 10) + 'px';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Export for use in other scripts
window.toggleMobileSidebar = toggleMobileSidebar;
