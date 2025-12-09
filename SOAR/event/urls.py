from django.urls import path
from . import views

urlpatterns = [
    path('', views.global_event_page, name='global_event_page'),
    path('<uuid:event_id>/', views.event_detail, name='event_detail'),
    path('create/<uuid:org_id>/', views.create_event, name='create_event'),
    path('rsvp/<uuid:event_id>/', views.rsvp_event, name='rsvp_event'),
    path('<uuid:event_id>/rsvp-list/<str:status>/', views.rsvp_list, name='rsvp_list'),
    path('<uuid:event_id>/get-edit-data/', views.get_event_edit_data, name='get_event_edit_data'),
    path('<uuid:event_id>/edit/', views.edit_event, name='edit_event'),
    path('delete/<uuid:event_id>/', views.delete_event, name='delete_event'),
]
