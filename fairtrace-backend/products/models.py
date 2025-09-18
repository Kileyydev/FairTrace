from django.db import models
from django.conf import settings
import uuid

User = settings.AUTH_USER_MODEL


class Product(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("declined", "Declined"),
        ("harvested", "Harvested"),
        ("in_transit", "In Transit"),
        ("delivered", "Delivered"),
    ]

    uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    pid = models.CharField(
        max_length=64, null=True, blank=True, unique=True
    )  # generated on approval
    farmer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="products"
    )
    title = models.CharField(max_length=200)
    variety = models.CharField(max_length=200, blank=True)
    acres = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    quantity = models.DecimalField(
        max_digits=12, decimal_places=3, null=True, blank=True
    )
    expected_harvest_date = models.DateField(null=True, blank=True)
    origin_lat = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    origin_lng = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    admin_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    tx_hash = models.CharField(
        max_length=128, blank=True, null=True
    )  # blockchain transaction hash
    qr_code_data = models.TextField(
        blank=True, null=True
    )  # base64 or data URL for QR code

    def __str__(self):
        return f"{self.title} - {self.status}"


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="product_images/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.title} ({self.uploaded_at.date()})"


class TransportLocation(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="locations"
    )
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.title} @ ({self.lat}, {self.lng})"

# products/models.py
from django.db import models
import uuid

class Stage(models.Model):
    uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

