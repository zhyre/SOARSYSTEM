import re
from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import User

COMMON_PASSWORDS = [
    'password', '12345678', 'qwerty', '11111111', 'abcdefgh'
]

class StudentRegistrationForm(UserCreationForm):
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not email.endswith('@cit.edu'):
            raise forms.ValidationError('Email must end with @cit.edu')
        
        # Check if email follows firstname.lastname@cit.edu format
        username = email.split('@')[0]
        if '.' not in username or len(username.split('.')) != 2:
            raise forms.ValidationError('Email must be in the format: firstname.lastname@cit.edu')
            
        firstname, lastname = username.split('.')
        if not firstname or not lastname:
            raise forms.ValidationError('Email must be in the format: firstname.lastname@cit.edu')
            
        return email
        
    email = forms.EmailField(
        required=True,
        help_text='Email must be in the format: firstname.lastname@cit.edu',
        widget=forms.EmailInput(attrs={
            'placeholder': 'firstname.lastname@cit.edu',
            'pattern': r'^[a-zA-Z]+\.[a-zA-Z]+@cit\.edu$',
            'title': 'Email must be in the format: firstname.lastname@cit.edu'
        })
    )
    student_id = forms.CharField(
        required=True,
        help_text='Format: XX-XXXX-XXX (e.g., 12-3456-789)',
        widget=forms.TextInput(attrs={
            'placeholder': ' ',
            'pattern': r'\d{2}-\d{4}-\d{3}',
            'title': 'Format: 12-3456-789'
        })
    )
    COURSE_CHOICES = [
        ('', 'Select a course'),
        ('BS in Computer Science', 'BS in Computer Science'),
        ('BS in Information Technology', 'BS in Information Technology'),
        ('BS in Computer Engineering', 'BS in Computer Engineering'),
        ('BS in Information Systems', 'BS in Information Systems'),
        ('BS in Electronics Engineering', 'BS in Electronics Engineering'),
        ('BS in Civil Engineering', 'BS in Civil Engineering'),
        ('BS in Mechanical Engineering', 'BS in Mechanical Engineering'),
        ('BS in Electrical Engineering', 'BS in Electrical Engineering'),
    ]
    
    course = forms.ChoiceField(
        required=True,
        choices=COURSE_CHOICES,
        label='',
        widget=forms.Select(attrs={
            'class': 'form-select',
            'required': 'required',
            'onchange': "this.setCustomValidity('')",
            'oninvalid': "this.setCustomValidity('Please select a course')",
        })
    )
    year_level = forms.IntegerField(
        required=False,
        min_value=1,
        widget=forms.NumberInput(attrs={'placeholder': ' '})
    )

    first_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'placeholder': ' '})
    )
    last_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'placeholder': ' '})
    )

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'student_id', 'course', 'year_level', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if not isinstance(field.widget, forms.CheckboxInput):
                field.widget.attrs.update({'placeholder': ' '})

        # Password rules combined into one help text
        self.fields['password1'].help_text = (
            "Password must follow these rules:<br>"
            "• At least 8 characters<br>"
            "• Cannot be entirely numeric<br>"
            "• Cannot be too similar to username, email, or student ID<br>"
            "• Cannot be a common password"
        )

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not email.endswith('@cit.edu'):
            raise ValidationError('Email must end with @cit.edu')
        return email

    def clean_student_id(self):
        student_id = self.cleaned_data.get('student_id')
        if not re.match(r'^\d{2}-\d{4}-\d{3}$', student_id):
            raise ValidationError('Student ID must be in the format XX-XXXX-XXX (e.g., 12-3456-789)')
        return student_id

    def clean_password1(self):
        password = self.cleaned_data.get('password1')
        username = self.cleaned_data.get('username')
        email = self.cleaned_data.get('email')
        student_id = self.cleaned_data.get('student_id')

        if len(password) < 8:
            raise ValidationError('Your password must contain at least 8 characters.')

        if password.isdigit():
            raise ValidationError('Your password can’t be entirely numeric.')

        if username and username.lower() in password.lower():
            raise ValidationError('Your password can’t be too similar to your username.')
        
        if email and email.split('@')[0].lower() in password.lower():
            raise ValidationError('Your password can’t be too similar to your email.')

        if student_id and student_id in password:
            raise ValidationError('Your password can’t be too similar to your student ID.')

        if password.lower() in COMMON_PASSWORDS:
            raise ValidationError('Your password can’t be a commonly used password.')

        return password
    
class CustomLoginForm(AuthenticationForm):
    username = forms.CharField(label="Username")
    password = forms.CharField(label="Password", widget=forms.PasswordInput)

    def clean(self):
        """
        Override AuthenticationForm.clean to avoid performing Django authentication here.
        We validate presence of fields and defer auth to Supabase in the view.
        """
        # Bypass AuthenticationForm.clean() and only run base Form.clean()
        cleaned = forms.Form.clean(self)
        username = cleaned.get('username')
        password = cleaned.get('password')
        if not username or not password:
            raise ValidationError('Both username and password are required.')
        return cleaned

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'student_id', 'course', 'year_level', 'profile_picture'
        ]
        widgets = {
            'profile_picture': forms.FileInput(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if not isinstance(field.widget, forms.CheckboxInput):
                field.widget.attrs.update({'placeholder': ' '})

