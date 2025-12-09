from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .forms import StudentRegistrationForm, CustomLoginForm, UserProfileForm
from .models import User
from decouple import config
from django.core.exceptions import ImproperlyConfigured

# Lazy-load Supabase to prevent Windows crashes
def get_supabase_client():
    try:
        from supabase import create_client
        SUPABASE_URL = config('SUPABASE_URL', default="")
        SUPABASE_KEY = config('SUPABASE_KEY', default="")
        if SUPABASE_URL and SUPABASE_KEY:
            return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase initialization failed: {e}")
    return None
from SOAR.organization.models import Organization, OrganizationMember, ROLE_MEMBER, Program
from SOAR.event.models import OrganizationEvent, EventRSVP
from django.db.models import Q
from django.views.decorators.http import require_http_methods, require_POST
from django.shortcuts import get_object_or_404
from django.utils import timezone

@login_required
def index(request):
    user_orgs = Organization.objects.filter(members__student=request.user, members__is_approved=True)
    org_data = []
    for org in user_orgs[:3]:  # Limit to 3 organizations
        org_data.append({
            "org": org,
            "member_count": org.members.filter(is_approved=True).count()
        })

    # Get total count for "See More" logic
    total_user_orgs = user_orgs.count()
    show_see_more = total_user_orgs > 3

    # Get upcoming events the user is attending (no 7-day cap)
    user_events = OrganizationEvent.objects.filter(
        rsvps__user=request.user,
        rsvps__status='going',
        event_date__gte=timezone.now()
    ).distinct().order_by('event_date')

    # Add RSVP data to each event
    for event in user_events:
        event.going_count = EventRSVP.objects.filter(event=event, status='going').count()
        event.interested_count = EventRSVP.objects.filter(event=event, status='interested').count()
        event.not_going_count = EventRSVP.objects.filter(event=event, status='not_going').count()
        try:
            user_rsvp = EventRSVP.objects.get(event=event, user=request.user)
            event.user_rsvp_status = user_rsvp.status
        except EventRSVP.DoesNotExist:
            event.user_rsvp_status = None

        # Get RSVPed users for attendee avatars (limit to 5 for display)
        event.rsvp_users = EventRSVP.objects.filter(
            event=event,
            status='going'
        ).select_related('user').order_by('date_created')[:5]

    # Count total available organizations
    total_available_orgs = Organization.objects.count()

    # Serialize user_events for modal on the dashboard
    import json
    user_events_json = json.dumps([
        {
            "id": str(event.id),
            "title": event.title,
            "organization": event.organization.name,
            "organization_id": str(event.organization.id),
            "organization_picture": event.organization.profile_picture.url if event.organization.profile_picture else None,
            "date": event.event_date.isoformat(),
            "description": event.description,
            "type": event.activity_type,
            "going_count": event.going_count,
            "interested_count": event.interested_count,
            "not_going_count": event.not_going_count,
            "user_rsvp_status": getattr(event, "user_rsvp_status", None),
            "location": event.location,
            "max_participants": event.max_participants,
            "is_user_member": True,
        }
        for event in user_events
    ])

    context = {
        "user_orgs": user_orgs,  # for counting
        "org_data": org_data,    # for detailed display (limited to 3)
        "show_see_more": show_see_more,
        "total_orgs_count": total_user_orgs,
        "user_events": user_events,
        "user_events_json": user_events_json,
        "total_available_orgs": total_available_orgs,
    }
    return render(request, "accounts/index.html", context)

@login_required
def organizations_page(request):
    """Organizations page: show user's joined orgs and allow browsing/joining others."""
    user_orgs = Organization.objects.filter(members__student=request.user, members__is_approved=True)
    org_data = []
    for org in user_orgs:
        org_data.append({
            "org": org,
            "member_count": org.members.filter(is_approved=True).count()
        })

    # Support simple search via ?q=... (searches name and description)
    q = request.GET.get('q', '').strip()
    if q:
        # Only search by organization name (avoid matching description)
        # Filter out organizations user is already a member of
        all_orgs = Organization.objects.filter(
            Q(name__icontains=q)
        ).exclude(
            members__student=request.user,
            members__is_approved=True
        ).distinct()
    else:
        # Filter out organizations user is already a member of
        all_orgs = Organization.objects.exclude(
            members__student=request.user,
            members__is_approved=True
        ).all()

    return render(request, "organization/organizations_page.html", {
        "org_data": org_data,
        "all_orgs": all_orgs,
        "user_orgs": user_orgs,
        "q": q,
    })

@login_required
def organization_page(request):
    """Display all organizations dynamically."""
    organizations = Organization.objects.all()
    return render(request, 'organization/organizations_page.html', {'organizations': organizations})

@login_required
def profile(request):
    user = request.user
    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('profile')
    else:
        form = UserProfileForm(instance=user)
    return render(request, "accounts/profile.html", {"form": form, "user": user})

@login_required
def members_management(request):
    return render(request, "accounts/members_management.html")

SUPABASE_URL = config("SUPABASE_URL", default=None)
# Remove duplicate initialization - using get_supabase_client() instead

def register(request):
    if request.method == "POST":
        form = StudentRegistrationForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data.get("email")
            password = form.cleaned_data.get("password1")
            username = form.cleaned_data.get("username")
            student_id = form.cleaned_data.get("student_id")
          # Check if username already exists
            if User.objects.filter(username=username).exists():
                messages.error(request, "A user with this username already exists.")
                return render(request, "accounts/register.html", {"form": form})
            
            # Check if School ID already exists
            if User.objects.filter(student_id=student_id).exists():
                messages.error(request, "A user with this School ID already exists.")
                return render(request, "accounts/register.html", {"form": form})

            try:
                supabase = get_supabase_client()
                if not supabase:
                    messages.error(request, "Supabase service is not available.")
                    return render(request, "accounts/register.html", {"form": form})
                
                response = supabase.auth.sign_up({
                    "email": email,
                    "password": password
                })
            except Exception as e:
                error_message = str(e)
                # Handle specific Supabase errors
                if "already registered" in error_message.lower() or "already exists" in error_message.lower():
                    messages.error(request, "An account with this email already exists.")
                else:
                    messages.error(request, f"Registration failed: {error_message}")
                return render(request, "accounts/register.html", {"form": form})

            # Normalize supabase response shapes (dict, object, nested data)
            user_attr = None
            try:
                # object-like response (has .user)
                if getattr(response, "user", None):
                    user_attr = response.user
                # dict-like responses
                elif isinstance(response, dict):
                    # common shapes: {'user': {...}} or {'data': {'user': {...}}} or {'data': {...}}
                    if response.get("user"):
                        user_attr = response.get("user")
                    elif isinstance(response.get("data"), dict) and response["data"].get("user"):
                        user_attr = response["data"].get("user")
                    elif response.get("data"):
                        user_attr = response.get("data")
                else:
                    # object with .data attribute
                    data = getattr(response, "data", None)
                    if data and isinstance(data, dict):
                        user_attr = data.get("user") or data
            except Exception:
                user_attr = None

            if user_attr:
                # extract id whether dict or object
                if hasattr(user_attr, "id"):
                    supa_user_id = user_attr.id
                elif isinstance(user_attr, dict) and user_attr.get("id"):
                    supa_user_id = user_attr.get("id")
                else:
                    # fallback to string representation
                    supa_user_id = str(user_attr)
                cd = form.cleaned_data
                try:
                    user_obj = User.objects.get(pk=supa_user_id)
                    # Updating existing user
                    if User.objects.filter(username=username).exclude(pk=user_obj.pk).exists():
                        messages.error(request, "A user with this username already exists.")
                        return render(request, "accounts/register.html", {"form": form})
                    if User.objects.filter(email=email).exclude(pk=user_obj.pk).exists():
                        messages.error(request, "A user with this email already exists.")
                        return render(request, "accounts/register.html", {"form": form})
                    if User.objects.filter(student_id=student_id).exclude(pk=user_obj.pk).exists():
                        messages.error(request, "A user with this School ID already exists.")
                        return render(request, "accounts/register.html", {"form": form})
                    user_obj.username = cd.get("username") or user_obj.username
                    user_obj.email = email
                    user_obj.first_name = cd.get("first_name") or user_obj.first_name
                    user_obj.last_name = cd.get("last_name") or user_obj.last_name
                    user_obj.student_id = cd.get("student_id") or user_obj.student_id

                    course_value = cd.get("course")
                    if isinstance(course_value, str):
                        course_value = Program.objects.filter(
                            Q(name=course_value) | Q(abbreviation=course_value)
                        ).first()
                    user_obj.course = course_value or user_obj.course

                    user_obj.year_level = cd.get("year_level") or user_obj.year_level
                    user_obj.is_staff = cd.get('user_type') == 'staff'
                except User.DoesNotExist:
                    # Creating new user
                    if User.objects.filter(username=username).exists():
                        messages.error(request, "A user with this username already exists.")
                        return render(request, "accounts/register.html", {"form": form})
                    if User.objects.filter(email=email).exists():
                        messages.error(request, "A user with this email already exists.")
                        return render(request, "accounts/register.html", {"form": form})
                    if User.objects.filter(student_id=student_id).exists():
                        messages.error(request, "A user with this School ID already exists.")
                        return render(request, "accounts/register.html", {"form": form})
                    user_obj = form.save(commit=False)
                    user_obj.id = supa_user_id
                    user_obj.email = email
                    user_obj.is_staff = cd.get('user_type') == 'staff'

                user_obj.is_active = False
                user_obj.set_unusable_password()
                try:
                    user_obj.save()
                except Exception as e:
                    import traceback
                    traceback.print_exc()
                    messages.error(request, f"Registration failed: Database error saving new user: {e}")
                    return render(request, "accounts/register.html", {"form": form})

                messages.success(
                    request,
                    "Account created successfully! Please check your email to confirm your account before logging in."
                )
                return redirect("login")
            else:
                messages.error(request, "Registration failed. Please try again.")
        else:
            messages.error(request, "Registration failed. Please correct the errors below.")
    else:
        form = StudentRegistrationForm()

    return render(request, "accounts/register.html", {"form": form})

def landing_page(request):
    """Landing page view that shows for all users."""
    # Get dynamic stats for the landing page
    total_organizations = Organization.objects.count()
    total_active_students = User.objects.filter(is_active=True).count()
    total_events = OrganizationEvent.objects.count()

    # Get sample users with profile pictures for the landing page display
    sample_users = User.objects.filter(
        is_active=True,
        profile_picture__isnull=False
    ).exclude(profile_picture='').order_by('?')[:3]

    context = {
        'total_organizations': total_organizations,
        'total_active_students': total_active_students,
        'total_events': total_events,
        'sample_users': sample_users,
    }
    return render(request, 'accounts/landing.html', context)

def login_view(request):
    if request.user.is_authenticated:
        return redirect('index')

    if request.method == "POST":
        form = CustomLoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password")

            email = username if username and '@' in username else f"{username}@cit.edu"

            try:
                supabase = get_supabase_client()
                if not supabase:
                    messages.error(request, "Authentication service is not available.")
                    return render(request, "accounts/login.html", {"form": form})
                
                response = supabase.auth.sign_in_with_password({
                    "email": email,
                    "password": password
                })

                if getattr(response, "user", None):
                    if not response.user.email_confirmed_at:
                        messages.warning(request, "Please verify your email before logging in.")
                    else:
                        try:
                            user_obj = User.objects.get(pk=response.user.id)
                        except User.DoesNotExist:
                            user_obj = User(
                                id=response.user.id,
                                username=email.split("@")[0],
                                email=email,
                                is_active=True,
                            )
                            user_obj.set_unusable_password()
                            try:
                                user_obj.save()
                            except Exception as e:
                                import traceback
                                traceback.print_exc()
                                messages.error(request, f"Login failed: Database error creating user record: {e}")
                                return render(request, "accounts/login.html", {"form": form})
                        else:
                            if not user_obj.is_active:
                                user_obj.is_active = True
                                try:
                                    user_obj.save()
                                except Exception as e:
                                    import traceback
                                    traceback.print_exc()
                                    messages.error(request, f"Login failed: Database error updating user record: {e}")
                                    return render(request, "accounts/login.html", {"form": form})

                        login(request, user_obj, backend='django.contrib.auth.backends.ModelBackend')
                        messages.success(request, f"Welcome back, {user_obj.username}!")

                        # Check if user is superuser from Supabase
                        response = supabase.table('accounts_user').select('is_superuser').eq('id', str(user_obj.id)).execute()
                        is_superuser = response.data[0]['is_superuser'] if response.data else False
                        if is_superuser:
                            return redirect('admin_panel')
                        else:
                            return redirect('index')
                else:
                    messages.error(request, "Invalid login credentials.")

            except Exception as e:
                messages.error(request, f"Login failed: {e}")
    else:
        form = CustomLoginForm()

    return render(request, "accounts/login.html", {"form": form})


def logout_view(request):
    # Sign out from Supabase first
    try:
        supabase = get_supabase_client()
        if supabase:
            supabase.auth.sign_out()
    except Exception as e:
        # Log the error but continue with Django logout
        print(f"Supabase logout error: {e}")

    # Sign out from Django (this clears the session including messages)
    logout(request)
    
    # Clear any messages that might still be in storage
    storage = messages.get_messages(request)
    for _ in storage:
        pass  # Iterate to consume all messages
    
    return redirect('home')

def organization_view(request):
    organization = get_object_or_404(Organization, user=request.user)
    return render(request, 'accounts/organizational.html', {'organization': organization})

@login_required
@require_POST
def join_org(request, org_id):
    organization = get_object_or_404(Organization, id=org_id)
    already_member = OrganizationMember.objects.filter(organization=organization, student=request.user).exists()
    if not already_member:
        OrganizationMember.objects.create(
            organization=organization,
            student=request.user,
            role=ROLE_MEMBER,
            is_approved=False
        )
        message = f"Request to join {organization.name} sent."
    else:
        message = f"You are already a member or have a pending request."

    # Handle AJAX requests
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'success': True, 'message': message})
    else:
        if not already_member:
            messages.success(request, message)
        else:
            messages.info(request, message)
        return redirect('index')

@login_required
def org_overview(request, org_id):
    org = get_object_or_404(Organization, id=org_id)
    
    # Check if user is a member of this organization
    is_member = OrganizationMember.objects.filter(
        organization=org,
        student=request.user,
        is_approved=True
    ).exists()
    
    if not is_member:
        messages.error(request, "You don't have permission to view this organization.")
        return redirect('organizations_page')
    
    # Get all approved members
    members = org.members.filter(is_approved=True).select_related('student')
    
    context = {
        'org': org,
        'members': members,
        'is_member': is_member,
    }
    return render(request, 'organization/org_overview.html', context)

@login_required
def notifications_view(request):
    """View for displaying user notifications."""
    context = {
        'unread_count': 5,  # Example count, replace with actual count from your notification model
        'hide_header': True  # This will be used to hide the header in the template
    }
    return render(request, 'accounts/Notifications.html', context)