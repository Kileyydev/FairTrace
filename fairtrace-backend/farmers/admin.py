from django.contrib import admin
from .models import Farmer

@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'sacco_membership', 'national_id', 'onchain_status', 'created_at')
    search_fields = ('email', 'full_name', 'national_id', 'sacco_membership', 'sacco_name')
    list_filter = ('onchain_status', 'created_at')
