// Sidebar Notification Badge Update Script
(function() {
    function updateSidebarBadge() {
        fetch('/notifications/api/unread-count/')
            .then(response => response.json())
            .then(data => {
                const badge = document.getElementById('sidebar-notification-badge');
                if (badge && data.unread_count > 0) {
                    badge.textContent = data.unread_count > 99 ? '99+' : data.unread_count;
                    badge.classList.remove('hidden');
                } else if (badge) {
                    badge.classList.add('hidden');
                }
            })
            .catch(error => console.error('Error fetching notification count:', error));
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateSidebarBadge);
    } else {
        updateSidebarBadge();
    }
    
    setInterval(updateSidebarBadge, 60000);
})();
