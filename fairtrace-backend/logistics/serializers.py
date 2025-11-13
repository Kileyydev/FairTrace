from rest_framework import serializers
from .models import Transporter, Delivery

class TransporterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transporter
        fields = ['id', 'user', 'phone', 'vehicle', 'license_plate', 'avatar']
        depth = 1  # so you can see the user info

class DeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = ['id', 'pickup', 'dropoff', 'eta', 'weight', 'qr_code', 'status', 'transporter']
