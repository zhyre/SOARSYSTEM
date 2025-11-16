# organization/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Organization, OrganizationMember

@receiver(post_save, sender=Organization)
def add_adviser_as_member(sender, instance, created, **kwargs):
    if created and instance.adviser:
        OrganizationMember.objects.get_or_create(
            organization=instance,
            student=instance.adviser,
            defaults={
                'role': 'adviser',  # You may want to add 'adviser' to ROLE_CHOICES
                'is_approved': True,
            }
        )
