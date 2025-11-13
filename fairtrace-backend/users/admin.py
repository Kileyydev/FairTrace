# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTPToken, Transporter


# ================================
# OTPToken Inline (for User admin)
# ================================
class OTPTokenInline(admin.TabularInline):
    model = OTPToken
    extra = 0
    readonly_fields = ('otp_hash', 'created_at', 'expires_at', 'used')
    can_delete = True
    show_change_link = True


# ================================
# Transporter Inline (for User admin)
# ================================
class TransporterInline(admin.StackedInline):
    model = Transporter
    can_delete = True
    extra = 0
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('vehicle', 'license_plate', 'phone')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


# ================================
# CUSTOM USER ADMIN
# ================================
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'email',
        'first_name',
        'last_name',
        'is_staff',
        'is_active',
        'is_sacco_admin',
        'is_transporter',  # ← NEW
        'date_joined',
    )
    list_filter = (
        'is_staff',
        'is_active',
        'is_sacco_admin',
        'is_transporter',  # ← NEW
        'date_joined',
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    inlines = [TransporterInline, OTPTokenInline]  # ← Both inlines

    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name')
        }),
        ('Roles', {
            'fields': ('is_sacco_admin', 'is_transporter'),  # ← NEW
        }),
        ('Permissions', {
            'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',),
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'password1',
                'password2',
                'first_name',
                'last_name',
                'is_staff',
                'is_active',
                'is_sacco_admin',
                'is_transporter',  # ← NEW
            )
        }),
    )

    readonly_fields = ('date_joined', 'last_login')
    filter_horizontal = ('groups', 'user_permissions',)


# ================================
# TRANSPORTER ADMIN (Standalone)
# ================================
@admin.register(Transporter)
class TransporterAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'vehicle',
        'license_plate',
        'phone',
        'created_at',
    )
    list_filter = ('created_at',)
    search_fields = (
        'user__email',
        'user__first_name',
        'user__last_name',
        'license_plate',
        'vehicle',
    )
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('user',)

    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Vehicle Info', {
            'fields': ('vehicle', 'license_plate', 'phone')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')