from rest_framework import serializers
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from django.core.mail import send_mail
from datetime import timedelta
import secrets

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User, OTPToken, ProductStage
from users.models import Transporter
from farmers.models import Farmer
from farmers.utils import canonical_farmer_string, sha256_hex
from products.models import Product


# ================================
# 1. REGISTER SERIALIZER (Farmer)
# ================================
class RegisterSerializer(serializers.Serializer):
    fullName = serializers.CharField()
    nationalId = serializers.CharField()
    phone = serializers.CharField()
    email = serializers.EmailField()
    farmAddress = serializers.CharField()
    gpsLat = serializers.CharField(allow_blank=True, required=False)
    gpsLong = serializers.CharField(allow_blank=True, required=False)
    farmSize = serializers.FloatField(required=False)
    mainCrops = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        # --- 1. Create the User ---
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )

        # --- 2. Create Farmer ---
        farmer = Farmer.objects.create(
            user=user,
            full_name=validated_data['fullName'],
            national_id=validated_data['nationalId'],
            phone=validated_data['phone'],
            email=validated_data['email'],
            farm_address=validated_data['farmAddress'],
            gps_lat=validated_data.get('gpsLat') or None,
            gps_long=validated_data.get('gpsLong') or None,
            farm_size=validated_data.get('farmSize'),
            main_crops=validated_data.get('mainCrops', ''),
        )

        # --- 3. Compute canonical + hash for blockchain ---
        canonical = canonical_farmer_string({
            'fullName': validated_data['fullName'],
            'nationalId': validated_data['nationalId'],
            'saccoMembership': getattr(farmer, 'sacco_membership', ''),
            'gpsLat': validated_data.get('gpsLat', ''),
            'gpsLong': validated_data.get('gpsLong', ''),
            'farmAddress': validated_data['farmAddress'],
            'timestamp': int(timezone.now().timestamp())
        })

        record_hash = sha256_hex(canonical)
        farmer.record_hash = record_hash
        farmer.save()

        # --- 4. Send confirmation email ---
        send_mail(
            subject="FairTrace Registration Successful",
            message=f"Dear {farmer.full_name},\n\nYour registration is successful.\nFarmer ID: {farmer.uid}\nSACCO Membership: {getattr(farmer, 'sacco_membership', '')}\n\nThank you for registering with FairTrace.",
            from_email="no-reply@fairtrace.com",
            recipient_list=[farmer.email],
            fail_silently=True
        )

        return farmer


# ================================
# 2. LOGIN SERIALIZER
# ================================
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


# ================================
# 3. OTP CREATE SERIALIZER
# ================================
class OTPCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def create(self, validated_data):
        try:
            user = User.objects.get(email=validated_data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email.")

        # Generate 6-digit OTP
        otp_plain = f"{secrets.randbelow(999999):06d}"
        otp_hash = sha256_hex(otp_plain)

        expires_at = timezone.now() + timedelta(minutes=10)

        otp_obj = OTPToken.objects.create(
            user=user,
            otp_hash=otp_hash,
            created_at=timezone.now(),
            expires_at=expires_at,
            used=False
        )

        # Send OTP via email
        send_mail(
            subject="Your FairTrace OTP",
            message=f"Your OTP is: {otp_plain}\nValid for 10 minutes.\nExpires at: {expires_at.astimezone().strftime('%Y-%m-%d %H:%M:%S %Z')}",
            from_email="no-reply@fairtrace.com",
            recipient_list=[user.email],
            fail_silently=True
        )

        return otp_obj


# ================================
# 4. OTP VERIFY SERIALIZER
# ================================
class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    user_id = serializers.IntegerField(required=False)
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        if not data.get("email") and not data.get("user_id"):
            raise serializers.ValidationError("Either 'email' or 'user_id' must be provided.")

        otp = data.get("otp", "")
        if not otp.isdigit() or len(otp) != 6:
            raise serializers.ValidationError({"otp": "OTP must be a 6-digit numeric code."})

        return data


# ================================
# 5. TRANSPORTER SERIALIZER
# ================================
from rest_framework import serializers
from users.models import Transporter

class TransporterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)  # ensure phone comes from user

    class Meta:
        model = Transporter
        fields = ['id', 'name', 'email', 'phone', 'vehicle', 'license_plate']
        read_only_fields = ['id', 'name', 'email', 'phone']


# ================================
# 6. PRODUCT & STAGE SERIALIZERS
# ================================
from rest_framework import serializers
from .models import Product

from rest_framework import serializers
from products.models import Product



class ProductStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductStage
        fields = "__all__"


# ================================
# 7. CUSTOM JWT TOKEN (with roles)
# ================================
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Inject roles into JWT
        token['user_id'] = user.id
        token['email'] = user.email
        token['is_sacco_admin'] = user.is_sacco_admin
        token['is_transporter'] = user.is_transporter  # ← CRITICAL

        # Optional: Add transporter profile data if exists
        if hasattr(user, 'transporter_profile'):
            token['transporter_id'] = user.transporter_profile.id
            token['vehicle'] = user.transporter_profile.vehicle
            token['license_plate'] = user.transporter_profile.license_plate

        return token