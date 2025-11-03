from django.contrib import admin
from event.models import OrganizationEvent
# Register your models here.
@admin.register(OrganizationEvent)
class OrganizationEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'organization', 'event_date', 'location', 'created_by', 'date_created')
    search_fields = ('title', 'organization__name', 'location')
    list_filter = ('event_date',)