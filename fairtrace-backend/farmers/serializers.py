

# farmers/serializers.py
from rest_framework import serializers
from .models import Farmer

class FarmerSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name  = serializers.CharField(source='user.last_name')
    email      = serializers.EmailField(source='user.email')

    class Meta:
        model = Farmer
        fields = ['first_name', 'last_name', 'email', 'phone', 'farm_address']