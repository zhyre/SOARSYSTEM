from django import forms
from .models import Program, Organization
from SOAR.accounts.models import User

class AdminOrganizationCreateForm(forms.ModelForm):
    """Form for admins to create organizations."""
    adviser = forms.ModelChoiceField(
        queryset=User.objects.filter(is_staff=True),
        required=False,
        label="Adviser",
        help_text="Select a staff member to be the organization adviser.",
        widget=forms.Select(attrs={
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
        })
    )
    
    tags = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
            'placeholder': 'e.g., Academic, Sports, Cultural (comma-separated)'
        }),
        help_text='Enter categories/tags separated by commas'
    )

    class Meta:
        model = Organization
        fields = ['name', 'description', 'tags', 'adviser', 'profile_picture']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
                'placeholder': 'Enter organization name'
            }),
            'description': forms.Textarea(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
                'rows': 5,
                'maxlength': 500,
                'placeholder': 'Enter organization description (max 500 characters)'
            }),
            'profile_picture': forms.FileInput(attrs={
                'class': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
                'accept': 'image/jpeg,image/png'
            }),
        }

    def clean_name(self):
        """Validate organization name is unique."""
        name = self.cleaned_data.get('name', '').strip()
        if not name:
            raise forms.ValidationError('Organization name is required.')
        if Organization.objects.filter(name__iexact=name).exists():
            raise forms.ValidationError('An organization with this name already exists.')
        return name

    def clean_description(self):
        """Validate description is required and within limit."""
        description = self.cleaned_data.get('description', '').strip()
        if not description:
            raise forms.ValidationError('Description is required.')
        if len(description) > 500:
            raise forms.ValidationError('Description cannot exceed 500 characters.')
        return description

    def clean_tags(self):
        """Parse and validate tags."""
        tags_input = self.cleaned_data.get('tags', '').strip()
        if not tags_input:
            raise forms.ValidationError('At least one category/tag is required.')
        # Split by comma and clean
        tags = [tag.strip() for tag in tags_input.split(',') if tag.strip()]
        if not tags:
            raise forms.ValidationError('At least one category/tag is required.')
        # Validate each tag length
        for tag in tags:
            if len(tag) > 30:
                raise forms.ValidationError(f'Tag "{tag}" is too long. Maximum 30 characters per tag.')
        return tags

    def clean_profile_picture(self):
        """Validate profile picture if provided."""
        picture = self.cleaned_data.get('profile_picture')
        if picture:
            # Check file extension
            if not picture.name.lower().endswith(('.jpg', '.jpeg', '.png')):
                raise forms.ValidationError('Only JPG and PNG images are allowed.')
        return picture

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
