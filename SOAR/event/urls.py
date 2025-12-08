from django.urls import path
from . import views

urlpatterns = [
    path('', views.global_event_page, name='global_event_page'),
    path('<uuid:event_id>/', views.event_detail, name='event_detail'),
    path('create/<uuid:org_id>/', views.create_event, name='create_event'),
    path('rsvp/<uuid:event_id>/', views.rsvp_event, name='rsvp_event'),
    path('edit/<uuid:event_id>/', views.edit_event, name='edit_event'),
    path('delete/<uuid:event_id>/', views.delete_event, name='delete_event'),
]
