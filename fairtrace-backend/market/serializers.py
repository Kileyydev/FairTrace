from rest_framework import serializers
from .models import Listing, Sale

class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = '__all__'
        read_only_fields = ('sacco', 'created_at', 'updated_at')

class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ('onchain_tx','created_at','updated_at','approved','paid')
