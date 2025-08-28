from rest_framework import serializers
from .models import User, OTPToken
from farmers.models import Farmer
from django.utils import timezone
from datetime import timedelta
import hashlib, secrets
from farmers.utils import canonical_farmer_string, sha256_hex


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
    saccoMembership = serializers.CharField()
    saccoName = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        # Create user
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )

        # Create farmer profile
        farmer = Farmer.objects.create(
            user=user,
            national_id=validated_data['nationalId'],
            phone=validated_data['phone'],
            farm_address=validated_data['farmAddress'],
            gps_lat=validated_data.get('gpsLat') or None,
            gps_long=validated_data.get('gpsLong') or None,
            farm_size=validated_data.get('farmSize'),
            main_crops=validated_data.get('mainCrops', ''),
            sacco_membership=validated_data['saccoMembership'],
            sacco_name=validated_data.get('saccoName', ''),
        )

        # Compute canonical + hash for blockchain integrity
        canonical = canonical_farmer_string({
            'fullName': validated_data['fullName'],
            'nationalId': validated_data['nationalId'],
            'saccoMembership': validated_data['saccoMembership'],
            'gpsLat': validated_data.get('gpsLat', ''),
            'gpsLong': validated_data.get('gpsLong', ''),
            'farmAddress': validated_data['farmAddress'],
            'timestamp': int(timezone.now().timestamp())
        })

        record_hash = sha256_hex(canonical)
        farmer.record_hash = record_hash
        farmer.save()

        # Queue on-chain transaction via Celery
        from blockchain.tasks import register_farmer_onchain
        register_farmer_onchain.delay(str(farmer.id), record_hash, farmer.sacco_membership)

        return farmer


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()

# users/serializers.py
from rest_framework import serializers
from .models import Product, ProductStage

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ("farmer", "status", "pid", "qr_code", "created_at", "updated_at")

class ProductStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductStage
        fields = "__all__"
        read_only_fields = ("product", "scanned_qr", "updated_at")
