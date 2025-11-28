from django.urls import path
from . import views

urlpatterns = [
    path('panel/', views.admin_panel, name='admin_panel'),
    path('users/', views.admin_users, name='admin_users'),
    path('create-organization/', views.admin_create_organization, name='admin_create_organization'),
]