from rest_framework import serializers
from .models import Farmer

class FarmerSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='full_name', read_only=True)
    phone_number = serializers.CharField(source='phone', read_only=True)
    location = serializers.CharField(source='farm_address', read_only=True)

    class Meta:
        model = Farmer
        fields = ['first_name', 'email', 'phone_number', 'location']
