from rest_framework import serializers
from .models import Organization, OrganizationMember, Program

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ["id", "abbreviation", "name"]


class OrganizationSerializer(serializers.ModelSerializer):
    allowed_programs = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Program.objects.all(), required=False
    )
    class Meta:
        model = Organization
        fields = [
            'id',
            'name',
            'description',
            'profile_picture',
            'adviser',
            'is_public',
            'allowed_programs',
            'date_created'
        ]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Organization name is required")
        return value

    def validate_description(self, value):
        if not value.strip():
            raise serializers.ValidationError("Description is required")
        if len(value) > 500:
            raise serializers.ValidationError("Description must be 500 characters or fewer")
        return value

class OrganizationMemberSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='student.username', read_only=True)
    class Meta:
        model = OrganizationMember
        fields = ['id', 'organization', 'student', 'student_username', 'role', 'date_joined', 'is_approved']
