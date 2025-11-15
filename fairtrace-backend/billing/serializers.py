from rest_framework import serializers
from .models import Wallet, Tip
from django.conf import settings

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ("user", "balance")
        read_only_fields = ("user",)

class TipCreateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    farmer_id = serializers.IntegerField(required=False)
    product_uid = serializers.UUIDField(required=False)
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate(self, data):
        if not data.get("farmer_id") and not data.get("product_uid"):
            raise serializers.ValidationError("Provide farmer_id or product_uid.")
        # amount must be positive handled by DecimalField
        return data

class TipListSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source="sender.email", read_only=True)
    recipient_email = serializers.EmailField(source="recipient.email", read_only=True)

    class Meta:
        model = Tip
        fields = [
            "id",
            "tx_id",
            "amount",
            "note",
            "anonymous_to_recipient",
            "created_at",
            "sender",
            "sender_email",
            "recipient",
            "recipient_email",
        ]

from rest_framework import serializers
from .models import Consumer

class ConsumerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consumer
        fields = ['id', 'name', 'phone', 'balance']
