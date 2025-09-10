import uuid
from django.db import models

class Farmer(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
    ]

    uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    full_name = models.CharField(max_length=200)
    national_id = models.CharField(max_length=100)
    phone = models.CharField(max_length=50)
    email = models.EmailField()
    farm_address = models.TextField()
    gps_lat = models.DecimalField(max_digits=11, decimal_places=7, null=True, blank=True)
    gps_long = models.DecimalField(max_digits=11, decimal_places=7, null=True, blank=True)
    farm_size = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    main_crops = models.TextField(blank=True)
    sacco_membership = models.CharField(max_length=100)
    sacco_name = models.CharField(max_length=200, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    # on-chain fields
    onchain_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    onchain_tx = models.CharField(max_length=200, blank=True)
    contract_address = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.full_name} - {self.uid}"
