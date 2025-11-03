from django.db import models
from organization.models import Organization
from django.conf import settings
import uuid

class OrganizationEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='events')
    title = models.TextField()
    description = models.TextField(blank=True)
    event_date = models.DateTimeField()
    location = models.TextField(blank=True)
    activity_type = models.CharField(
        max_length=50,
        choices=[
            ('workshop', 'Workshop'),
            ('seminar', 'Seminar'),
            ('meeting', 'Meeting'),
            ('social', 'Social Event'),
            ('other', 'Other'),
        ],
        default='other'
    )
    max_participants = models.PositiveIntegerField(null=True, blank=True)
    attachments_url = models.URLField(blank=True, null=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.organization.name})"
