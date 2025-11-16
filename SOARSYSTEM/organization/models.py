import uuid
from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from organization.validators import validate_image_file_type, validate_image_file_size
from accounts.models import organization_profile_upload_path, OrganizationSupabaseStorage

class Program(models.Model):
    abbreviation = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.abbreviation

class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    
    adviser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="advised_organizations"
    )

    profile_picture = models.ImageField(
        upload_to=organization_profile_upload_path,
        storage=OrganizationSupabaseStorage(),
        null=True,
        blank=True,
        validators=[validate_image_file_type, validate_image_file_size]
    )

    is_public = models.BooleanField(
        default=True,
        help_text="If true, anyone can join this organization."
    )

    allowed_programs = models.ManyToManyField(
            Program,
            blank=True,
            help_text="Select which programs can join this organization."
        )

    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

ROLE_ADVISER = "adviser"
ROLE_MEMBER = "member"
ROLE_OFFICER = "officer"
ROLE_LEADER = "leader"
ROLE_CHOICES = [
    (ROLE_ADVISER, "Adviser"),
    (ROLE_MEMBER, "Member"),
    (ROLE_OFFICER, "Officer"),
    (ROLE_LEADER, "Leader"),
]

class OrganizationMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="members")
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="organizations_joined")
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default=ROLE_MEMBER)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)

    class Meta:
        unique_together = ('organization', 'student')

    def __str__(self):
        return f"{self.student.username} - {self.organization.name} ({self.role})"

    def promote(self, promoter=None):
        if not promoter:
            raise PermissionError("No promoter specified.")

        # Allow admins (superuser or staff)
        if promoter.is_superuser or promoter.is_staff:
            allowed = True
        else:
            promoter_record = OrganizationMember.objects.filter(
                organization=self.organization,
                student=promoter
            ).first()
            allowed = promoter_record and promoter_record.role == ROLE_LEADER

        if not allowed:
            raise PermissionError("Only leaders or admins can promote members.")

        # Promotion logic (use ROLE_* constants stored in DB)
        if self.role == ROLE_MEMBER:
            self.role = ROLE_OFFICER
        elif self.role == ROLE_OFFICER:
            self.role = ROLE_LEADER
        else:
            raise ValueError("Cannot promote further; already a Leader.")

        self.save()

    def demote(self, demoter=None):
        if not demoter:
            raise PermissionError("No demoter specified.")

        # Allow admins (superuser or staff)
        if demoter.is_superuser or demoter.is_staff:
            allowed = True
        else:
            demoter_record = OrganizationMember.objects.filter(
                organization=self.organization,
                student=demoter
            ).first()
            allowed = demoter_record and demoter_record.role == ROLE_LEADER

        if not allowed:
            raise PermissionError("Only leaders or admins can demote members.")

        # Demotion logic (use ROLE_* constants stored in DB)
        if self.role == ROLE_LEADER:
            self.role = ROLE_OFFICER
        elif self.role == ROLE_OFFICER:
            self.role = ROLE_MEMBER
        else:
            raise ValueError("Cannot demote further; already a Member.")

        self.save()

