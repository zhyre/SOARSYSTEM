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
from SOAR.notification.models import Notification
from django.db.models import Count
import json
from django.views.decorators.http import require_http_methods
from django.utils.dateparse import parse_datetime, parse_date

SUPABASE_URL = config("SUPABASE_URL")
SUPABASE_KEY = config("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = config("SUPABASE_SERVICE_ROLE_KEY", default=None)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Create a service role client for admin operations (deleting users from auth)
if SUPABASE_SERVICE_ROLE_KEY:
    supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
else:
    supabase_admin = supabase  # Fallback to regular client if service role key not provided

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
            
            # Save many-to-many relationships (allowed_programs)
            form.save_m2m()
            
            # Assign admin as Head Officer (Leader)
            OrganizationMember.objects.create(
                organization=organization,
                student=request.user,
                role=ROLE_LEADER,
                is_approved=True
            )
            
            # Send notifications based on organization visibility
            notifications = []
            org_link = f"/organization/{organization.id}/"
            message = f"🎉 New organization '{organization.name}' has been created! Check it out and join if you're interested."
            
            if organization.is_public:
                # Public organization: notify all users
                all_users = User.objects.filter(is_active=True).exclude(id=request.user.id)
                for user in all_users:
                    notifications.append(Notification(
                        user=user,
                        message=message,
                        notification_type=Notification.TYPE_ORGANIZATION,
                        priority=Notification.PRIORITY_MEDIUM,
                        link=org_link
                    ))
            else:
                # Private organization: notify users from allowed programs
                allowed_programs = organization.allowed_programs.all()
                if allowed_programs.exists():
                    eligible_users = User.objects.filter(
                        course__in=allowed_programs,
                        is_active=True
                    ).exclude(id=request.user.id)
                    
                    for user in eligible_users:
                        notifications.append(Notification(
                            user=user,
                            message=message,
                            notification_type=Notification.TYPE_ORGANIZATION,
                            priority=Notification.PRIORITY_MEDIUM,
                            link=org_link
                        ))
            
            # Bulk create notifications for efficiency
            if notifications:
                Notification.objects.bulk_create(notifications)
                print(f"Created {len(notifications)} notifications for new organization: {organization.name}")
            
            messages.success(
                request,
                f'Organization "{organization.name}" created successfully! You have been assigned as Head Officer.'
            )
            return redirect('admin_panel')
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
    """API endpoint to get all users data, and add new users via POST."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            data = {}

        # Validate required fields
        errors = {}
        email = (data.get('email') or '').strip()
        first_name = (data.get('firstName') or '').strip()
        last_name = (data.get('lastName') or '').strip()
        password = data.get('password') or ''
        role = (data.get('role') or '').strip().lower()

        if not email:
            errors['email'] = 'Email is required.'
        if not first_name:
            errors['firstName'] = 'First name is required.'
        if not last_name:
            errors['lastName'] = 'Last name is required.'
        if not password:
            errors['password'] = 'Password is required for new users.'
        if not role:
            errors['role'] = 'Role is required.'
        elif role not in ['student', 'staff', 'admin']:
            errors['role'] = 'Invalid role. Must be student, staff, or admin.'

        # Check email uniqueness
        if not errors and User.objects.filter(email=email).exists():
            errors['email'] = 'Email already exists.'

        if errors:
            return JsonResponse({'success': False, 'errors': errors}, status=400)

        # Create user in Supabase auth first
        try:
            response = supabase.auth.sign_up({
                "email": email,
                "password": password
            })
        except Exception as e:
            error_message = str(e)
            if "already registered" in error_message.lower() or "already exists" in error_message.lower():
                errors['email'] = 'An account with this email already exists.'
            else:
                errors['email'] = f"Supabase registration failed: {error_message}"
            return JsonResponse({'success': False, 'errors': errors}, status=400)

        # Extract user ID from Supabase response
        user_attr = None
        try:
            if getattr(response, "user", None):
                user_attr = response.user
            elif isinstance(response, dict):
                if response.get("user"):
                    user_attr = response.get("user")
                elif isinstance(response.get("data"), dict) and response["data"].get("user"):
                    user_attr = response["data"].get("user")
                elif response.get("data"):
                    user_attr = response.get("data")
            else:
                data_attr = getattr(response, "data", None)
                if data_attr and isinstance(data_attr, dict):
                    user_attr = data_attr.get("user") or data_attr
        except Exception:
            user_attr = None

        if not user_attr:
            errors['email'] = 'Failed to create user in authentication system.'
            return JsonResponse({'success': False, 'errors': errors}, status=400)

        # Extract ID
        if hasattr(user_attr, "id"):
            supa_user_id = user_attr.id
        elif isinstance(user_attr, dict) and user_attr.get("id"):
            supa_user_id = user_attr.get("id")
        else:
            supa_user_id = str(user_attr)

        # Handle course/program lookup
        program = None
        if data.get('course'):
            try:
                # Try to find program by code or name
                course_input = data.get('course').strip()
                program = Program.objects.filter(abbreviation=course_input).first() or \
                         Program.objects.filter(name=course_input).first()
            except Exception as e:
                print(f"Warning: Could not lookup program {data.get('course')}: {str(e)}")
                program = None

        # Create Django user
        try:
            user = User.objects.get(pk=supa_user_id)
            user.username = email.split("@")[0]
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.student_id = data.get('studentId') or None
            user.course = program
            if data.get('yearLevel'):
                try:
                    user.year_level = int(data.get('yearLevel'))
                except ValueError:
                    pass
        except User.DoesNotExist:
            user = User(
                id=supa_user_id,
                username=email.split("@")[0],
                email=email,
                first_name=first_name,
                last_name=last_name,
                student_id=data.get('studentId') or None,
                course=program,
            )
            if data.get('yearLevel'):
                try:
                    user.year_level = int(data.get('yearLevel'))
                except ValueError:
                    pass

        # Set role based on the role field
        if role == 'admin':
            user.is_superuser = True
            user.is_staff = True
        elif role == 'staff':
            user.is_superuser = False
            user.is_staff = True
        else:  # student
            user.is_superuser = False
            user.is_staff = False

        user.is_active = False
        user.set_unusable_password()
        user.save()

        return JsonResponse({'success': True, 'id': str(user.id)})

    # GET: list users
    users = User.objects.all().order_by('-date_joined')
    users_data = []

    for user in users:
        course_display = None
        if user.course:
            # Prefer the abbreviation (e.g., BSIT); fall back to name if needed
            course_display = getattr(user.course, 'abbreviation', None) or getattr(user.course, 'name', None)

        # Determine user role
        if user.is_superuser:
            role = 'Admin'
        elif user.is_staff:
            role = 'Staff'
        else:
            role = 'Student'
        
        # Determine user status
        status = 'Active' if user.is_active else 'Inactive'
        
        users_data.append({
            'id': str(user.id),
            'studentId': user.student_id or 'N/A',
            #'username': user.username,
            'email': user.email,
            'course': course_display or 'N/A',
            'yearLevel': user.year_level if user.year_level is not None else 'N/A',
            'role': role,
            'status': status,
            'dateJoined': user.date_joined.strftime('%b. %d, %Y') if user.date_joined else 'N/A'
        })

    return JsonResponse({'data': users_data})

@login_required
def get_user_details(request, user_id):
    """API endpoint to get detailed information for a specific user."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
    # Get course information
    course_display = None
    course_name = None
    if user.course:
        course_display = getattr(user.course, 'abbreviation', None) or getattr(user.course, 'name', None)
        course_name = getattr(user.course, 'name', None)
    
    # Determine user role
    if user.is_superuser:
        role = 'Admin'
    elif user.is_staff:
        role = 'Staff'
    else:
        role = 'Student'
    
    # Determine user status
    status = 'Active' if user.is_active else 'Inactive'
    
    # Get profile picture URL (ensure JSON-serializable string)
    profile_picture_url = None
    if user.profile_picture:
        try:
            profile_picture_url = user.profile_picture.url
        except Exception:
            # Fallback to the stored value as a string if .url is unavailable
            profile_picture_url = str(user.profile_picture)
    
    user_details = {
        'id': str(user.id),
        'studentId': user.student_id or 'N/A',
        'username': user.username,
        'email': user.email,
        'firstName': user.first_name or 'N/A',
        'lastName': user.last_name or 'N/A',
        'courseAbbreviation': course_display or 'N/A',
        'courseName': course_name or 'N/A',
        'yearLevel': user.year_level if user.year_level is not None else 'N/A',
        'role': role,
        'status': status,
        'isActive': user.is_active,
        'dateJoined': user.date_joined.strftime('%B %d, %Y at %I:%M %p') if user.date_joined else 'N/A',
        'lastLogin': user.last_login.strftime('%B %d, %Y at %I:%M %p') if user.last_login else 'Never',
        'profilePicture': profile_picture_url
    }
    
    return JsonResponse(user_details)

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

        # Get adviser full name
        adviser_name = 'N/A'
        if org.adviser:
            adviser_name = f"{org.adviser.first_name} {org.adviser.last_name}".strip()
            if not adviser_name:
                adviser_name = org.adviser.username

        orgs_data.append({
            'id': str(org.id),
            'orgName': org.name,
            'type': org_type,
            'members': str(org.member_count),
            'created': org.date_created.strftime('%b. %d, %Y') if org.date_created else 'N/A',
            'description': org.description,
            'isPublic': org.is_public,
            'programs': ', '.join(programs_list) if programs_list else '',
            'adviser': adviser_name
        })
    
    return JsonResponse({'data': orgs_data})

@login_required
def get_organization_details(request, org_id):
    """API endpoint to get detailed information for a specific organization."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    try:
        org = Organization.objects.select_related('adviser').prefetch_related('allowed_programs', 'members').get(id=org_id)
    except Organization.DoesNotExist:
        return JsonResponse({'error': 'Organization not found'}, status=404)

    # Determine organization type
    org_type = 'Academic'
    if org.tags:
        if 'sports' in [tag.lower() for tag in org.tags]:
            org_type = 'Sports'
        elif 'cultural' in [tag.lower() for tag in org.tags]:
            org_type = 'Cultural'
        elif any(tag.lower() in ['special', 'interest'] for tag in org.tags):
            org_type = 'Special Interest'

    # Collect allowed program names
    programs_list = [p.name for p in org.allowed_programs.all()]

    # Get adviser info
    adviser_info = None
    if org.adviser:
        adviser_info = {
            'id': str(org.adviser.id),
            'name': f"{org.adviser.first_name} {org.adviser.last_name}".strip() or org.adviser.username,
            'email': org.adviser.email,
            'username': org.adviser.username
        }

    # Count members by role
    members_by_role = {
        'leader': org.members.filter(role='leader').count(),
        'officer': org.members.filter(role='officer').count(),
        'member': org.members.filter(role='member').count(),
        'adviser': org.members.filter(role='adviser').count()
    }
    total_members = sum(members_by_role.values())

    details = {
        'id': str(org.id),
        'name': org.name,
        'description': org.description or '',
        'type': org_type,
        'isPublic': org.is_public,
        'dateCreated': org.date_created.strftime('%B %d, %Y') if org.date_created else 'N/A',
        'programs': programs_list,
        'adviser': adviser_info,
        'memberCounts': members_by_role,
        'totalMembers': total_members,
        'tags': org.tags or []
    }

    return JsonResponse(details)

@login_required
def get_organization_members_data(request):
    """API endpoint to get all organization members data, and add new members via POST."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            data = {}

        # Validate required fields
        errors = {}
        org_name = (data.get('organization') or '').strip()
        student_email = (data.get('student') or '').strip()
        role = (data.get('role') or '').strip() or 'member'
        is_approved = bool(data.get('isApproved'))

        if not org_name:
            errors['organization'] = 'Organization is required.'
        if not student_email:
            errors['student'] = 'Student email is required.'

        # Find organization
        org = Organization.objects.filter(name=org_name).first()
        if not org:
            errors['organization'] = 'Organization not found.'

        # Find user
        user = User.objects.filter(email=student_email).first()
        if not user:
            errors['student'] = 'User not found.'

        # Prevent duplicate: same org and student
        if not errors and OrganizationMember.objects.filter(organization=org, student=user).exists():
            errors['duplicate'] = 'This user is already a member of this organization.'

        if errors:
            return JsonResponse({'success': False, 'errors': errors}, status=400)

        # Create member
        member = OrganizationMember.objects.create(
            organization=org,
            student=user,
            role=role,
            is_approved=is_approved
        )

        return JsonResponse({'success': True, 'id': str(member.id)})

    # GET: list members
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
def get_organization_member_details(request, member_id):
    """API endpoint to get detailed information for a specific organization member."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    try:
        member = OrganizationMember.objects.select_related(
            'organization',
            'student',
            'student__course'
        ).get(id=member_id)
    except OrganizationMember.DoesNotExist:
        return JsonResponse({'error': 'Member not found'}, status=404)

    org = member.organization
    user = member.student

    # Course info
    course_abbr = None
    course_name = None
    if getattr(user, 'course', None):
        course_abbr = getattr(user.course, 'abbreviation', None) or getattr(user.course, 'name', None)
        course_name = getattr(user.course, 'name', None)

    profile_picture_url = None
    if getattr(user, 'profile_picture', None):
        try:
            profile_picture_url = user.profile_picture.url
        except Exception:
            profile_picture_url = str(user.profile_picture)

    details = {
        'id': str(member.id),
        'role': member.get_role_display(),
        'status': 'Approved' if member.is_approved else 'Pending',
        'dateJoined': member.date_joined.strftime('%B %d, %Y at %I:%M %p') if member.date_joined else 'N/A',
        'organization': {
            'id': str(org.id) if org else None,
            'name': org.name if org else 'N/A',
            'description': org.description if org else '',
            'isPublic': org.is_public if org else False,
        },
        'user': {
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'firstName': user.first_name or 'N/A',
            'lastName': user.last_name or 'N/A',
            'studentId': getattr(user, 'student_id', None) or 'N/A',
            'courseAbbreviation': course_abbr or 'N/A',
            'courseName': course_name or 'N/A',
            'yearLevel': getattr(user, 'year_level', None) if getattr(user, 'year_level', None) is not None else 'N/A',
            'profilePicture': profile_picture_url,
        }
    }

    return JsonResponse(details)

@login_required
def get_events_data(request):
    """API endpoint to get all organization events data, and add new events via POST."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            data = {}

        # Validate required fields
        errors = {}
        title = (data.get('eventName') or '').strip()
        org_name = (data.get('organization') or '').strip()
        date_str = (data.get('date') or '').strip()
        location = (data.get('location') or '').strip()
        activity_type = (data.get('activityType') or '').strip() or 'other'
        description = (data.get('description') or '').strip()
        cancelled = bool(data.get('cancelled'))

        if not title:
            errors['eventName'] = 'Event name is required.'
        if not org_name:
            errors['organization'] = 'Organization is required.'
        if not date_str:
            errors['date'] = 'Event date is required.'

        from django.utils.dateparse import parse_datetime
        event_date = parse_datetime(date_str)
        if not event_date:
            errors['date'] = 'Invalid date format.'

        # Find organization
        org = Organization.objects.filter(name=org_name).first()
        if not org:
            errors['organization'] = 'Organization not found.'

        # Prevent duplicate: same org, title, and date
        if not errors and OrganizationEvent.objects.filter(organization=org, title=title, event_date=event_date).exists():
            errors['duplicate'] = 'An event with this name and date already exists for this organization.'

        if errors:
            return JsonResponse({'success': False, 'errors': errors}, status=400)

        # Create event in Django DB
        event = OrganizationEvent.objects.create(
            organization=org,
            title=title,
            event_date=event_date,
            location=location,
            activity_type=activity_type,
            description=description,
            cancelled=cancelled,
            created_by=request.user
        )

        # Create notifications for all approved organization members
        approved_members = OrganizationMember.objects.filter(
            organization=org,
            is_approved=True
        ).select_related('student')

        event_date_str = event_date.strftime("%B %d, %Y at %I:%M %p")
        message = f"📅 New event '{title}' has been created in {org.name}! Event date: {event_date_str}. Location: {location or 'TBA'}."
        event_link = f"/event/{event.id}/"
        
        notifications = []
        for member in approved_members:
            notifications.append(Notification(
                user=member.student,
                message=message,
                notification_type=Notification.TYPE_EVENT,
                priority=Notification.PRIORITY_MEDIUM,
                link=event_link
            ))

        # Bulk create notifications for efficiency
        if notifications:
            Notification.objects.bulk_create(notifications)
            print(f"Created {len(notifications)} notifications for admin-created event: {event.title}")

        # Sync to Supabase
        try:
            supabase_payload = {
                'id': str(event.id),
                'organization_id': str(org.id),
                'title': title,
                'event_date': event_date.isoformat(),
                'location': location,
                'activity_type': activity_type,
                'description': description,
                'cancelled': cancelled,
                'created_by_id': str(request.user.id),
                'date_created': event.date_created.isoformat() if hasattr(event, 'date_created') else None
            }
            supabase.table('event_organizationevent').insert(supabase_payload).execute()
        except Exception as e:
            # Log error, but don't block Django save
            print('Supabase sync error:', e)

        return JsonResponse({'success': True, 'id': str(event.id)})

    # GET: list events
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
def get_event_details(request, event_id):
    """API endpoint to get detailed information for a specific organization event."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    try:
        event = OrganizationEvent.objects.select_related('organization', 'created_by').get(id=event_id)
    except OrganizationEvent.DoesNotExist:
        return JsonResponse({'error': 'Event not found'}, status=404)

    org = event.organization
    created_by = event.created_by

    # Basic stats
    rsvp_counts = {
        'going': event.rsvps.filter(status='going').count(),
        'interested': event.rsvps.filter(status='interested').count(),
        'not_going': event.rsvps.filter(status='not_going').count(),
    }

    details = {
        'id': str(event.id),
        'title': event.title,
        'organization': org.name if org else 'N/A',
        'date': event.event_date.strftime('%B %d, %Y at %I:%M %p') if event.event_date else 'N/A',
        'location': event.location or 'TBA',
        'activityType': event.get_activity_type_display(),
        'status': event.status,
        'description': event.description or '',
        'cancelled': event.cancelled,
        'createdBy': created_by.get_full_name() if created_by and created_by.get_full_name() else (created_by.username if created_by else 'N/A'),
        'createdAt': event.date_created.strftime('%B %d, %Y at %I:%M %p') if getattr(event, 'date_created', None) else 'N/A',
        'rsvps': rsvp_counts,
    }

    return JsonResponse(details)
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
def get_rsvp_details(request, rsvp_id):
    """API endpoint to get detailed information for a specific RSVP."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    try:
        rsvp = EventRSVP.objects.select_related('event__organization', 'user', 'user__course').get(id=rsvp_id)
    except EventRSVP.DoesNotExist:
        return JsonResponse({'error': 'RSVP not found'}, status=404)

    event = rsvp.event
    user = rsvp.user

    # Event details
    event_org = event.organization.name if event and event.organization else 'N/A'
    event_date = event.event_date.strftime('%B %d, %Y at %I:%M %p') if event and event.event_date else 'N/A'
    event_status = event.status if event else 'N/A'
    activity_type = event.get_activity_type_display() if event else 'N/A'

    # User/course details
    course_display = None
    course_name = None
    if getattr(user, 'course', None):
        course_display = getattr(user.course, 'abbreviation', None) or getattr(user.course, 'name', None)
        course_name = getattr(user.course, 'name', None)

    profile_picture_url = None
    if getattr(user, 'profile_picture', None):
        try:
            profile_picture_url = user.profile_picture.url
        except Exception:
            profile_picture_url = str(user.profile_picture)

    details = {
        'id': str(rsvp.id),
        'rsvpStatus': rsvp.get_status_display(),
        'rsvpDate': rsvp.date_created.strftime('%B %d, %Y at %I:%M %p') if rsvp.date_created else 'N/A',

        'event': {
            'id': str(event.id) if event else None,
            'title': event.title if event else 'N/A',
            'organization': event_org,
            'date': event_date,
            'location': event.location if event and event.location else 'TBA',
            'activityType': activity_type,
            'status': event_status,
            'description': event.description if event and event.description else ''
        },

        'user': {
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'firstName': user.first_name or 'N/A',
            'lastName': user.last_name or 'N/A',
            'studentId': getattr(user, 'student_id', None) or 'N/A',
            'courseAbbreviation': course_display or 'N/A',
            'courseName': course_name or 'N/A',
            'yearLevel': getattr(user, 'year_level', None) if getattr(user, 'year_level', None) is not None else 'N/A',
            'profilePicture': profile_picture_url,
        }
    }

    return JsonResponse(details)

@login_required
@require_http_methods(["GET", "POST"])
def get_programs_data(request):
    """API endpoint to get all programs data, and add new programs via POST."""
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            data = {}

        # Validate required fields
        errors = {}
        program_name = (data.get('programName') or '').strip()
        code = (data.get('code') or '').strip()

        if not program_name:
            errors['programName'] = 'Program name is required.'
        if not code:
            errors['code'] = 'Program code is required.'

        # Check uniqueness
        if not errors and Program.objects.filter(name=program_name).exists():
            errors['programName'] = 'Program name already exists.'
        if not errors and Program.objects.filter(abbreviation=code).exists():
            errors['code'] = 'Program code already exists.'

        if errors:
            return JsonResponse({'success': False, 'errors': errors}, status=400)

        # Create program
        program = Program.objects.create(
            name=program_name,
            abbreviation=code
        )

        return JsonResponse({'success': True, 'id': str(program.id)})

    # GET: list programs
    programs = Program.objects.all().order_by('abbreviation')

    programs_data = []
    for program in programs:
        # Count students enrolled in this program via FK (avoids invalid icontains lookups on FK)
        student_count = User.objects.filter(course=program).count()

        programs_data.append({
            'id': str(program.id),
            'programName': program.name,
            'code': program.abbreviation,
            'department': 'CCS',
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

            # Delete from Supabase auth first using service role key
            try:
                supabase_admin.auth.admin.delete_user(str(user_id), should_soft_delete=False)
                print(f"Successfully deleted user {user_id} from Supabase auth")
            except Exception as e:
                # Log the error but don't fail - the user might not exist in Supabase
                print(f"Warning: Could not delete user {user_id} from Supabase auth: {str(e)}")

            # Delete from Django
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
            course_code = payload.get('course')
            if course_code:
                try:
                    program = Program.objects.filter(abbreviation=course_code).first() or \
                             Program.objects.filter(name=course_code).first()
                    user.course = program
                except Exception as e:
                    print(f"Warning: Could not lookup program {course_code}: {str(e)}")
                    user.course = None
            else:
                user.course = None
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
