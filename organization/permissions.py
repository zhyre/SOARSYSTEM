from rest_framework.permissions import BasePermission
from .models import OrganizationMember, ROLE_OFFICER, ROLE_LEADER

class IsOrgOfficerOrAdviser(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if hasattr(obj, 'adviser'):
            org = obj
        else:
            org = getattr(obj, 'organization', None)
        if not org:
            return False
        if org.adviser_id == user.id:
            return True
        try:
            membership = OrganizationMember.objects.get(organization=org, student=user)
            return membership.role in [ROLE_OFFICER, ROLE_LEADER]
        except OrganizationMember.DoesNotExist:
            return False
