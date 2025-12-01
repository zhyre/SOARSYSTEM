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
        
        orgs_data.append({
            'id': str(org.id),
            'orgName': org.name,
            'type': org_type,
            'members': str(org.member_count),
            'created': org.date_created.strftime('%b. %d, %Y') if org.date_created else 'N/A',
            'description': org.description,
            'isPublic': org.is_public
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
            'dateJoined': member.date_joined.strftime('%b. %d, %Y') if member.date_joined else 'N/A'
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
    
    rsvps = EventRSVP.objects.select_related('event', 'user').order_by('-date_created')
    
    rsvps_data = []
    for rsvp in rsvps:
        rsvps_data.append({
            'id': str(rsvp.id),
            'eventName': rsvp.event.title,
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
