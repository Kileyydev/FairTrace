from django.contrib import admin
from .models import Farmer

@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    list_display = ('user', 'sacco_membership', 'national_id', 'onchain_status', 'created_at')
    search_fields = ('user__email', 'national_id', 'sacco_membership')
    list_filter = ('onchain_status', 'created_at')
