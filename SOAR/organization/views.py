from django.shortcuts import render, get_object_or_404, redirect
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
from .models import Organization, OrganizationMember, Program, ROLE_MEMBER, ROLE_OFFICER, ROLE_LEADER, ROLE_ADVISER
from accounts.models import User
from .forms import OrganizationEditForm
from .serializers import OrganizationSerializer, OrganizationMemberSerializer, ProgramSerializer
from .permissions import IsOrgOfficerOrAdviser
from django.core.mail import send_mail
from decouple import config
from supabase import create_client

# Initialize Supabase client
SUPABASE_URL = config("SUPABASE_URL")
SUPABASE_KEY = config("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def organization_detail(request, org_id):
    organization = get_object_or_404(Organization, id=org_id)
    programs = Program.objects.all()
    return render(request, 'organization_profile.html', {
        'organization': organization,
        'programs': programs,
    })


# ==============================
# ORGANIZATION VIEWSET
# ==============================
class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='members')
    def members(self, request, pk=None):
        org = self.get_object()
        query = request.query_params.get('q', '').strip()
        members = org.members.select_related('student')
        if query:
            members = members.filter(
                Q(student__username__icontains=query) |
                Q(student__first_name__icontains=query) |
                Q(student__last_name__icontains=query)
            )
        serializer = OrganizationMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='users/search')
    def users_search(self, request, pk=None):
        org = self.get_object()
        query = request.query_params.get('q', '').strip()

        # Base queryset: all users
        users = User.objects.all()

        # If organization is private, filter by allowed programs
        if not org.is_public:
            allowed_programs = org.allowed_programs.all()
            program_names = [p.name for p in allowed_programs]
            program_abbrevs = [p.abbreviation for p in allowed_programs]
            users = users.filter(
                Q(course__in=program_names) | Q(course__in=program_abbrevs)
            )

        # Exclude users who are already members of this organization
        existing_member_ids = org.members.values_list('student_id', flat=True)
        users = users.exclude(id__in=existing_member_ids)

        # Apply search query
        if query:
            users = users.filter(
                Q(username__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query)
            )

        # Serialize with basic user info
        user_data = users.values('id', 'username', 'first_name', 'last_name', 'email', 'course')[:50]  # Limit to 50 results
        results = []
        for user in user_data:
            full_name = f"{user['first_name']} {user['last_name']}".strip()
            results.append({
                'id': str(user['id']),
                'name': full_name or user['username'],
                'username': user['username'],
                'email': user['email'],
                'program': user['course'] or '',
            })

        return Response(results)


# ==============================
# PROGRAM VIEWSET
# ==============================
class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [IsAuthenticated]


# ==============================
# ORGANIZATION MEMBER VIEWSET
# ==============================
class OrganizationMemberViewSet(viewsets.ModelViewSet):
    queryset = OrganizationMember.objects.select_related('student', 'organization').all()
    serializer_class = OrganizationMemberSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Create a new organization member."""
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'member')
        org_id = request.data.get('organization_id')  # Get org_id from request data

        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not org_id:
            return Response({'error': 'organization_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
            organization = Organization.objects.get(id=org_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Organization.DoesNotExist:
            return Response({'error': 'Organization not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if user is already a member of this organization
        if OrganizationMember.objects.filter(student=user, organization=organization).exists():
            return Response({'error': 'User is already a member of this organization'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the member
        member = OrganizationMember.objects.create(
            organization=organization,
            student=user,
            role=role,
            is_approved=True  # Auto-approve for now
        )

        serializer = self.get_serializer(member)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # ✅ Promote Member
    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        """Promote a member (Member → Officer → Leader).
        Only Leaders or Admins can perform this action.
        """
        member = self.get_object()
        promoter = request.user

        # Restrict to only admins, advisers and leaders
        if not (promoter.is_superuser or promoter.is_staff):
            promoter_record = OrganizationMember.objects.filter(
                organization=member.organization,
                student=promoter
            ).first()
            if not promoter_record or promoter_record.role not in ["adviser", "leader"]:
                return Response({'error': 'Only advisers, leaders or admins can promote members.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            member.promote(promoter=promoter)
            return Response({
                'status': 'success',
                'message': f'{member.student.username} has been promoted to {member.role}.',
                'new_role': member.role
            }, status=status.HTTP_200_OK)

        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ✅ NEW: Demote Member
    @action(detail=True, methods=['post'])
    def demote(self, request, pk=None):
        """Demote a member (Leader → Officer → Member).
        Only Leaders or Admins can perform this action.
        """
        member = self.get_object()
        demoter = request.user

        # Restrict to only admins, advisers and leaders
        if not (demoter.is_superuser or demoter.is_staff):
            demoter_record = OrganizationMember.objects.filter(
                organization=member.organization,
                student=demoter
            ).first()
            if not demoter_record or demoter_record.role not in ["adviser", "leader"]:
                return Response({'error': 'Only advisers, leaders or admins can demote members.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            member.demote(demoter=demoter)
            return Response({
                'status': 'success',
                'message': f'{member.student.username} has been demoted to {member.role}.',
                'new_role': member.role
            }, status=status.HTTP_200_OK)

        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a join request and notify the user by email."""
        member = self.get_object()
        if member.is_approved:
            return Response({'error': 'Already approved.'}, status=status.HTTP_400_BAD_REQUEST)
        member.is_approved = True
        member.save()
        send_mail(
            subject=f"Accepted to {member.organization.name}",
            message=f"Congratulations! You have been accepted as a member of {member.organization.name}.",
            from_email=None,
            recipient_list=[member.student.email],
            fail_silently=True,
        )
        return Response({'status': 'success', 'message': 'Member approved and notified.'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a join request and notify the user by email."""
        member = self.get_object()
        if member.is_approved:
            return Response({'error': 'Already approved.'}, status=status.HTTP_400_BAD_REQUEST)
        send_mail(
            subject=f"Application to {member.organization.name} Rejected",
            message=f"We regret to inform you that your request to join {member.organization.name} was not approved.",
            from_email=None,
            recipient_list=[member.student.email],
            fail_silently=True,
        )
        member.delete()
        return Response({'status': 'success', 'message': 'Member rejected and notified.'})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'status': 'removed'})


# ==============================
# PAGE VIEWS (Templates)
# ==============================
@login_required
def organization_page(request):
    organizations = Organization.objects.all()
    return render(request, 'accounts/organization.html', {'organizations': organizations})


@login_required
def orgpage(request, org_id):
    organization = get_object_or_404(Organization, id=org_id)
    user_role = None
    if request.user.is_authenticated:
        try:
            org_member = OrganizationMember.objects.get(student=request.user, organization=organization)
            user_role = org_member.role
        except OrganizationMember.DoesNotExist:
            user_role = None
    return render(request, 'organization/orgpage.html', {
        'organization': organization,
        'user_role': user_role,
    })


@login_required
def organization_profile(request, org_id):
    # Fetch the specific organization using org_id
    organization = get_object_or_404(Organization, id=org_id)
    programs = Program.objects.all()

    if request.method == 'POST':
        name = (request.POST.get('org_name') or organization.name).strip()
        about = (request.POST.get('org_about') or organization.description or '').strip()
        is_public_val = request.POST.get('is_public')
        is_public = str(is_public_val).lower() in ('true', '1', 'on', 'yes')

        organization.name = name
        organization.description = about
        organization.is_public = is_public
        organization.save()

        if not is_public:
            allowed_ids = request.POST.getlist('allowed_programs')
            selected_programs = Program.objects.filter(id__in=allowed_ids)
            organization.allowed_programs.set(selected_programs)
        else:
            organization.allowed_programs.clear()

        messages.success(request, "Organization profile updated successfully!")
        # Redirect to the same org's profile
        return redirect('organization_profile', org_id=organization.id)

    return render(request, 'organization/organization_profile.html', {
        'organization': organization,
        'programs': programs,
    })



@login_required
def organization_editprofile(request, org_id):
    organization = get_object_or_404(Organization, id=org_id)
    programs = list(Program.objects.values('id', 'name', 'abbreviation'))

    if request.method == 'POST':
        print("=== ORGANIZATION EDIT PROFILE POST REQUEST ===")
        print(f"FILES in request: {list(request.FILES.keys())}")
        print(f"POST data keys: {list(request.POST.keys())}")

        form = OrganizationEditForm(request.POST, request.FILES, instance=organization)

        # ✅ Skip image validation if no new file
        if not request.FILES.get('profile_picture'):
            print("No profile_picture in FILES, popping from form")
            form.fields.pop('profile_picture', None)
        else:
            print(f"Profile picture found: {request.FILES['profile_picture']}")

        if form.is_valid():
            print("Form is valid")
            org = form.save(commit=False)

            # ✅ Handle profile_picture upload to Supabase
            if 'profile_picture' in request.FILES:
                print(f"Assigning profile_picture: {request.FILES['profile_picture']}")
                org.profile_picture = request.FILES['profile_picture']

            # ✅ Handle allowed_programs manually (comma-separated IDs)
            allowed_programs_ids = form.cleaned_data.get('allowed_programs', [])
            print(f"Allowed programs IDs: {allowed_programs_ids}")

            if allowed_programs_ids:
                print("Saving org and setting allowed programs")
                org.save()  # save first before M2M update
                org.allowed_programs.set(allowed_programs_ids)
            else:
                print("Saving org and clearing allowed programs")
                org.save()
                org.allowed_programs.clear()

            print(f"Final org.profile_picture: {org.profile_picture}")
            print("=== ORGANIZATION UPDATE SUCCESSFUL ===")
            return JsonResponse({'success': True, 'message': 'Organization updated successfully'})
        else:
            print("Form errors:", form.errors)
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)

    users = User.objects.all()
    return render(request, 'organization/organization_editprofile.html', {
        'organization': organization,
        'programs': programs,
        'users': users,
        'SUPABASE_URL': SUPABASE_URL,
        'SUPABASE_KEY': SUPABASE_KEY,
        'current_allowed_programs': [str(p.id) for p in organization.allowed_programs.all()],
    })



@login_required
def membermanagement(request, org_id):
    """Render the member management page for a specific organization."""
    
    organization = get_object_or_404(Organization, id=org_id)
    members = OrganizationMember.objects.select_related('student').filter(organization=organization)

    try:
        org_member = OrganizationMember.objects.get(student=request.user, organization=organization)
        user_role = org_member.role
    except OrganizationMember.DoesNotExist:
        user_role = "GUEST"

    return render(request, 'organization/membermanagement.html', {
        'organization': organization,
        'members': members,
        'user_role': user_role,
    })



@login_required
def api_update_organization(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    data = json.loads(request.body)
    organization = Organization.objects.first()
    if not organization:
        return JsonResponse({'error': 'Organization not found'}, status=404)

    organization.name = data.get('org_name', organization.name)
    organization.description = data.get('org_about', organization.description)
    is_public_val = data.get('is_public', organization.is_public)
    organization.is_public = str(is_public_val).lower() in ('true', '1', 'on', 'yes')
    organization.save()

    if not organization.is_public:
        allowed_ids = data.get('allowed_programs', [])
        organization.allowed_programs.set(Program.objects.filter(id__in=allowed_ids))
    else:
        organization.allowed_programs.clear()

    return JsonResponse({'message': 'Organization updated successfully'})

@login_required
def demote_member(request, member_id):
    """Demote a member (Leader → Officer → Member). Only Leaders or Admins can perform this."""
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        member = OrganizationMember.objects.get(id=member_id)
        demoter = request.user  # the one performing the action

        # Check permissions: only admins, advisers and leaders
        if not (demoter.is_superuser or demoter.is_staff):
            demoter_record = OrganizationMember.objects.filter(
                organization=member.organization,
                student=demoter
            ).first()
            if not demoter_record or demoter_record.role not in ["adviser", "leader"]:
                return JsonResponse({"error": "Only advisers, leaders or admins can demote members."}, status=403)

        # Demotion logic (use ROLE_* constants)
        if member.role == ROLE_LEADER:
            member.role = ROLE_OFFICER
        elif member.role == ROLE_OFFICER:
            member.role = ROLE_MEMBER
        else:
            return JsonResponse({"error": "Cannot demote further; already a Member."}, status=400)

        member.save()
        return JsonResponse({
            "status": "success",
            "message": f"{member.student.username} has been demoted to {member.role}.",
            "new_role": member.role
        })

    except OrganizationMember.DoesNotExist:
        return JsonResponse({"error": "Member not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@login_required
def promote_member(request, org_id, member_id):
    """Promote a member (Member → Officer → Leader). Only Leaders or Admins can perform this."""
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        member = OrganizationMember.objects.get(id=member_id, organization__id=org_id)
        promoter = request.user

        # Check permissions: only admins, advisers and leaders
        if not (promoter.is_superuser or promoter.is_staff):
            promoter_record = OrganizationMember.objects.filter(
                organization=member.organization,
                student=promoter
            ).first()
            if not promoter_record or promoter_record.role not in ["adviser", "leader"]:
                return JsonResponse({"error": "Only advisers, leaders or admins can promote members."}, status=403)

        # Promotion logic (use ROLE_* constants)
        if member.role == ROLE_MEMBER:
            member.role = ROLE_OFFICER
        elif member.role == ROLE_OFFICER:
            member.role = ROLE_LEADER
        else:
            return JsonResponse({"error": "Cannot promote further; already a Leader."}, status=400)

        member.save()
        return JsonResponse({
            "status": "success",
            "message": f"{member.student.username} has been promoted to {member.role}.",
            "new_role": member.role
        })

    except OrganizationMember.DoesNotExist:
        return JsonResponse({"error": "Member not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

from django.shortcuts import render, redirect, get_object_or_404
from .models import Program
from .forms import ProgramForm

def program_list(request):
    programs = Program.objects.all()
    return render(request, 'organization/program_list.html', {'programs': programs})

def add_program(request):
    if request.method == 'POST':
        form = ProgramForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('program_list')
    else:
        form = ProgramForm()
    return render(request, 'organization/program_modal.html', {'form': form})

def edit_program(request, pk):
    program = get_object_or_404(Program, pk=pk)
    if request.method == 'POST':
        form = ProgramForm(request.POST, instance=program)
        if form.is_valid():
            form.save()
            return redirect('program_list')
    else:
        form = ProgramForm(instance=program)
    return render(request, 'organization/program_modal.html', {'form': form, 'program': program})

def delete_program(request, pk):
    program = get_object_or_404(Program, pk=pk)
    if request.method == 'POST':
        program.delete()
        return redirect('program_list')
    return render(request, 'organization/delete_program.html', {'program': program})

from django.http import JsonResponse
from .models import Program

def get_programs(request):
    programs = Program.objects.values('id', 'abbreviation', 'name')
    return JsonResponse(list(programs), safe=False)


@login_required
@login_required
def calendar_view(request, org_id):
    """Render the calendar page for the organization."""
    organization = get_object_or_404(Organization, id=org_id)
    
    # Check if the current user is a member of the organization
    is_member = OrganizationMember.objects.filter(
        student=request.user,
        organization=organization
    ).exists()
    
    if not is_member:
        messages.error(request, 'You are not a member of this organization.')
        return redirect('home')
    
    return render(request, 'organization/calendar.html', {
        'organization': organization,
    })


def leave_organization(request, org_id):
    """Allow the current user to leave the given organization.

    - Prevent advisers from leaving via the UI.
    - Prevent the last leader from leaving; require assigning another leader first.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        organization = get_object_or_404(Organization, id=org_id)
        member = OrganizationMember.objects.filter(organization=organization, student=request.user).first()
        if not member:
            return JsonResponse({'error': 'You are not a member of this organization.'}, status=404)

        if member.role == ROLE_ADVISER:
            return JsonResponse({'error': 'Advisers cannot leave an organization via this action.'}, status=403)

        if member.role == ROLE_LEADER:
            leaders_count = OrganizationMember.objects.filter(organization=organization, role=ROLE_LEADER).count()
            if leaders_count <= 1:
                return JsonResponse({'error': 'Cannot leave as the only leader. Assign another leader first.'}, status=400)

        # All checks passed — remove membership
        member.delete()
        return JsonResponse({'status': 'success', 'message': 'You have left the organization.'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
