from django.urls import path
from . import views

urlpatterns = [
    path('panel/', views.admin_panel, name='admin_panel'),
    path('create-organization/', views.admin_create_organization, name='admin_create_organization'),
    # API endpoints
    path('api/users/', views.get_users_data, name='api_users'),
    path('api/organizations/', views.get_organizations_data, name='api_organizations'),
    path('api/organization-members/', views.get_organization_members_data, name='api_organization_members'),
    path('api/events/', views.get_events_data, name='api_events'),
    path('api/rsvps/', views.get_rsvps_data, name='api_rsvps'),
    path('api/programs/', views.get_programs_data, name='api_programs'),
]