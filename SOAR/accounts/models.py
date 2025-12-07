from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from decouple import config
from django.core.exceptions import ImproperlyConfigured
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os

# Lazy-load Supabase to prevent Windows crashes
def get_supabase_client():
    try:
        from supabase import create_client
        SUPABASE_URL = config("SUPABASE_URL", default="")
        SUPABASE_KEY = config("SUPABASE_KEY", default="")
        if SUPABASE_URL and SUPABASE_KEY:
            return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase initialization failed: {e}")
    return None

class SupabaseStorage:
    def __init__(self, bucket_name='user_profile'):
        self.bucket_name = bucket_name

    def _get_file_path(self, name):
        """Generate the full path for the file in Supabase storage."""
        return name

    def generate_filename(self, filename):
        """Generate a filename for the file."""
        return filename

    def save(self, name, content, max_length=None):
        """Save file to Supabase storage."""
        supabase = get_supabase_client()
        if not supabase:
            print("Supabase not available, skipping upload")
            return name
            
        file_path = self._get_file_path(name)
        print(f"=== SUPABASE STORAGE SAVE ===")
        print(f"Bucket: {self.bucket_name}")
        print(f"File path: {file_path}")

        # Read the content
        content_data = content.read()
        content.seek(0)  # Reset file pointer
        print(f"Content size: {len(content_data)} bytes")

        # Get content type, default to octet-stream if not available
        content_type = getattr(content, 'content_type', 'application/octet-stream')
        print(f"Content type: {content_type}")

        # Upload to Supabase
        try:
            print("Attempting upload...")
            response = supabase.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=content_data,
                file_options={"content-type": content_type}
            )
            print(f"Upload successful: {response}")
            return file_path
        except Exception as e:
            print(f"Upload failed, trying update: {str(e)}")
            # If file exists, try to update it
            try:
                response = supabase.storage.from_(self.bucket_name).update(
                    path=file_path,
                    file=content_data,
                    file_options={"content-type": content_type}
                )
                print(f"Update successful: {response}")
                return file_path
            except Exception as update_error:
                print(f"Update also failed: {str(update_error)}")
                raise Exception(f"Failed to save file: {str(e)}, Update failed: {str(update_error)}")

    def url(self, name):
        """Get the public URL for the file."""
        supabase = get_supabase_client()
        if not supabase:
            return f"/media/{name}"  # Fallback to local media URL
        try:
            response = supabase.storage.from_(self.bucket_name).get_public_url(name)
            return response
        except Exception as e:
            return f"/media/{name}"  # Fallback on error

    def delete(self, name):
        """Delete file from Supabase storage."""
        supabase = get_supabase_client()
        if not supabase:
            return
        try:
            supabase.storage.from_(self.bucket_name).remove([name])
        except Exception as e:
            print(f"Failed to delete file: {str(e)}")

    def exists(self, name):
        """Check if file exists in Supabase storage."""
        supabase = get_supabase_client()
        if not supabase:
            return False
        try:
            # Try to get file info
            supabase.storage.from_(self.bucket_name).list(path=os.path.dirname(name))
            return True
        except:
            return False

    def open(self, name, mode='rb'):
        """Open file from Supabase storage."""
        supabase = get_supabase_client()
        from io import BytesIO
        if not supabase:
            return BytesIO(b'')
        try:
            # Get the file content
            response = supabase.storage.from_(self.bucket_name).download(name)
            return BytesIO(response)
        except Exception as e:
            # For validation purposes, if file doesn't exist, return empty BytesIO
            # This prevents validation errors for non-existent files
            return BytesIO(b'')


    def size(self, name):
        """Return file size in bytes."""
        supabase = get_supabase_client()
        if not supabase:
            return 0
        try:
            files = supabase.storage.from_(self.bucket_name).list(path=os.path.dirname(name))
            for f in files:
                if f["name"] == os.path.basename(name):
                    return f.get("metadata", {}).get("size", 0)
            return 0
        except Exception:
            return 0

            
class OrganizationSupabaseStorage(SupabaseStorage):
    def __init__(self):
        super().__init__(bucket_name='organization_profile')


def user_profile_upload_path(instance, filename):
    """
    Generate upload path for user profile pictures.
    Structure: user_profile/{email}/{filename}
    """
    email = instance.email
    return f"user_profile/{email}/{filename}"

def organization_profile_upload_path(instance, filename):
    """
    Generate upload path for organization profile pictures.
    Structure: {org_name}/{filename}
    """
    org_name = instance.name.replace(' ', '_').lower()
    return f"{org_name}/{filename}"

class User(AbstractUser):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    course = models.ForeignKey(
        'organization.Program',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    year_level = models.PositiveSmallIntegerField(null=True, blank=True)
    profile_picture = models.ImageField(
        upload_to=user_profile_upload_path,
        storage=SupabaseStorage(),
        null=True,
        blank=True
    )

    def __str__(self):
        return self.username

