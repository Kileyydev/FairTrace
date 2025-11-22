from django.db import models
from django.conf import settings

class Listing(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('open', 'Open'),         # visible to public
        ('approved', 'Approved'), # sacco approved specific farmer sale
        ('closed', 'Closed'),     # completed
    ]
    sacco = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # sacco admin user
    title = models.CharField(max_length=200)
    product_type = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit = models.CharField(max_length=30, default='kg')
    price_per_unit = models.DecimalField(max_digits=12, decimal_places=2)  # visible price
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Sale(models.Model):
    # When a farmer agrees to sell to a listing (or when sacco records a purchase)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='sales')
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # or separate Farmer model
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=14, decimal_places=2)
    approved = models.BooleanField(default=False)
    paid = models.BooleanField(default=False)
    onchain_tx = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
