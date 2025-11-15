from django.contrib import admin
from .models import Wallet, Tip

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("user", "balance")

@admin.register(Tip)
class TipAdmin(admin.ModelAdmin):
    list_display = ("tx_id", "amount", "sender", "recipient", "created_at")
    readonly_fields = ("tx_id", "created_at")
