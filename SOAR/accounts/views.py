from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .forms import StudentRegistrationForm, CustomLoginForm, UserProfileForm
from .models import User
from supabase import create_client
from decouple import config
from django.core.exceptions import ImproperlyConfigured
from organization.models import Organization, OrganizationMember, ROLE_MEMBER, Program
from django.views.decorators.http import require_http_methods, require_POST
from django.shortcuts import get_object_or_404

@login_required
def index(request):
    user_orgs = Organization.objects.filter(members__student=request.user, members__is_approved=True)
    org_data = []
    for org in user_orgs:
        org_data.append({
            "org": org,
            "member_count": org.members.filter(is_approved=True).count()
        })
    
    context = {
        "user_orgs": user_orgs,  # for counting
        "org_data": org_data,    # for detailed display if needed
    }
    return render(request, "accounts/index.html", context)

    all_orgs = Organization.objects.all()
    return render(request, "accounts/index.html", {
        "org_data": org_data,
        "all_orgs": all_orgs,
        "user_orgs": user_orgs,
    })

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

    all_orgs = Organization.objects.all()
    return render(request, "organization/organizations_page.html", {
        "org_data": org_data,
        "all_orgs": all_orgs,
        "user_orgs": user_orgs,
    })

@login_required
def organization_page(request):
    """Display all organizations dynamically."""
    organizations = Organization.objects.all()
    return render(request, 'organization/orgpage.html', {'organizations': organizations})

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
SUPABASE_KEY = config("SUPABASE_KEY", default=None)

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ImproperlyConfigured(
        "Supabase credentials are not configured. Set SUPABASE_URL and SUPABASE_KEY in your environment/.env."
    )

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def register(request):
    if request.method == "POST":
        form = StudentRegistrationForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data.get("email")
            password = form.cleaned_data.get("password1")
            username = email.split("@")[0]

            try:
                response = supabase.auth.sign_up({
                    "email": email,
                    "password": password
                })
            except Exception as e:
                messages.error(request, f"Supabase registration failed: {e}")
                return render(request, "accounts/register.html", {"form": form})

            if getattr(response, "user", None):
                supa_user_id = response.user.id
                cd = form.cleaned_data
                try:
                    user_obj = User.objects.get(pk=supa_user_id)
                    user_obj.username = cd.get("username") or user_obj.username
                    user_obj.email = email
                    user_obj.first_name = cd.get("first_name") or user_obj.first_name
                    user_obj.last_name = cd.get("last_name") or user_obj.last_name
                    user_obj.student_id = cd.get("student_id") or user_obj.student_id
                    user_obj.course = cd.get("course") or user_obj.course
                    user_obj.year_level = cd.get("year_level") or user_obj.year_level
                except User.DoesNotExist:
                    user_obj = form.save(commit=False)
                    user_obj.id = supa_user_id
                    user_obj.email = email

                user_obj.is_active = False
                user_obj.set_unusable_password()
                user_obj.save()

                messages.success(
                    request,
                    "Account created. Please check your email to confirm your account before logging in."
                )
                return redirect("login")
            else:
                messages.error(request, "Supabase registration failed: No user returned.")
        else:
            messages.error(request, "Registration failed. Please check the form.")
    else:
        form = StudentRegistrationForm()

    return render(request, "accounts/register.html", {"form": form})

def landing_page(request):
    """Landing page view that shows for all users."""
    return render(request, 'accounts/landing.html')

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
                            user_obj.save()
                        else:
                            if not user_obj.is_active:
                                user_obj.is_active = True
                                user_obj.save()

                        login(request, user_obj, backend='django.contrib.auth.backends.ModelBackend')
                        messages.success(request, f"Welcome back, {user_obj.username}!")
                        return redirect('index')
                else:
                    messages.error(request, "Invalid login credentials.")

            except Exception as e:
                messages.error(request, f"Login failed: {e}")
    else:
        form = CustomLoginForm()

    return render(request, "accounts/login.html", {"form": form})


def logout_view(request):
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('login')

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
        messages.success(request, f"Request to join {organization.name} sent.")
    else:
        messages.info(request, f"You are already a member or have a pending request.")
    return redirect('index')

@login_required
def org_overview(request, org_id):
    organization = get_object_or_404(Organization, id=org_id)
    allowed_programs = organization.allowed_programs.all()
    user_program = getattr(request.user, 'course', None)
    can_join = organization.is_public or allowed_programs.filter(name=user_program).exists()
    # Check if user is org officer or leader
    is_org_officer_or_leader = False
    try:
        member = OrganizationMember.objects.get(organization=organization, student=request.user)
        is_org_officer_or_leader = member.role in ["officer", "leader"]
    except OrganizationMember.DoesNotExist:
        is_org_officer_or_leader = False
    return render(request, 'organization/organization_profile.html', {
        'organization': organization,
        'programs': Program.objects.all(),
        'can_join': can_join,
        'user_program': user_program,
        'allowed_programs': allowed_programs,
        'is_org_officer_or_leader': is_org_officer_or_leader,
    })