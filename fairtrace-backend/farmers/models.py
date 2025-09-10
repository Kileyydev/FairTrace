from django.db import models
from django.conf import settings
import uuid
import qrcode
from io import BytesIO
from django.core.files import File


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
    record_hash = models.CharField(max_length=66, blank=True)  # blockchain storage hash
    tx_hash = models.CharField(max_length=100, blank=True)      # Ethereum tx hash
    onchain_status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.sacco_membership}"

    class Meta:
        ordering = ['-created_at']


class Product(models.Model):
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=100)
    product_type = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/')
    status = models.CharField(max_length=50, default="pending_verification")
    pid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def generate_qr(self):
        qr_img = qrcode.make(str(self.pid))
        buffer = BytesIO()
        qr_img.save(buffer, format="PNG")
        filename = f"{self.pid}.png"
        self.qr_code.save(filename, File(buffer))
        self.save()

    def __str__(self):
        return f"{self.name} ({self.farmer.user.email})"


class ProductStage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="stages")
    stage_name = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=100, blank=True, null=True)
    scanned_qr = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.stage_name} for {self.product.name}"
