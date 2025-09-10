from rest_framework import serializers
from .models import Farmer

class FarmerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farmer
        fields = '__all__'
        read_only_fields = ('uid','created_at','onchain_status','onchain_tx','contract_address')
