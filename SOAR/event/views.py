from django.shortcuts import render

from supabase import create_client
from django.conf import settings
import uuid

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

from django.utils.text import slugify

def upload_to_supabase(file, org_id, org_name):
    filename = f"{uuid.uuid4()}_{file.name}"
    bucket = "event_attachments"

    # Combine UUID and slugified name for folder
    folder = f"{org_id}_{slugify(org_name)}"
    file_path = f"{folder}/{filename}"

    file_bytes = file.read()
    supabase.storage.from_(bucket).upload(file_path, file_bytes)

    return supabase.storage.from_(bucket).get_public_url(file_path)


from django.shortcuts import render, redirect, get_object_or_404
from event.models import OrganizationEvent
from organization.models import Organization
from datetime import datetime

def create_event(request, org_id):
    organization = get_object_or_404(Organization, id=org_id)

    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        date = request.POST.get('date')
        time = request.POST.get('time')
        location = request.POST.get('location')
        activity_type = request.POST.get('type')
        max_participants = request.POST.get('max_participants') or None

        file_list = request.FILES.getlist('attachment')
        file = file_list[0] if file_list else None

        event_datetime = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
        attachment_url = upload_to_supabase(file, org_id, organization.name) if file else None

        OrganizationEvent.objects.create(
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

        return redirect('orgpage', org_id)

    context = {
        "organization": organization,
        "user": request.user,
    }
    return render(request, 'organization/orgpage.html', context)
