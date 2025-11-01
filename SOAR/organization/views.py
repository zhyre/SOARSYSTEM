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
from .models import Organization, OrganizationMember, Program
from .serializers import OrganizationSerializer, OrganizationMemberSerializer, ProgramSerializer
from .permissions import IsOrgOfficerOrAdviser
from django.core.mail import send_mail


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

    # ✅ Promote Member
    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        """Promote a member (Member → Officer → Leader).
        Only Leaders or Admins can perform this action.
        """
        member = self.get_object()
        promoter = request.user

        # Restrict to only admins and leaders
        if not (promoter.is_superuser or promoter.is_staff):
            promoter_record = OrganizationMember.objects.filter(
                organization=member.organization,
                student=promoter
            ).first()
            if not promoter_record or promoter_record.role != "Leader":
                return Response({'error': 'Only leaders or admins can promote members.'}, status=status.HTTP_403_FORBIDDEN)

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

        # Restrict to only admins and leaders
        if not (demoter.is_superuser or demoter.is_staff):
            demoter_record = OrganizationMember.objects.filter(
                organization=member.organization,
                student=demoter
            ).first()
            if not demoter_record or demoter_record.role != "Leader":
                return Response({'error': 'Only leaders or admins can demote members.'}, status=status.HTTP_403_FORBIDDEN)

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
def organization_profile(request):
    organization = Organization.objects.first() if Organization.objects.exists() else None
    programs = Program.objects.all()

    if request.method == 'POST' and organization:
        name = (request.POST.get('org_name') or organization.name).strip()
        about = (request.POST.get('org_about') or organization.description or '').strip()
        is_public_val = request.POST.get('is_public')
        is_public = True if str(is_public_val).lower() in ('true', '1', 'on', 'yes') else False

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
        return redirect('organization_profile')

    return render(request, 'organization/organization_profile.html', {
        'organization': organization,
        'programs': programs,
    })


@login_required
def organization_edit_profile(request):
    organization = Organization.objects.first()
    programs = Program.objects.all()

    if request.method == 'POST' and organization:
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
            allowed_programs = Program.objects.filter(id__in=allowed_ids)
            organization.allowed_programs.set(allowed_programs)
        else:
            organization.allowed_programs.clear()

        messages.success(request, "Organization profile updated successfully.")
        return redirect('organization_profile')

    return render(request, 'organization/organization_editprofile.html', {
        'organization': organization,
        'programs': programs,
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

        # Check permissions: only admins and leaders
        if not (demoter.is_superuser or demoter.is_staff):
            demoter_record = OrganizationMember.objects.filter(
                organization=member.organization,
                student=demoter
            ).first()
            if not demoter_record or demoter_record.role != "Leader":
                return JsonResponse({"error": "Only leaders or admins can demote members."}, status=403)

        # Demotion logic
        if member.role == "Leader":
            member.role = "Officer"
        elif member.role == "Officer":
            member.role = "Member"
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