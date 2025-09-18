from rest_framework import serializers
from .models import Product, ProductImage, TransportLocation


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "uploaded_at")


class TransportLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportLocation
        fields = ("id", "lat", "lng", "recorded_at")


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    locations = TransportLocationSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        # Explicitly list fields instead of "__all__"
        fields = (
            "uid",
            "pid",
            "title",
            "variety",
            "acres",
            "quantity",
            "expected_harvest_date",
            "origin_lat",
            "origin_lng",
            "price",
            "description",
            "status",
            "admin_reason",
            "created_at",
            "approved_at",
            "tx_hash",
            "qr_code_data",
            "images",
            "locations",
            "farmer",
        )
        read_only_fields = (
            "uid",
            "pid",
            "status",
            "admin_reason",
            "created_at",
            "approved_at",
            "tx_hash",
            "qr_code_data",
            "images",
            "locations",
            "farmer",
        )
        
        def get_farmer(self, obj):
         return {
            "first_name": obj.farmer.first_name,
            "last_name": obj.farmer.last_name,
            "email": obj.farmer.email,
            "phone_number": getattr(obj.farmer, "phone_number", ""),  # if you have a custom field
            "location": getattr(obj.farmer, "location", ""),          # if you have a custom field
        }

class AdminProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    locations = TransportLocationSerializer(many=True, read_only=True)
    farmer = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "uid",
            "pid",
            "title",
            "variety",
            "acres",
            "quantity",
            "expected_harvest_date",
            "origin_lat",
            "origin_lng",
            "price",
            "description",
            "status",
            "admin_reason",
            "created_at",
            "approved_at",
            "tx_hash",
            "qr_code_data",
            "images",
            "locations",
            "farmer",
        )
        read_only_fields = fields  # admin should not modify via serializer directly

    def get_farmer(self, obj):
   
     if obj.farmer:
        user = obj.farmer  # farmer is already a User
        # If you still store phone_number and location in a separate Farmer model, adjust accordingly
        return {
            "first_name": user.first_name,
            "email": user.email,
            "phone_number": getattr(user, "phone_number", ""),  # optional fallback
            "location": getattr(user, "location", ""),          # optional fallback
        }
     return None

from rest_framework import serializers
from .models import Stage

class StageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stage
        fields = "__all__"   # or explicitly list the fields if you want more control
