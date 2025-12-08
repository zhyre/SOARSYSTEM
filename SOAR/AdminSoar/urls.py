from django.urls import path
from . import views

urlpatterns = [
    path('panel/', views.admin_panel, name='admin_panel'),
    path('create-organization/', views.admin_create_organization, name='admin_create_organization'),
    # API endpoints
    path('api/users/', views.get_users_data, name='api_users'),
    path('api/users/<uuid:user_id>/', views.delete_user, name='api_delete_user'),
    path('api/users/<uuid:user_id>/details/', views.get_user_details, name='api_user_details'),
    path('api/organizations/', views.get_organizations_data, name='api_organizations'),
    path('api/organizations/<uuid:org_id>/details/', views.get_organization_details, name='api_organization_details'),
    path('api/rsvps/<uuid:rsvp_id>/', views.delete_rsvp, name='api_delete_rsvp'),
    path('api/rsvps/<uuid:rsvp_id>/details/', views.get_rsvp_details, name='api_rsvp_details'),
    path('api/events/<uuid:event_id>/details/', views.get_event_details, name='api_event_details'),
    path('api/events/<uuid:event_id>/', views.delete_event, name='api_delete_event'),
    path('api/organization-members/<uuid:member_id>/details/', views.get_organization_member_details, name='api_org_member_details'),
    path('api/organization-members/<uuid:member_id>/', views.delete_org_member, name='api_delete_org_member'),
    path('api/organizations/<uuid:org_id>/', views.delete_organization, name='api_delete_organization'),
    path('api/programs/<uuid:program_id>/', views.delete_program, name='api_delete_program'),
    path('api/organization-members/', views.get_organization_members_data, name='api_organization_members'),
    path('api/events/', views.get_events_data, name='api_events'),
    path('api/rsvps/', views.get_rsvps_data, name='api_rsvps'),
    path('api/programs/', views.get_programs_data, name='api_programs'),
]