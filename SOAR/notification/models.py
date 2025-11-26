from django.db import models
from django.conf import settings

class Notification(models.Model):
    # Notification Types
    TYPE_SYSTEM = 'system'
    TYPE_MEMBERSHIP = 'membership'
    TYPE_EVENT = 'event'
    TYPE_ORGANIZATION = 'organization'
    TYPE_GENERAL = 'general'
    
    NOTIFICATION_TYPES = [
        (TYPE_SYSTEM, 'System Announcement'),
        (TYPE_MEMBERSHIP, 'Membership'),
        (TYPE_EVENT, 'Event'),
        (TYPE_ORGANIZATION, 'Organization'),
        (TYPE_GENERAL, 'General'),
    ]
    
    # Priority Levels
    PRIORITY_LOW = 'low'
    PRIORITY_MEDIUM = 'medium'
    PRIORITY_HIGH = 'high'
    
    PRIORITY_LEVELS = [
        (PRIORITY_LOW, 'Low'),
        (PRIORITY_MEDIUM, 'Medium'),
        (PRIORITY_HIGH, 'High'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    notification_type = models.CharField(
        max_length=50, 
        choices=NOTIFICATION_TYPES,
        default=TYPE_GENERAL
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_LEVELS,
        default=PRIORITY_MEDIUM,
        help_text="Priority level of the notification"
    )
    link = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Optional link to related content"
    )

    class Meta:
        app_label = 'notification'
        ordering = ['-date_created']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:50]}..."
    
    def get_icon_class(self):
        """Return Font Awesome icon class based on notification type."""
        icons = {
            self.TYPE_SYSTEM: 'fa-megaphone',
            self.TYPE_MEMBERSHIP: 'fa-user-check',
            self.TYPE_EVENT: 'fa-calendar-alt',
            self.TYPE_ORGANIZATION: 'fa-building',
            self.TYPE_GENERAL: 'fa-bell',
        }
        return icons.get(self.notification_type, 'fa-bell')
    
    def get_color_class(self):
        """Return color class based on notification type."""
        colors = {
            self.TYPE_SYSTEM: 'bg-red-500',
            self.TYPE_MEMBERSHIP: 'bg-green-500',
            self.TYPE_EVENT: 'bg-blue-500',
            self.TYPE_ORGANIZATION: 'bg-purple-500',
            self.TYPE_GENERAL: 'bg-gray-500',
        }
        return colors.get(self.notification_type, 'bg-gray-500')
