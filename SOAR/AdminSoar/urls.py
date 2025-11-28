from django.urls import path
from . import views

urlpatterns = [
    path('panel/', views.admin_panel, name='admin_panel'),
    path('users/', views.admin_users, name='admin_users'),
    path('event-rsvps/', views.admin_event_rsvps, name='admin_event_rsvps'),
    path('organization-events/', views.admin_organization_events, name='admin_organization_events'),
    path('organization-members/', views.admin_organization_members, name='admin_organization_members'),
    path('organizations/', views.admin_organizations, name='admin_organizations'),
    path('programs/', views.admin_programs, name='admin_programs'),
    path('create-organization/', views.admin_create_organization, name='admin_create_organization'),
]