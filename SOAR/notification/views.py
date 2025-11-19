from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Notification

@login_required
def notifications_view(request):
    """Display user's notifications."""
    notifications = Notification.objects.filter(user=request.user)
    unread_count = notifications.filter(is_read=False).count()

    # Group notifications by type for tabs
    all_notifications = notifications
    unread_notifications = notifications.filter(is_read=False)
    organization_notifications = notifications.filter(notification_type__in=['organization_approval', 'event_created'])

    context = {
        'all_notifications': all_notifications,
        'unread_notifications': unread_notifications,
        'organization_notifications': organization_notifications,
        'unread_count': unread_count,
        'hide_header': True,
    }
    return render(request, 'notification/notifications.html', context)

@login_required
@require_POST
def mark_notification_read(request, notification_id):
    """Mark a specific notification as read."""
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.is_read = True
    notification.save()
    return JsonResponse({'status': 'success'})

@login_required
@require_POST
def mark_all_notifications_read(request):
    """Mark all user's notifications as read."""
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return JsonResponse({'status': 'success'})
