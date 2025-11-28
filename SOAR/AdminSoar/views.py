from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import JsonResponse
from supabase import create_client
from decouple import config
from SOAR.organization.forms import AdminOrganizationCreateForm
from SOAR.organization.models import Organization, OrganizationMember, ROLE_LEADER
from SOAR.accounts.models import User
from SOAR.event.models import EventRSVP, OrganizationEvent
from SOAR.organization.models import Program

# Activity type choices mapping
ACTIVITY_TYPE_CHOICES = {
    'workshop': 'Workshop',
    'seminar': 'Seminar',
    'meeting': 'Meeting',
    'social': 'Social Event',
    'other': 'Other',
}

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
def admin_users(request):
    """API endpoint for user data - returns JSON for AJAX requests."""
    # Check if user is admin
    if not (request.user.is_superuser or request.user.is_staff):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        messages.error(request, 'Only administrators can access user management.')
        return redirect('admin_panel')

    try:
        # Get query parameters
        search_query = request.GET.get('search', '')
        status_filter = request.GET.get('status', '')
        program_filter = request.GET.get('program', '')
        page_number = int(request.GET.get('page', 1))

        # Build query for Supabase
        query = supabase.table('accounts_user').select('*')

        # Apply search filter
        if search_query:
            search_pattern = f"*{search_query}*"
            query = query.or_(f"username.ilike.{search_pattern},email.ilike.{search_pattern},first_name.ilike.{search_pattern},last_name.ilike.{search_pattern}")

        # Apply status filter
        if status_filter:
            if status_filter == 'active':
                query = query.eq('is_active', True)
            elif status_filter == 'inactive':
                query = query.eq('is_active', False)

        # Apply program filter (course field)
        if program_filter:
            query = query.ilike('course', f'*{program_filter}*')

        # Execute query
        response = query.execute()

        if response.data is None:
            users = []
        else:
            users = response.data

        # Sort users by date_joined descending (newest first)
        users.sort(key=lambda x: x.get('date_joined', ''), reverse=True)

        # Pagination
        paginator = Paginator(users, 50)  # 50 users per page
        page_obj = paginator.get_page(page_number)

        # Get unique programs for filter dropdown
        all_users_response = supabase.table('accounts_user').select('course').execute()
        programs = set()
        if all_users_response.data:
            for user in all_users_response.data:
                if user.get('course'):
                    programs.add(user['course'])
        programs = sorted(list(programs))

        # If AJAX request, return JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            users_data = []
            for user in page_obj:
                users_data.append({
                    'id': str(user['id'])[:8] + '...' if len(str(user['id'])) > 8 else str(user['id']),
                    'username': user.get('username', ''),
                    'email': user.get('email', ''),
                    'date_joined': user.get('date_joined', '')[:10] if user.get('date_joined') else 'N/A',
                    'course': user.get('course', 'N/A'),
                    'is_active': user.get('is_active', False)
                })

            return JsonResponse({
                'users': users_data,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages,
                'programs': list(programs)
            })

        # Regular request - redirect to admin panel (users section will load via AJAX)
        return redirect('admin_panel')

    except Exception as e:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': str(e)}, status=500)

        messages.error(request, f'Error retrieving users: {str(e)}')
        return redirect('admin_panel')

@login_required
def admin_event_rsvps(request):
    """API endpoint for event RSVP data - returns JSON for AJAX requests."""
    # Check if user is admin
    if not (request.user.is_superuser or request.user.is_staff):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        messages.error(request, 'Only administrators can access event RSVP management.')
        return redirect('admin_panel')

    try:
        # Get query parameters
        search_query = request.GET.get('search', '')
        status_filter = request.GET.get('status', '')
        page_number = int(request.GET.get('page', 1))

        # Build Django ORM query
        rsvps_queryset = EventRSVP.objects.select_related('event__organization', 'user').all()

        # Apply search filter
        if search_query:
            rsvps_queryset = rsvps_queryset.filter(
                Q(event__title__icontains=search_query) |
                Q(user__username__icontains=search_query) |
                Q(user__email__icontains=search_query)
            )

        # Apply status filter
        if status_filter:
            rsvps_queryset = rsvps_queryset.filter(status=status_filter)

        # Sort RSVPs by date_created descending (newest first)
        rsvps_queryset = rsvps_queryset.order_by('-date_created')

        # Pagination
        paginator = Paginator(rsvps_queryset, 50)  # 50 RSVPs per page
        page_obj = paginator.get_page(page_number)

        # Get unique statuses for filter dropdown
        statuses = EventRSVP.objects.values_list('status', flat=True).distinct()
        statuses = sorted(list(set(statuses)))

        # If AJAX request, return JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            rsvps_data = []
            for rsvp in page_obj:
                rsvps_data.append({
                    'id': str(rsvp.id)[:8] + '...' if len(str(rsvp.id)) > 8 else str(rsvp.id),
                    'event_name': rsvp.event.title,
                    'organization': rsvp.event.organization.name,
                    'student': rsvp.user.username,
                    'status': rsvp.status,
                    'status_display': rsvp.get_status_display(),
                    'rsvp_date': rsvp.date_created.strftime('%Y-%m-%d') if rsvp.date_created else 'N/A'
                })

            return JsonResponse({
                'rsvps': rsvps_data,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages,
                'statuses': statuses
            })

        # Regular request - redirect to admin panel (event-rsvps section will load via AJAX)
        return redirect('admin_panel')

    except Exception as e:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': str(e)}, status=500)

        messages.error(request, f'Error retrieving event RSVPs: {str(e)}')
        return redirect('admin_panel')

@login_required
def admin_organization_members(request):
    """API endpoint for organization members data - returns JSON for AJAX requests."""
    # Check if user is admin
    if not (request.user.is_superuser or request.user.is_staff):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        messages.error(request, 'Only administrators can access organization members management.')
        return redirect('admin_panel')

    try:
        # Get query parameters
        search_query = request.GET.get('search', '')
        status_filter = request.GET.get('status', '')
        page_number = int(request.GET.get('page', 1))

        # Build Django ORM query
        members_queryset = OrganizationMember.objects.select_related('organization', 'student').all()

        # Apply search filter
        if search_query:
            members_queryset = members_queryset.filter(
                Q(organization__name__icontains=search_query) |
                Q(student__username__icontains=search_query) |
                Q(student__email__icontains=search_query)
            )

        # Apply status filter (is_approved)
        if status_filter:
            if status_filter == 'approved':
                members_queryset = members_queryset.filter(is_approved=True)
            elif status_filter == 'pending':
                members_queryset = members_queryset.filter(is_approved=False)

        # Sort members by date_joined descending (newest first)
        members_queryset = members_queryset.order_by('-date_joined')

        # Pagination
        paginator = Paginator(members_queryset, 50)  # 50 members per page
        page_obj = paginator.get_page(page_number)

        # Get unique statuses for filter dropdown
        statuses = OrganizationMember.objects.values_list('is_approved', flat=True).distinct()
        status_choices = ['approved' if s else 'pending' for s in statuses]
        statuses = sorted(list(set(status_choices)))

        # If AJAX request, return JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            members_data = []
            for member in page_obj:
                members_data.append({
                    'id': str(member.id)[:8] + '...' if len(str(member.id)) > 8 else str(member.id),
                    'organization': member.organization.name,
                    'student': member.student.username,
                    'role': member.get_role_display(),
                    'date_joined': member.date_joined.strftime('%Y-%m-%d') if member.date_joined else 'N/A',
                    'is_approved': 'Approved' if member.is_approved else 'Pending'
                })

            return JsonResponse({
                'members': members_data,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages,
                'statuses': statuses
            })

        # Regular request - redirect to admin panel (organization-members section will load via AJAX)
        return redirect('admin_panel')

    except Exception as e:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': str(e)}, status=500)

        messages.error(request, f'Error retrieving organization members: {str(e)}')
        return redirect('admin_panel')

@login_required
def admin_organizations(request):
    """API endpoint for organizations data - returns JSON for AJAX requests."""
    # Check if user is admin
    if not (request.user.is_superuser or request.user.is_staff):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        messages.error(request, 'Only administrators can access organization management.')
        return redirect('admin_panel')

    try:
        # Get query parameters
        search_query = request.GET.get('search', '')
        page_number = int(request.GET.get('page', 1))

        # Build Django ORM query
        organizations_queryset = Organization.objects.select_related('adviser').prefetch_related('members', 'allowed_programs').all()

        # Apply search filter
        if search_query:
            organizations_queryset = organizations_queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(adviser__username__icontains=search_query)
            )

        # Sort organizations by date_created descending (newest first)
        organizations_queryset = organizations_queryset.order_by('-date_created')

        # Pagination
        paginator = Paginator(organizations_queryset, 50)  # 50 organizations per page
        page_obj = paginator.get_page(page_number)

        # If AJAX request, return JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            organizations_data = []
            for org in page_obj:
                organizations_data.append({
                    'id': str(org.id)[:8] + '...' if len(str(org.id)) > 8 else str(org.id),
                    'org_name': org.name,
                    'type': 'Academic',  # Could be derived from tags or other logic
                    'members': org.members.count(),
                    'adviser': org.adviser.username if org.adviser else 'N/A',
                    'is_public': 'Public' if org.is_public else 'Private',
                    'programs': ', '.join([program.abbreviation for program in org.allowed_programs.all()]) if org.allowed_programs.exists() else 'All Programs',
                    'created': org.date_created.strftime('%Y-%m-%d') if org.date_created else 'N/A'
                })

            return JsonResponse({
                'organizations': organizations_data,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages
            })

        # Regular request - redirect to admin panel (organizations section will load via AJAX)
        return redirect('admin_panel')

    except Exception as e:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': str(e)}, status=500)

        messages.error(request, f'Error retrieving organizations: {str(e)}')
        return redirect('admin_panel')

@login_required
def admin_programs(request):
    """API endpoint for programs data - returns JSON for AJAX requests."""
    # Check if user is admin
    if not (request.user.is_superuser or request.user.is_staff):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        messages.error(request, 'Only administrators can access program management.')
        return redirect('admin_panel')

    try:
        # Get query parameters
        search_query = request.GET.get('search', '')
        page_number = int(request.GET.get('page', 1))

        # Build Django ORM query
        programs_queryset = Program.objects.all()

        # Apply search filter
        if search_query:
            programs_queryset = programs_queryset.filter(
                Q(abbreviation__icontains=search_query) |
                Q(name__icontains=search_query)
            )

        # Sort programs by abbreviation
        programs_queryset = programs_queryset.order_by('abbreviation')

        # Pagination
        paginator = Paginator(programs_queryset, 50)  # 50 programs per page
        page_obj = paginator.get_page(page_number)

        # If AJAX request, return JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            programs_data = []
            for program in page_obj:
                # Count students in this program
                student_count = User.objects.filter(course=program.abbreviation).count()

                programs_data.append({
                    'id': str(program.id)[:8] + '...' if len(str(program.id)) > 8 else str(program.id),
                    'abbreviation': program.abbreviation,
                    'name': program.name,
                    'students': student_count
                })

            return JsonResponse({
                'programs': programs_data,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages
            })

        # Regular request - redirect to admin panel (programs section will load via AJAX)
        return redirect('admin_panel')

    except Exception as e:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': str(e)}, status=500)

        messages.error(request, f'Error retrieving programs: {str(e)}')
        return redirect('admin_panel')

@login_required
def admin_organization_events(request):
    """API endpoint for organization events data - returns JSON for AJAX requests."""
    # Check if user is admin
    if not (request.user.is_superuser or request.user.is_staff):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        messages.error(request, 'Only administrators can access organization events management.')
        return redirect('admin_panel')

    try:
        # Get query parameters
        search_query = request.GET.get('search', '')
        page_number = int(request.GET.get('page', 1))

        # Build Django ORM query
        events_queryset = OrganizationEvent.objects.select_related('organization', 'created_by').all()

        # Apply search filter
        if search_query:
            events_queryset = events_queryset.filter(
                Q(title__icontains=search_query) |
                Q(organization__name__icontains=search_query) |
                Q(location__icontains=search_query)
            )

        # Sort events by event_date descending (newest first)
        events_queryset = events_queryset.order_by('-event_date')

        # Pagination
        paginator = Paginator(events_queryset, 50)  # 50 events per page
        page_obj = paginator.get_page(page_number)

        # If AJAX request, return JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            events_data = []
            for event in page_obj:
                events_data.append({
                        'id': str(event.id)[:8] + '...' if len(str(event.id)) > 8 else str(event.id),
                        'event_name': event.title,
                        'organization': event.organization.name,
                        'event_date': event.event_date.strftime('%Y-%m-%d %H:%M') if event.event_date else 'N/A',
                        'location': event.location or 'N/A',
                        'description': event.description or 'N/A',
                        'activity_type': ACTIVITY_TYPE_CHOICES.get(event.activity_type, event.activity_type),
                        'participants': event.rsvps.count(),  # Count of RSVPs
                        'status': event.status
                    })

            return JsonResponse({
                'events': events_data,
                'total_count': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages
            })

        # Regular request - redirect to admin panel (organization-events section will load via AJAX)
        return redirect('admin_panel')

    except Exception as e:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': str(e)}, status=500)

        messages.error(request, f'Error retrieving organization events: {str(e)}')
        return redirect('admin_panel')
