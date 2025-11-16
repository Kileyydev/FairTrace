import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.conf import settings
from django.core.mail import send_mail
from web3 import Web3

from .serializers import FarmerSerializer
from .models import Farmer
from . import web3_helpers


class RegisterView(APIView):
    def post(self, request):
        data = request.data
        serializer = FarmerSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        farmer = serializer.save()

        # Build payload to hash (no raw PII on chain)
        payload = {
            "uid": str(farmer.uid),
            "full_name_hash": Web3.keccak(text=farmer.full_name).hex(),
            "national_id_hash": Web3.keccak(text=farmer.national_id).hex(),
            "phone_hash": Web3.keccak(text=farmer.phone).hex(),
            "email_hash": Web3.keccak(text=farmer.email).hex(),
            "gps": {"lat": str(farmer.gps_lat), "long": str(farmer.gps_long)},
            "sacco": {"membership": farmer.sacco_membership}
        }
        payload_json = json.dumps(payload, sort_keys=True)

        try:
            data_hash = web3_helpers.compute_data_hash(payload_json)
            tx_hash = web3_helpers.send_register_transaction(str(farmer.uid), data_hash)
            farmer.onchain_status = 'confirmed'
            farmer.onchain_tx = tx_hash
            farmer.contract_address = settings.CONTRACT_ADDRESS
            farmer.save()

            # Send email
            subject = "FairTrace Registration Successful"
            message = f"""Hello {farmer.full_name},

Your FairTrace account has been created.

Farmer ID: {farmer.uid}
Transaction: {tx_hash}
Contract: {settings.CONTRACT_ADDRESS}

Keep your Farmer ID safe.
"""
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [farmer.email], fail_silently=False)

            return Response({
                "msg": "registered",
                "farmer_id": str(farmer.uid),
                "tx": tx_hash
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            farmer.onchain_status = 'failed'
            farmer.save()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ Corrected farmers list endpoint
@api_view(['GET'])
def list_farmers(request):
    farmers = Farmer.objects.all()
    serializer = FarmerSerializer(farmers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# sacco_admin/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from products.models import Product
from products.serializers import ProductSerializer
from farmers.models import Farmer          # <-- import the Farmer model
from farmers.serializers import FarmerSerializer   # <-- you will create this

class SaccoAdminProductListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # only SACCO admins can see every product
        if not request.user.is_sacco_admin:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        products = Product.objects.select_related('farmer__user').all()
        data = []
        for p in products:
            # build the payload exactly the way the front-end expects
            farmer = p.farmer
            data.append({
                "uid": str(p.uid),
                "title": p.title,
                "variety": p.variety,
                "quantity": p.quantity,
                "acres": p.acres,
                "status": p.status,
                "description": p.description,
                "farmer": {
                    "first_name": farmer.user.first_name,
                    "last_name":  farmer.user.last_name,
                    "email":      farmer.user.email,
                    "phone":      farmer.phone,           # <-- from Farmer profile
                    "farm_address": farmer.farm_address,  # <-- from Farmer profile
                },
            })
        return Response(data)
