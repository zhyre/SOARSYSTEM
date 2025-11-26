from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.utils import timezone
from datetime import timedelta
from .models import Notification

@login_required
def notifications_view(request):
    """Display user's notifications."""
    notifications = Notification.objects.filter(user=request.user)
    unread_count = notifications.filter(is_read=False).count()

    # Group notifications by type for tabs
    all_notifications = notifications
    unread_notifications = notifications.filter(is_read=False)
    system_notifications = notifications.filter(notification_type=Notification.TYPE_SYSTEM)
    event_notifications = notifications.filter(notification_type=Notification.TYPE_EVENT)
    organization_notifications = notifications.filter(
        notification_type__in=[Notification.TYPE_MEMBERSHIP, Notification.TYPE_ORGANIZATION]
    )

    context = {
        'all_notifications': all_notifications,
        'unread_notifications': unread_notifications,
        'system_notifications': system_notifications,
        'event_notifications': event_notifications,
        'organization_notifications': organization_notifications,
        'unread_count': unread_count,
        'hide_header': True,
    }
    return render(request, 'notification/notifications.html', context)

@login_required
def notification_detail_view(request, notification_id):
    """Display detailed view of a specific notification."""
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    
    # Mark as read when viewed
    if not notification.is_read:
        notification.is_read = True
        notification.save()
    
    context = {
        'notification': notification,
        'hide_header': True,
    }
    return render(request, 'notification/notification_detail.html', context)

@login_required
@require_GET
def get_notifications_api(request):
    """API endpoint to fetch recent notifications for dropdown."""
    limit = int(request.GET.get('limit', 10))
    notifications = Notification.objects.filter(user=request.user)[:limit]
    
    notifications_data = []
    for notif in notifications:
        notifications_data.append({
            'id': notif.id,
            'message': notif.message,
            'type': notif.notification_type,
            'priority': notif.priority,
            'is_read': notif.is_read,
            'date_created': notif.date_created.isoformat(),
            'icon_class': notif.get_icon_class(),
            'color_class': notif.get_color_class(),
            'link': notif.link or '#',
            'time_ago': get_time_ago(notif.date_created)
        })
    
    unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
    
    return JsonResponse({
        'notifications': notifications_data,
        'unread_count': unread_count,
        'status': 'success'
    })

@login_required
@require_GET
def get_unread_count_api(request):
    """API endpoint to get unread notification count."""
    unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
    return JsonResponse({
        'unread_count': unread_count,
        'status': 'success'
    })

@login_required
@require_POST
def mark_notification_read(request, notification_id):
    """Mark a specific notification as read."""
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.is_read = True
    notification.save()
    
    # Return updated unread count
    unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
    
    return JsonResponse({
        'status': 'success',
        'unread_count': unread_count
    })

@login_required
@require_POST
def mark_all_notifications_read(request):
    """Mark all user's notifications as read."""
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return JsonResponse({
        'status': 'success',
        'unread_count': 0
    })

def get_time_ago(date_time):
    """Convert datetime to human-readable time ago string."""
    now = timezone.now()
    diff = now - date_time
    
    if diff < timedelta(minutes=1):
        return 'Just now'
    elif diff < timedelta(hours=1):
        minutes = int(diff.total_seconds() / 60)
        return f'{minutes}m ago'
    elif diff < timedelta(days=1):
        hours = int(diff.total_seconds() / 3600)
        return f'{hours}h ago'
    elif diff < timedelta(days=7):
        days = diff.days
        return f'{days}d ago'
    else:
        return date_time.strftime('%b %d')
