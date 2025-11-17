from django import forms
from .models import Program, Organization
from SOAR.accounts.models import User

class ProgramForm(forms.ModelForm):
    class Meta:
        model = Program
        fields = ['abbreviation', 'name']
        widgets = {
            'abbreviation': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., BSCS'}),
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., Bachelor of Science in Computer Science'}),
        }

class OrganizationEditForm(forms.ModelForm):
    adviser = forms.ModelChoiceField(
        queryset=User.objects.filter(is_staff=True),
        required=False,
        label="Adviser",
        help_text="Select a staff member to be the organization adviser.",
        widget=forms.Select(attrs={
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
        })
    )

    allowed_programs = forms.CharField(
        required=False,
        widget=forms.HiddenInput(),
    )

    def clean_allowed_programs(self):
        data = self.cleaned_data.get('allowed_programs')
        if data:
            try:
                # Split by comma and convert to integers
                program_ids = [int(pid.strip()) for pid in data.split(',') if pid.strip()]
                return program_ids
            except ValueError:
                raise forms.ValidationError("Invalid program IDs provided.")
        return []

    class Meta:
        model = Organization
        fields = ['name', 'description', 'adviser', 'is_public', 'profile_picture']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            }),
            'description': forms.Textarea(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
                'rows': 5
            }),
            'is_public': forms.CheckboxInput(attrs={
                'class': 'rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            }),
            'profile_picture': forms.FileInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
                'accept': 'image/*'
            }),
        }
