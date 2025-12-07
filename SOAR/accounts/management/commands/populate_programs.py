from django.core.management.base import BaseCommand
from SOAR.organization.models import Program

class Command(BaseCommand):
    help = 'Populate the Program table with initial data'

    def handle(self, *args, **options):
        programs = [
            {'abbreviation': 'BSCS', 'name': 'BS in Computer Science'},
            {'abbreviation': 'BSIT', 'name': 'BS in Information Technology'},
            {'abbreviation': 'BSCpE', 'name': 'BS in Computer Engineering'},
            {'abbreviation': 'BSIS', 'name': 'BS in Information Systems'},
            {'abbreviation': 'BSECE', 'name': 'BS in Electronics Engineering'},
            {'abbreviation': 'BSCE', 'name': 'BS in Civil Engineering'},
            {'abbreviation': 'BSME', 'name': 'BS in Mechanical Engineering'},
            {'abbreviation': 'BSEE', 'name': 'BS in Electrical Engineering'},
        ]

        for prog in programs:
            Program.objects.get_or_create(
                abbreviation=prog['abbreviation'],
                defaults={'name': prog['name']}
            )
            self.stdout.write(self.style.SUCCESS(f"Created or found program: {prog['name']}"))

        self.stdout.write(self.style.SUCCESS('Successfully populated programs'))