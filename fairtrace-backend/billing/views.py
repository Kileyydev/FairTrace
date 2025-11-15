from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from decimal import Decimal

from .models import Wallet, Tip, Consumer
from .serializers import WalletSerializer, TipCreateSerializer, TipListSerializer

# If your Product model is in another app (e.g., 'products' or 'trace'),
# import it here. Replace 'products' with the actual app name.
try:
    from products.models import Product  # <- change 'products' to your actual app name if different
except ImportError:
    Product = None

# --------------------------
# Wallet / Tip API for real users
# --------------------------

class WalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)


class TipCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        POST payload:
        {
          "amount": "100.00",
          "farmer_id": 12
        }
        or
        {
          "amount": "100.00",
          "product_uid": "uuid-of-product"
        }
        """
        serializer = TipCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data["amount"]
        note = serializer.validated_data.get("note", "")
        farmer_id = serializer.validated_data.get("farmer_id")
        product_uid = serializer.validated_data.get("product_uid")

        # determine recipient user
        if farmer_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            recipient = get_object_or_404(User, id=farmer_id)
        else:
            if Product is None:
                return Response({"detail": "Product model not configured on server."}, status=status.HTTP_400_BAD_REQUEST)
            product = get_object_or_404(Product, uid=product_uid)
            recipient = product.farmer

        if recipient.id == request.user.id:
            return Response({"detail": "Farmer cannot tip themselves."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            sender_wallet = Wallet.objects.select_for_update().get(user=request.user)
            recipient_wallet = Wallet.objects.select_for_update().get(user=recipient)

            if sender_wallet.balance < amount:
                return Response({"detail": "Insufficient balance."}, status=status.HTTP_400_BAD_REQUEST)

            # debit & credit
            sender_wallet.balance -= Decimal(amount)
            recipient_wallet.balance += Decimal(amount)
            sender_wallet.save()
            recipient_wallet.save()

            tip = Tip.objects.create(
                amount=amount,
                sender=request.user,
                recipient=recipient,
                anonymous_to_recipient=True,
                note=note or ""
            )

        return Response({
            "tx_id": str(tip.tx_id),
            "amount": str(tip.amount),
            "new_sender_balance": str(sender_wallet.balance),
            "recipient_id": recipient.id,
            "message": "Tip sent successfully."
        }, status=status.HTTP_201_CREATED)


class TipsReceivedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tips = Tip.objects.filter(recipient=request.user).order_by("-created_at")
        serializer = TipListSerializer(tips, many=True)
        return Response(serializer.data)

# --------------------------
# Pre-loaded Consumer accounts for frontend demo (no real users)
# --------------------------

class ConsumerLoginAPIView(APIView):
    """
    Login using pre-loaded consumer accounts (phone + PIN)
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        pin = request.data.get("pin")

        if not phone or not pin:
            return Response({"detail": "Phone and PIN required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            consumer = Consumer.objects.get(phone=phone, pin=pin)
        except Consumer.DoesNotExist:
            return Response({"detail": "Invalid phone or PIN"}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            "name": consumer.name,
            "phone": consumer.phone,
            "balance": str(consumer.balance)
        }, status=status.HTTP_200_OK)


from rest_framework.authentication import BaseAuthentication

class IgnoreAuthentication(BaseAuthentication):
    """
    Dummy authentication class that does nothing.
    """
    def authenticate(self, request):
        return None  # Always return None so DRF thinks user is anonymous but allowed

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from decimal import Decimal
from django.shortcuts import get_object_or_404

from .models import Consumer, Wallet
from products.models import Product  # make sure this is correct

class ConsumerTipAPIView(APIView):
    """
    Tip a farmer from pre-loaded consumer account.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        amount = request.data.get("amount")
        product_uid = request.data.get("product_uid")  # PID or UID from certificate

        if not phone or not amount or not product_uid:
            return Response(
                {"detail": "Phone, amount, and product UID are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1️⃣ Find consumer
        try:
            consumer = Consumer.objects.get(phone=phone)
        except Consumer.DoesNotExist:
            return Response({"detail": "Consumer not found"}, status=status.HTTP_404_NOT_FOUND)

        amount = Decimal(amount)
        if amount <= 0 or amount > consumer.balance:
            return Response(
                {"detail": "Invalid amount or insufficient balance"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2️⃣ Find product and associated farmer
        try:
            product = Product.objects.get(uid=product_uid)
            farmer = product.farmer
        except Product.DoesNotExist:
            return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        # 3️⃣ Get/create farmer wallet
        wallet, _ = Wallet.objects.get_or_create(user=farmer)

        # 4️⃣ Perform transaction atomically
        with transaction.atomic():
            consumer.balance -= amount
            consumer.save()

            wallet.balance += amount
            wallet.save()

            # Optional: fake tx for demo
            fake_tx = f"tx_{phone[-4:]}_{int(amount*100)}"

        return Response({
            "tx": fake_tx,
            "new_balance": str(consumer.balance),
            "farmer_wallet_balance": str(wallet.balance),
            "message": f"Tip of {amount} KSH sent to {farmer.email}"  # <-- FIXED
        }, status=status.HTTP_200_OK)


