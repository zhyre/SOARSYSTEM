from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'student_id', 'course', 'year_level', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'course', 'year_level')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('email', 'student_id', 'course', 'year_level')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'student_id', 'course', 'year_level', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('username', 'email', 'student_id')
    ordering = ('username',)

admin.site.register(User, UserAdmin)
