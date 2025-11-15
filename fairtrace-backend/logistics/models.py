# logistics/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone

# ================================
# Transporter profile
# ================================
class Transporter(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="logistics_transporter_profile"  # unique to logistics app
    )
    phone = models.CharField(max_length=20)
    vehicle = models.CharField(max_length=50)
    license_plate = models.CharField(max_length=20)
    avatar = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        # Safely get full_name, fallback to email
        full_name = getattr(self.user, "full_name", None)
        email = getattr(self.user, "email", None)
        return full_name or email or f"Transporter {self.id}"


# ================================
# Delivery model
# ================================
class Delivery(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_transit", "In Transit"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    transporter = models.ForeignKey(
        Transporter,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="logistics_deliveries"  # unique to logistics app
    )
    pickup = models.CharField(max_length=255)
    dropoff = models.CharField(max_length=255)
    eta = models.CharField(max_length=50)
    weight = models.CharField(max_length=50)
    qr_code = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Delivery #{self.id}"
