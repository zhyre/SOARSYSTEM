from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

# API routes
router = DefaultRouter()
router.register(r'members', views.OrganizationMemberViewSet, basename='organization-member')
router.register(r'programs', views.ProgramViewSet, basename='program')

urlpatterns = [
    path('orgpage/<uuid:org_id>/', views.orgpage, name='orgpage'),
    path('profile/', views.organization_profile, name='organization_profile'),
    path('profile/edit/', views.organization_edit_profile, name='organization_editprofile'),
    #path('members/', views.membermanagement, name='membermanagement'),
    #path('members/manage/', views.membermanagement, name='membermanagement'),
    #path('organization/<uuid:org_id>/members/manage/', views.membermanagement, name='membermanagement'),
    path('members/<uuid:member_id>/demote/', views.demote_member, name='demote_member'),
    path('api/update-organization/', views.api_update_organization, name='api_update_organization'),
    path('organization/<uuid:org_id>/members/manage/', views.membermanagement, name='membermanagement')

] + router.urls
