from django.urls import path
from . import views

urlpatterns = [
    path('create/<uuid:org_id>/', views.create_event, name='create_event'),
]
