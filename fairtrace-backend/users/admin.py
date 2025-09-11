from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTPToken

# Optional: show OTPToken inline in the User admin
class OTPTokenInline(admin.TabularInline):
    model = OTPToken
    extra = 0
    readonly_fields = ('otp_hash', 'created_at', 'expires_at', 'used')
    can_delete = True

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'is_sacco_admin')
    list_filter = ('is_staff', 'is_active', 'is_sacco_admin')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    inlines = [OTPTokenInline]  # <- this replaces OTP inline references

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_sacco_admin', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'is_staff', 'is_active', 'is_sacco_admin')}
        ),
    )
