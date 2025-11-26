from django.urls import path
from . import views

urlpatterns = [
    path('', views.notifications_view, name='notifications'),
    path('api/get/', views.get_notifications_api, name='get_notifications_api'),
    path('api/unread-count/', views.get_unread_count_api, name='get_unread_count_api'),
    path('mark-read/<int:notification_id>/', views.mark_notification_read, name='mark_notification_read'),
    path('mark-all-read/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
]