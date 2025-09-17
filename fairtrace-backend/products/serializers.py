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
        )
