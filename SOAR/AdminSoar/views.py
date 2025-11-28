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
