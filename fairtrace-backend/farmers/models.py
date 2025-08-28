from django.db import models
from django.conf import settings
import uuid

class Farmer(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
    ]

    uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='farmer_profile'
    )
    national_id = models.CharField(max_length=50)
    phone = models.CharField(max_length=30)
    farm_address = models.TextField()
    gps_lat = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    gps_long = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    farm_size = models.FloatField(null=True, blank=True)
    main_crops = models.TextField(blank=True)
    sacco_membership = models.CharField(max_length=100)
    sacco_name = models.CharField(max_length=200, blank=True)
    record_hash = models.CharField(max_length=66, blank=True)
    tx_hash = models.CharField(max_length=100, blank=True)
    onchain_status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.sacco_membership}"

    class Meta:
        ordering = ['-created_at']

# users/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()

class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return timezone.now() < self.created_at + timezone.timedelta(minutes=5)

    def __str__(self):
        return f"{self.user.email} - {self.code}"
