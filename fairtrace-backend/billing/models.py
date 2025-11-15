from django.conf import settings
from django.db import models, transaction
from django.utils import timezone
import uuid
from decimal import Decimal

User = settings.AUTH_USER_MODEL  # string; use in FK below

class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # KSH

    def __str__(self):
        return f"Wallet({self.user}, {self.balance})"

class Tip(models.Model):
    tx_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="tips_sent", null=True, blank=True)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tips_received")
    anonymous_to_recipient = models.BooleanField(default=True)  # for explicitness
    created_at = models.DateTimeField(default=timezone.now)
    note = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Tip {self.tx_id} {self.amount} from {self.sender} -> {self.recipient}"

from django.db import models

class Consumer(models.Model):
    phone = models.CharField(max_length=20, unique=True)
    pin = models.CharField(max_length=10)  # store as plain for demo (hash for prod)
    balance = models.DecimalField(default=5000, max_digits=10, decimal_places=2)
    name = models.CharField(max_length=60)

    def __str__(self):
        return f"{self.name} ({self.phone})"
