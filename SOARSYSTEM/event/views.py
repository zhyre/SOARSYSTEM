from django.shortcuts import render

from supabase import create_client
from django.conf import settings
import uuid

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

from django.utils.text import slugify

def upload_to_supabase(file, org_id, org_name):
    # Handle both file objects and raw bytes
    if hasattr(file, 'name'):
        # It's a file object
        filename = f"{uuid.uuid4()}_{file.name}"
        file_bytes = file.read()
    else:
        # It's raw bytes, create a filename
        filename = f"{uuid.uuid4()}_attachment.bin"
        file_bytes = file

    bucket = "event_attachments"

    # Use org name as folder
    folder = slugify(org_name)
    file_path = f"{folder}/{filename}"

    try:
        # Try to upload to Supabase - use file_bytes directly
        result = supabase.storage.from_(bucket).upload(file_path, file_bytes)
        print(f"Upload result: {result}")  # Debug log
        return supabase.storage.from_(bucket).get_public_url(file_path)
    except Exception as e:
        print(f"Supabase upload error: {str(e)}")  # Debug log
        print(f"Error type: {type(e).__name__}")  # Debug log
        # If upload fails, return None but don't break the event creation
        return None


from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from event.models import OrganizationEvent, EventRSVP
from organization.models import Organization, OrganizationMember
from datetime import datetime
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.http import require_POST
from django.utils import timezone

@login_required
def global_event_page(request):
    """Global events page showing all upcoming events with membership-based UI."""
    # Get organizations the user has joined
    user_organization_ids = set(OrganizationMember.objects.filter(
        student=request.user,
        is_approved=True
    ).values_list('organization', flat=True))

    # Get all upcoming events for the list view
    all_events = list(OrganizationEvent.objects.filter(
        event_date__gte=timezone.now()
    ).order_by('event_date'))

    # Create event data dictionary
    events_data = {}
    for event in all_events:
        going_count = EventRSVP.objects.filter(event=event, status='going').count()
        interested_count = EventRSVP.objects.filter(event=event, status='interested').count()
        is_user_member = event.organization.id in user_organization_ids

        user_rsvp_status = None
        if is_user_member:
            try:
                user_rsvp = EventRSVP.objects.get(event=event, user=request.user)
                user_rsvp_status = user_rsvp.status
            except EventRSVP.DoesNotExist:
                pass

        # Get RSVPed users for attendee avatars (limit to 5 for display)
        rsvp_users = EventRSVP.objects.filter(
            event=event,
            status='going'
        ).select_related('user').order_by('date_created')[:5]

        events_data[str(event.id)] = {
            'event': event,
            'going_count': going_count,
            'interested_count': interested_count,
            'user_rsvp_status': user_rsvp_status,
            'is_user_member': is_user_member,
            'rsvp_users': rsvp_users
        }

        # Set attributes on event object for template compatibility
        event.going_count = going_count
        event.interested_count = interested_count
        event.user_rsvp_status = user_rsvp_status
        event.is_user_member = is_user_member
        event.rsvp_users = rsvp_users

    # Get events only from joined organizations for the calendar
    calendar_events = [event for event in all_events if event.organization.id in user_organization_ids]

    # Prepare events data for calendar JSON (only joined organizations)
    events_json = []
    for event in calendar_events:
        event_data = events_data[str(event.id)]
        events_json.append({
            'id': str(event.id),
            'title': event.title,
            'organization': event.organization.name,
            'organization_id': str(event.organization.id),
            'date': event.event_date.isoformat(),
            'description': event.description,
            'type': event.activity_type,
            'going_count': event_data['going_count'],
            'interested_count': event_data['interested_count'],
            'user_rsvp_status': event_data['user_rsvp_status'],
            'location': event.location,
            'max_participants': event.max_participants
        })

    # Prepare all events data for modal JSON
    all_events_json = []
    for event in all_events:
        event_data = events_data[str(event.id)]
        all_events_json.append({
            'id': str(event.id),
            'title': event.title,
            'organization': event.organization.name,
            'organization_id': str(event.organization.id),
            'date': event.event_date.isoformat(),
            'description': event.description,
            'type': event.activity_type,
            'going_count': event_data['going_count'],
            'interested_count': event_data['interested_count'],
            'user_rsvp_status': event_data['user_rsvp_status'],
            'is_user_member': event_data['is_user_member'],
            'location': event.location,
            'max_participants': event.max_participants
        })

    import json
    events_json_str = json.dumps(events_json)
    all_events_json_str = json.dumps(all_events_json)

    return render(request, 'event/global_event_page.html', {
        'events': all_events,
        'events_json': events_json_str,
        'all_events_json': all_events_json_str,
    })

def create_event(request, org_id):
    print(f"=== CREATE EVENT STARTED for org_id: {org_id} ===")  # Debug log
    organization = get_object_or_404(Organization, id=org_id)
    print(f"Organization found: {organization.name} (id: {organization.id})")  # Debug log

    if request.method == 'POST':
        print("POST method detected")  # Debug log
        print("POST data received:", dict(request.POST))  # Debug log
        print("FILES received:", list(request.FILES.keys()))  # Debug log

        title = request.POST.get('title')
        description = request.POST.get('description')
        date = request.POST.get('date')
        time = request.POST.get('time')
        location = request.POST.get('location')
        activity_type = request.POST.get('type')
        max_participants = request.POST.get('max_participants') or None

        print(f"Extracted data - Title: {title}, Date: {date}, Time: {time}, Type: {activity_type}")  # Debug log

        file_list = request.FILES.getlist('attachment')
        file = file_list[0] if file_list else None
        print(f"File processing - File list: {len(file_list)}, File: {file.name if file else 'None'}")  # Debug log

        try:
            event_datetime = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
            print(f"DateTime parsed successfully: {event_datetime}")  # Debug log
        except Exception as e:
            print(f"DateTime parsing error: {str(e)}")  # Debug log
            # Return error response or handle appropriately
            return redirect('orgpage', org_id)

        attachment_url = None
        if file:
            print("Attempting file upload...")  # Debug log
            attachment_url = upload_to_supabase(file, org_id, organization.name)
            print(f"Attachment URL result: {attachment_url}")  # Debug log
        else:
            print("No file to upload")  # Debug log

        try:
            print("Creating event in database...")  # Debug log
            event = OrganizationEvent.objects.create(
                organization=organization,
                title=title,
                description=description,
                event_date=event_datetime,
                location=location,
                activity_type=activity_type,
                max_participants=max_participants,
                attachments_url=attachment_url,
                created_by=request.user
            )
            print(f"Event created successfully: ID={event.id}, Title={event.title}")  # Debug log

            # Verify the event was saved
            saved_event = OrganizationEvent.objects.get(id=event.id)
            print(f"Event verification - Saved event: {saved_event.title} (ID: {saved_event.id})")  # Debug log

            # Check total count
            total_events = OrganizationEvent.objects.count()
            print(f"Total events in database: {total_events}")  # Debug log

        except Exception as e:
            print(f"Event creation error: {str(e)}")  # Debug log
            print(f"Error type: {type(e).__name__}")  # Debug log
            # You might want to return an error response here

        print(f"=== CREATE EVENT COMPLETED for org_id: {org_id} ===")  # Debug log
        return redirect('orgpage', org_id)

    context = {
        "organization": organization,
        "user": request.user,
    }
    return render(request, 'organization/orgpage.html', context)

@login_required
@require_POST
def rsvp_event(request, event_id):
    """Handle RSVP for an event"""
    try:
        event = get_object_or_404(OrganizationEvent, id=event_id)
        status = request.POST.get('status')

        if status not in ['going', 'not_going', 'interested']:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'error': 'Invalid status'}, status=400)
            return redirect('orgpage', org_id=event.organization.id)

        # Check if max participants reached for 'going' status
        if status == 'going' and event.max_participants:
            current_going_count = event.rsvps.filter(status='going').count()
            if current_going_count >= event.max_participants:
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': False,
                        'error': f'Maximum participants reached ({event.max_participants}). Cannot RSVP as going.'
                    }, status=400)
                # For non-AJAX requests, redirect back
                return redirect('orgpage', org_id=event.organization.id)

        # Get or create RSVP
        rsvp, created = EventRSVP.objects.get_or_create(
            user=request.user,
            event=event,
            defaults={'status': status}
        )

        if not created:
            rsvp.status = status
            rsvp.save()

        # Get updated counts
        going_count = event.rsvps.filter(status='going').count()
        interested_count = event.rsvps.filter(status='interested').count()

        # Get updated attendee list for avatars
        rsvp_users = event.rsvps.filter(status='going').select_related('user').order_by('date_created')[:5]
        attendees = []
        for rsvp in rsvp_users:
            user = rsvp.user
            attendees.append({
                'id': str(user.id),
                'name': user.get_full_name() or user.username,
                'avatar_url': user.profile_picture.url if user.profile_picture else None,
                'initials': f"{user.first_name[0] if user.first_name else ''}{user.last_name[0] if user.last_name else ''}".upper() or user.username[0].upper()
            })

        # Check if request is AJAX
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'status': status,
                'going_count': going_count,
                'interested_count': interested_count,
                'attendees': attendees
            })

        # Redirect back to org page with anchor to the event
        return redirect(f"{reverse('orgpage', args=[event.organization.id])}#event-{event.id}")

    except Exception as e:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
        # On error, redirect back
        event = get_object_or_404(OrganizationEvent, id=event_id)
        return redirect(f"{reverse('orgpage', args=[event.organization.id])}#event-{event.id}")

