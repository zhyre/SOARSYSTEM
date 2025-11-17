from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

# API routes
router = DefaultRouter()
router.register(r'organizations', views.OrganizationViewSet, basename='organization')
router.register(r'members', views.OrganizationMemberViewSet, basename='organization-member')
router.register(r'programs', views.ProgramViewSet, basename='program')

urlpatterns = [
    path('orgpage/<uuid:org_id>/', views.orgpage, name='orgpage'),
    path('orgpage/<uuid:org_id>/calendar/', views.calendar_view, name='calendar'),
    #path('profile/', views.organization_profile, name='organization_profile'),
    path('profile/<uuid:org_id>/edit/', views.organization_editprofile, name='organization_editprofile'),
    #path('members/', views.membermanagement, name='membermanagement'),
    #path('members/manage/', views.membermanagement, name='membermanagement'),
    #path('organization/<uuid:org_id>/members/manage/', views.membermanagement, name='membermanagement'),
    path('members/<uuid:member_id>/demote/', views.demote_member, name='demote_member'),
    path('organization/<uuid:org_id>/members/<uuid:member_id>/promote/', views.promote_member, name='promote_member'),
    path('api/update-organization/', views.api_update_organization, name='api_update_organization'),
    path('organization/<uuid:org_id>/members/manage/', views.membermanagement, name='membermanagement'),
    path('organization/<uuid:org_id>/profile/', views.organization_profile, name='organization_profile'),
    path('orgpage/<uuid:org_id>/leave/', views.leave_organization, name='leave_organization'),


    path('programs/', views.program_list, name='program_list'),
    path('programs/add/', views.add_program, name='add_program'),
    path('programs/edit/<int:pk>/', views.edit_program, name='edit_program'),
    path('programs/delete/<int:pk>/', views.delete_program, name='delete_program'),
    path('get-programs/', views.get_programs, name='get_programs'),
] + router.urls
