
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and hide all contents
            tabButtons.forEach(btn => {
                btn.classList.remove('bg-gradient-to-r', 'from-blue-600', 'to-blue-700', 'text-white', 'shadow-lg', 'shadow-blue-500/30');
                btn.classList.add('bg-white', 'text-gray-700', 'border-2', 'border-gray-200');
            });
            
            // Show the selected tab content
            const tabId = button.getAttribute('data-tab');
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Update button styles
            button.classList.remove('bg-white', 'text-gray-700', 'border-2', 'border-gray-200');
            button.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-blue-700', 'text-white', 'shadow-lg', 'shadow-blue-500/30');
            
            // Show the selected tab content
            document.getElementById(`${tabId}-notifications`).classList.remove('hidden');
        });
    });
    
    // Mark all as read functionality
    const markAllReadBtn = document.getElementById('mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            fetch('/notification/mark-all-read/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    document.querySelectorAll('.unread').forEach(item => {
                        item.classList.remove('unread', 'bg-gradient-to-r', 'from-blue-50', 'to-white', 'border-l-4', 'border-blue-500');
                        item.classList.add('bg-white', 'border', 'border-gray-200');
                        const indicator = item.querySelector('.absolute');
                        if (indicator) indicator.remove();
                    });

                    // Update unread count
                    const unreadBadge = document.querySelector('button[data-tab="unread"] span');
                    if (unreadBadge) unreadBadge.textContent = '0';

                    // Show success message
                    alert('All notifications marked as read');
                }
            });
        });
    }

    // Mark individual notification as read
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const notificationId = item.dataset.notificationId;
            const orgId = item.dataset.orgId;

            if (item.classList.contains('unread')) {
                // Mark as read via API
                fetch(`/notification/mark-read/${notificationId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                        'Content-Type': 'application/json',
                    },
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        item.classList.remove('unread', 'bg-gradient-to-r', 'from-blue-50', 'to-white', 'border-l-4', 'border-blue-500');
                        item.classList.add('bg-white', 'border', 'border-gray-200');
                        const indicator = item.querySelector('.absolute');
                        if (indicator) indicator.remove();

                        // Update unread count
                        const unreadBadge = document.querySelector('button[data-tab="unread"] span');
                        if (unreadBadge) {
                            let count = parseInt(unreadBadge.textContent) || 0;
                            if (count > 0) {
                                count--;
                                unreadBadge.textContent = count;
                            }
                        }
                    }
                });
            }

            // Redirect to organization page
            window.location.href = `/organization/orgpage/${orgId}/`;
        });
    });

    // Load more functionality
    const loadMoreBtn = document.querySelector('.mt-8 button');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            // For demo, duplicate the first notification
            const firstNotification = document.querySelector('.notification-item');
            if (firstNotification) {
                const clone = firstNotification.cloneNode(true);
                // Change some text to make it different
                const title = clone.querySelector('h3');
                if (title) title.textContent = 'Another notification loaded';
                const desc = clone.querySelector('p');
                if (desc) desc.textContent = 'This is a loaded notification.';
                const time = clone.querySelector('.flex.items-center.text-xs span');
                if (time) time.textContent = 'Just now';

                // Append to all-notifications
                document.getElementById('all-notifications').appendChild(clone);

                // Reattach event listener
                clone.addEventListener('click', () => {
                    const notificationId = clone.dataset.notificationId;
                    const orgId = clone.dataset.orgId;

                    if (clone.classList.contains('unread')) {
                        fetch(`/notification/mark-read/${notificationId}/`, {
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                                'Content-Type': 'application/json',
                            },
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'success') {
                                clone.classList.remove('unread', 'bg-gradient-to-r', 'from-blue-50', 'to-white', 'border-l-4', 'border-blue-500');
                                clone.classList.add('bg-white', 'border', 'border-gray-200');
                                const indicator = clone.querySelector('.absolute');
                                if (indicator) indicator.remove();
                                const unreadBadge = document.querySelector('button[data-tab="unread"] span');
                                if (unreadBadge) {
                                    let count = parseInt(unreadBadge.textContent) || 0;
                                    if (count > 0) {
                                        count--;
                                        unreadBadge.textContent = count;
                                    }
                                }
                            }
                        });
                    }

                    window.location.href = `/organization/orgpage/${orgId}/`;
                });
            }
        });
    }
});
