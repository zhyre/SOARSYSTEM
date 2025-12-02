from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from supabase import create_client
from decouple import config
from SOAR.organization.forms import AdminOrganizationCreateForm
from SOAR.organization.models import Organization, OrganizationMember, Program, ROLE_LEADER
from SOAR.accounts.models import User
from SOAR.event.models import OrganizationEvent, EventRSVP
from django.db.models import Count
import json
from django.views.decorators.http import require_http_methods
from django.utils.dateparse import parse_datetime, parse_date

SUPABASE_URL = config("SUPABASE_URL")
SUPABASE_KEY = config("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def admin_panel(request):
    if request.user.is_authenticated:
        response = supabase.table('accounts_user').select('is_superuser').eq('id', str(request.user.id)).execute()
        is_superuser = response.data[0]['is_superuser'] if response.data else False
        if is_superuser:
            return render(request, 'AdminSoar/AdminPanel.html')
    return render(request, 'accounts/index.html')

@login_required
def admin_create_organization(request):
    """Allow admins to create new organizations."""
    # Check if user is admin
    if not (request.user.is_superuser or request.user.is_staff):
        messages.error(request, 'Only administrators can create organizations.')
        return redirect('admin_panel')
    
    if request.method == 'POST':
        form = AdminOrganizationCreateForm(request.POST, request.FILES)
        if form.is_valid():
            # Create organization
            organization = form.save(commit=False)
            organization.save()
            
            # Assign admin as Head Officer (Leader)
            OrganizationMember.objects.create(
                organization=organization,
                student=request.user,
                role=ROLE_LEADER,
                is_approved=True
            )
            
            messages.success(
                request,
                f'Organization "{organization.name}" created successfully! You have been assigned as Head Officer.'
            )
            return redirect('organization_profile', org_id=organization.id)
        else:
            # Form has errors, they will be displayed in template
            pass
    else:
        form = AdminOrganizationCreateForm()
    
    return render(request, 'AdminSoar/create_organization.html', {
        'form': form
    })

@login_required
def get_users_data(request):
    """API endpoint to get all users data."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    users = User.objects.all().order_by('-date_joined')
    users_data = []
    
    for user in users:
        users_data.append({
            'id': str(user.id),
            'studentId': user.student_id or 'N/A',
            #'username': user.username,
            'email': user.email,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'course': user.course or 'N/A',
            'yearLevel': user.year_level or 'N/A',
            'dateJoined': user.date_joined.strftime('%b. %d, %Y') if user.date_joined else 'N/A'
        })
    
    return JsonResponse({'data': users_data})

@login_required
def get_organizations_data(request):
    """API endpoint to get all organizations data."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    organizations = Organization.objects.annotate(
        member_count=Count('members')
    ).order_by('-date_created')
    
    orgs_data = []
    for org in organizations:
        # Determine organization type based on tags
        org_type = 'Academic'
        if org.tags:
            if 'sports' in [tag.lower() for tag in org.tags]:
                org_type = 'Sports'
            elif 'cultural' in [tag.lower() for tag in org.tags]:
                org_type = 'Cultural'
            elif any(tag.lower() in ['special', 'interest'] for tag in org.tags):
                org_type = 'Special Interest'
        
        # collect allowed program abbreviations
        try:
            programs_list = [p.abbreviation for p in org.allowed_programs.all()]
        except Exception:
            programs_list = []

        orgs_data.append({
            'id': str(org.id),
            'orgName': org.name,
            'type': org_type,
            'members': str(org.member_count),
            'created': org.date_created.strftime('%b. %d, %Y') if org.date_created else 'N/A',
            'description': org.description,
            'isPublic': org.is_public,
            'programs': ', '.join(programs_list) if programs_list else '',
            'adviser': org.adviser_id or 'N/A'
        })
    
    return JsonResponse({'data': orgs_data})

@login_required
def get_organization_members_data(request):
    """API endpoint to get all organization members data."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    members = OrganizationMember.objects.filter(
        is_approved=True
    ).select_related('organization', 'student').order_by('-date_joined')
    
    members_data = []
    for member in members:
        members_data.append({
            'id': str(member.id),
            'organization': member.organization.name,
            'student': member.student.username,
            'role': member.get_role_display(),
            'dateJoined': member.date_joined.strftime('%b. %d, %Y') if member.date_joined else 'N/A',
            'status': 'Approved' if member.is_approved else 'Pending'
        })
    
    return JsonResponse({'data': members_data})

@login_required
def get_events_data(request):
    """API endpoint to get all organization events data."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    events = OrganizationEvent.objects.select_related('organization').order_by('-event_date')
    
    events_data = []
    for event in events:
        events_data.append({
            'id': str(event.id),
            'eventName': event.title,
            'organization': event.organization.name,
            'date': event.event_date.strftime('%b. %d, %Y, %I:%M %p') if event.event_date else 'N/A',
            'location': event.location or 'TBA',
            'activityType': event.get_activity_type_display(),
            'status': event.status
        })
    
    return JsonResponse({'data': events_data})

@login_required
def get_rsvps_data(request):
    """API endpoint to get all event RSVPs data."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    # include event's organization to avoid N+1 queries
    rsvps = EventRSVP.objects.select_related('event__organization', 'user').order_by('-date_created')
    
    rsvps_data = []
    for rsvp in rsvps:
        org_name = ''
        try:
            org_name = rsvp.event.organization.name if (rsvp.event and rsvp.event.organization) else ''
        except Exception:
            org_name = ''

        rsvps_data.append({
            'id': str(rsvp.id),
            'eventName': rsvp.event.title,
            'organization': org_name,
            'student': rsvp.user.username,
            'status': rsvp.get_status_display(),
            'rsvpDate': rsvp.date_created.strftime('%b. %d, %Y') if rsvp.date_created else 'N/A'
        })
    
    return JsonResponse({'data': rsvps_data})

@login_required
def get_programs_data(request):
    """API endpoint to get all programs data."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    programs = Program.objects.all().order_by('abbreviation')
    
    programs_data = []
    for program in programs:
        # Count students with this program in their course field
        student_count = User.objects.filter(course__icontains=program.abbreviation).count()
        
        programs_data.append({
            'id': str(program.id),
            'programName': program.name,
            'code': program.abbreviation,
            'department': 'CCS',  # You may want to add a department field to Program model
            'students': str(student_count)
        })
    
    return JsonResponse({'data': programs_data})


@login_required
@require_http_methods(["DELETE", "PATCH", "PUT"])
def delete_user(request, user_id):
    """API endpoint to delete a user by id."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    # Prevent deleting self via admin UI
    if request.method == 'DELETE':
        if str(request.user.id) == str(user_id):
            return JsonResponse({'error': 'Cannot delete the currently logged-in user.'}, status=400)

        try:
            user = User.objects.filter(id=user_id).first()
            if not user:
                return JsonResponse({'error': 'User not found.'}, status=404)

            user.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    # Handle PATCH/PUT -> update user fields
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        payload = {}

    try:
        user = User.objects.filter(id=user_id).first()
        if not user:
            return JsonResponse({'error': 'User not found.'}, status=404)

        # map frontend fields to model fields
        if 'studentId' in payload:
            user.student_id = payload.get('studentId') or None
        if 'firstName' in payload:
            user.first_name = payload.get('firstName')
        if 'lastName' in payload:
            user.last_name = payload.get('lastName')
        if 'email' in payload:
            user.email = payload.get('email')
        if 'course' in payload:
            user.course = payload.get('course')
        if 'yearLevel' in payload:
            try:
                user.year_level = int(payload.get('yearLevel')) if payload.get('yearLevel') not in [None, ''] else None
            except Exception:
                pass
        # password update (optional)
        if 'password' in payload and payload.get('password'):
            user.set_password(payload.get('password'))

        user.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@require_http_methods(["DELETE", "PATCH", "PUT"])
def delete_rsvp(request, rsvp_id):
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'DELETE':
        try:
            rsvp = EventRSVP.objects.filter(id=rsvp_id).first()
            if not rsvp:
                return JsonResponse({'error': 'RSVP not found.'}, status=404)
            rsvp.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    # PATCH -> update RSVP
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        payload = {}

    try:
        rsvp = EventRSVP.objects.filter(id=rsvp_id).first()
        if not rsvp:
            return JsonResponse({'error': 'RSVP not found.'}, status=404)

        if 'status' in payload:
            rsvp.status = payload.get('status')
        rsvp.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@require_http_methods(["DELETE", "PATCH", "PUT"])
def delete_event(request, event_id):
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'DELETE':
        try:
            event = OrganizationEvent.objects.filter(id=event_id).first()
            if not event:
                return JsonResponse({'error': 'Event not found.'}, status=404)
            event.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    # PATCH -> update event
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        payload = {}

    try:
        event = OrganizationEvent.objects.filter(id=event_id).first()
        if not event:
            return JsonResponse({'error': 'Event not found.'}, status=404)

        if 'eventName' in payload:
            event.title = payload.get('eventName')
        if 'location' in payload:
            event.location = payload.get('location')
        if 'description' in payload:
            event.description = payload.get('description')
        if 'date' in payload and payload.get('date'):
            dt = parse_datetime(payload.get('date')) or parse_date(payload.get('date'))
            if dt:
                event.event_date = dt
        if 'activityType' in payload:
            event.activity_type = payload.get('activityType')
        if 'cancelled' in payload:
            event.cancelled = bool(payload.get('cancelled'))

        event.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@require_http_methods(["DELETE", "PATCH", "PUT"])
def delete_org_member(request, member_id):
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'DELETE':
        try:
            member = OrganizationMember.objects.filter(id=member_id).first()
            if not member:
                return JsonResponse({'error': 'Organization member not found.'}, status=404)
            member.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    # PATCH -> update member (e.g., role)
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        payload = {}

    try:
        member = OrganizationMember.objects.filter(id=member_id).first()
        if not member:
            return JsonResponse({'error': 'Organization member not found.'}, status=404)

        if 'role' in payload:
            member.role = payload.get('role')
        if 'isApproved' in payload:
            member.is_approved = bool(payload.get('isApproved'))
        member.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@require_http_methods(["DELETE", "PATCH", "PUT"])
def delete_organization(request, org_id):
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'DELETE':
        try:
            org = Organization.objects.filter(id=org_id).first()
            if not org:
                return JsonResponse({'error': 'Organization not found.'}, status=404)
            org.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    # PATCH -> update org
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        payload = {}

    try:
        org = Organization.objects.filter(id=org_id).first()
        if not org:
            return JsonResponse({'error': 'Organization not found.'}, status=404)

        if 'orgName' in payload:
            org.name = payload.get('orgName')
        if 'description' in payload:
            org.description = payload.get('description')
        if 'isPublic' in payload:
            org.is_public = bool(payload.get('isPublic'))
        if 'adviser' in payload and payload.get('adviser'):
            try:
                adviser_user = User.objects.get(id=payload.get('adviser'))
                org.adviser = adviser_user
            except User.DoesNotExist:
                pass  # Invalid adviser ID, skip
        if 'programs' in payload:
            programs_str = payload.get('programs', '')
            if programs_str:
                program_codes = [p.strip() for p in programs_str.split(',') if p.strip()]
                programs = Program.objects.filter(abbreviation__in=program_codes)
                org.allowed_programs.set(programs)
            else:
                org.allowed_programs.clear()
        org.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
@require_http_methods(["DELETE", "PATCH", "PUT"])
def delete_program(request, program_id):
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'DELETE':
        try:
            program = Program.objects.filter(id=program_id).first()
            if not program:
                return JsonResponse({'error': 'Program not found.'}, status=404)
            program.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    # PATCH -> update program
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        payload = {}

    try:
        program = Program.objects.filter(id=program_id).first()
        if not program:
            return JsonResponse({'error': 'Program not found.'}, status=404)

        if 'programName' in payload:
            program.name = payload.get('programName')
        if 'code' in payload:
            program.abbreviation = payload.get('code')
        program.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
