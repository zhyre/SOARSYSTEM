from django.contrib import admin
from .models import Organization, OrganizationMember, Program

@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ("abbreviation", "name")
    search_fields = ("abbreviation", "name")


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "adviser", "is_public", "date_created")
    list_filter = ("is_public", "date_created")
    search_fields = ("name", "description", "adviser__username", "adviser__first_name", "adviser__last_name")
    date_hierarchy = "date_created"


@admin.register(OrganizationMember)
class OrganizationMemberAdmin(admin.ModelAdmin):
    list_display = ("organization", "student", "role", "is_approved", "date_joined")
    list_filter = ("role", "is_approved", "date_joined")
    search_fields = ("organization__name", "student__username", "student__first_name", "student__last_name")
    autocomplete_fields = ("organization", "student")
