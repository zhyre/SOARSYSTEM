from django.db import models
from django.conf import settings

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    notification_type = models.CharField(max_length=50, default='general')  # e.g., 'organization_approval'

    class Meta:
        app_label = 'notification'
        ordering = ['-date_created']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:50]}..."
