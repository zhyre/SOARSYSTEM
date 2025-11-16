from django.urls import path
from . import views

urlpatterns = [
    path('', views.global_event_page, name='global_event_page'),
    path('create/<uuid:org_id>/', views.create_event, name='create_event'),
    path('rsvp/<uuid:event_id>/', views.rsvp_event, name='rsvp_event'),

]
