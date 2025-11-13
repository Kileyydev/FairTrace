from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.conf import settings


# ================================
# USER MANAGER
# ================================
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


# ================================
# USER MODEL (with transporter role)
# ================================
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_sacco_admin = models.BooleanField(default=False)
    is_transporter = models.BooleanField(default=False)  # ← ADDED: Transporter role
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email


# ================================
# TRANSPORTER PROFILE (One-to-One)
# ================================
class Transporter(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="transporter_profile"
    )
    vehicle = models.CharField(max_length=100)
    license_plate = models.CharField(max_length=20, unique=True)
    phone = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-set is_transporter = True when profile is created
        if not self.user.is_transporter:
            self.user.is_transporter = True
            self.user.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.vehicle} ({self.license_plate})"

    class Meta:
        verbose_name = "Transporter"
        verbose_name_plural = "Transporters"


# ================================
# OTP MODEL
# ================================
class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otps")
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_valid(self):
        return timezone.now() < self.created_at + timezone.timedelta(minutes=5)

    def __str__(self):
        return f"{self.user.email} - {self.code}"


# ================================
# OTP TOKEN
# ================================
class OTPToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp_hash = models.CharField(max_length=64, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.email} - {self.otp_hash}"


# ================================
# SACCO MODEL
# ================================
class Sacco(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    location = models.CharField(max_length=100)
    contact_info = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return self.name


# ================================
# PRODUCT & STAGE (unchanged)
# ================================
class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ProductStage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="stages")
    stage_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.product.name} - {self.stage_name}"