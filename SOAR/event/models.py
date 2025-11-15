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

class EventRSVP(models.Model):
    RSVP_STATUS_CHOICES = [
        ('going', 'Going'),
        ('not_going', 'Not Going'),
        ('interested', 'Interested'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey('OrganizationEvent', on_delete=models.CASCADE, related_name='rsvps')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_rsvps')
    status = models.CharField(max_length=20, choices=RSVP_STATUS_CHOICES)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('event', 'user')  # A user can only RSVP once per event

    def __str__(self):
        return f"{self.user.username} - {self.get_status_display()} ({self.event.title})"
