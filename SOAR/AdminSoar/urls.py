from django.urls import path
from . import views

urlpatterns = [
    path('panel/', views.admin_panel, name='admin_panel'),
    path('create-organization/', views.admin_create_organization, name='admin_create_organization'),
]