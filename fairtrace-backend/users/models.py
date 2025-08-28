# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.conf import settings
import hashlib
import uuid
import qrcode
from io import BytesIO
from django.core.files import File


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser must have is_staff=True')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_sacco_admin = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class OTPToken(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='otps'
    )
    otp_hash = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def is_valid(self):
        return (not self.used) and (timezone.now() < self.expires_at)

    def verify(self, otp_plain: str) -> bool:
        hashed = hashlib.sha256(otp_plain.encode()).hexdigest()
        if hashed == self.otp_hash and self.is_valid():
            self.used = True
            self.save()
            return True
        return False


# Product models
class Product(models.Model):
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products")
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


class ProductStage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="stages")
    stage_name = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=100, blank=True, null=True)
    scanned_qr = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
