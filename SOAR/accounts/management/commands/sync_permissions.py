from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from supabase import create_client
from decouple import config

User = get_user_model()

SUPABASE_URL = config("SUPABASE_URL")
SUPABASE_KEY = config("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class Command(BaseCommand):
    help = 'Sync permissions from Supabase to Django User model for superusers'

    def handle(self, *args, **options):
        self.stdout.write('Syncing permissions from Supabase...')

        # Query Supabase for superusers
        response = supabase.table('accounts_user').select('id').eq('is_superuser', True).execute()

        if not response.data:
            self.stdout.write(self.style.WARNING('No superusers found in Supabase.'))
            return

        superuser_ids = [str(user['id']) for user in response.data]

        for user_id in superuser_ids:
            try:
                user = User.objects.get(id=user_id)
                if not user.is_staff or not user.is_superuser:
                    user.is_staff = True
                    user.is_superuser = True
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f'Updated permissions for user: {user.username}'))
                else:
                    self.stdout.write(f'User {user.username} already has permissions.')
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with ID {user_id} not found in Django database.'))

        self.stdout.write(self.style.SUCCESS('Permission sync completed.'))