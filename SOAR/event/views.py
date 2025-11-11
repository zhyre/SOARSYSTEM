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
from event.models import OrganizationEvent
from organization.models import Organization
from datetime import datetime

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
