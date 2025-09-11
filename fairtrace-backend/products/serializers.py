from rest_framework import serializers
from .models import Product, ProductImage, TransportLocation

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id","image","uploaded_at")

class TransportLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportLocation
        fields = ("id","lat","lng","recorded_at")

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    locations = TransportLocationSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ("status","pid","uid","created_at","approved_at","tx_hash","qr_code_data")
