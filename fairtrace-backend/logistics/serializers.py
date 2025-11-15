# logistics/serializers.py
import logging
from rest_framework import serializers
from users.models import User
from .models import Delivery

logger = logging.getLogger(__name__)


# logistics/serializers.py
import logging
from rest_framework import serializers
from logistics.models import Transporter

# Create a logger for debugging
logger = logging.getLogger(__name__)

class TransporterSerializer(serializers.ModelSerializer):
    # Pull name/email/phone from the related User
    name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    vehicle = serializers.SerializerMethodField()
    license_plate = serializers.SerializerMethodField()

    class Meta:
        model = Transporter
        fields = ['id', 'name', 'email', 'phone', 'vehicle', 'license_plate']

    def get_name(self, obj):
        # Use full_name or first_name fallback
        name = getattr(obj.user, "get_full_name", None)
        if callable(name):
            name = name()
        if not name:
            name = getattr(obj.user, "first_name", None) or "Unnamed"
        logger.debug(f"[DEBUG] get_name for Transporter {obj.id}: {name}")
        return name

    def get_email(self, obj):
        email = getattr(obj.user, "email", None) or "no-email@example.com"
        logger.debug(f"[DEBUG] get_email for Transporter {obj.id}: {email}")
        return email

    def get_phone(self, obj):
        # Use Transporter phone, fallback to user phone if exists
        phone = getattr(obj, "phone", None) or getattr(obj.user, "phone_number", "—")
        logger.debug(f"[DEBUG] get_phone for Transporter {obj.id}: {phone}")
        return phone

    def get_vehicle(self, obj):
        vehicle = obj.vehicle or "—"
        logger.debug(f"[DEBUG] get_vehicle for Transporter {obj.id}: {vehicle}")
        return vehicle

    def get_license_plate(self, obj):
        license_plate = obj.license_plate or "—"
        logger.debug(f"[DEBUG] get_license_plate for Transporter {obj.id}: {license_plate}")
        return license_plate

class DeliverySerializer(serializers.ModelSerializer):
    transporter = TransporterSerializer(read_only=True)

    class Meta:
        model = Delivery
        fields = ['id', 'pickup', 'dropoff', 'eta', 'weight', 'qr_code', 'status', 'transporter']

