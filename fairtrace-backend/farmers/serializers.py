from rest_framework import serializers
from .models import Farmer

class FarmerSerializer(serializers.ModelSerializer):
    # Add location to map farm_address
    location = serializers.CharField(source='farm_address', read_only=True)

    class Meta:
        model = Farmer
        fields = '__all__'  # keep all model fields
        read_only_fields = ('uid', 'created_at', 'onchain_status', 'onchain_tx', 'contract_address')
