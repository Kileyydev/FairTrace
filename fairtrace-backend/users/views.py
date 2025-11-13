from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import datetime, timedelta
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
import hashlib, secrets
from .serializers import RegisterSerializer, LoginSerializer, VerifyOTPSerializer, ProductStageSerializer
from products.serializers import ProductSerializer
from .models import OTPToken, User, Product, ProductStage
from farmers.models import Farmer
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404

# ----------------------------
# Blockchain Task Import
# ----------------------------
from blockchain.tasks import register_farmer_onchain


class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farmer = serializer.save()

        # Auto-generate SACCO membership ID
        year = datetime.now().year
        unique_number = str(farmer.id).zfill(4)
        sacco_id = f"FT-{year}-{unique_number}"
        farmer.sacco_membership = sacco_id
        farmer.save()

        # Compute blockchain hash
        registration_hash = hashlib.sha256(
            f"{farmer.id}{farmer.email}{sacco_id}".encode()
        ).hexdigest()

        # Blockchain registration
        try:
            tx_hash = register_farmer_onchain(
                name=farmer.full_name,
                idHash=str(farmer.national_id),
                location=farmer.farm_address
            )
        except Exception as e:
            print(f"Blockchain registration failed: {e}")
            tx_hash = None

        # Send confirmation email
        try:
            send_mail(
                subject="🎉 Welcome to FairTrace – Your Farmer ID",
                message=(
                    f"Dear {farmer.full_name},\n\n"
                    f"Congratulations! You are successfully registered.\n\n"
                    f"✅ Your Farmer ID: {farmer.uid}\n"
                    f"✅ SACCO Membership ID: {sacco_id}\n"
                    f"✅ Blockchain TX: {tx_hash or 'Pending'}\n\n"
                    f"Keep your IDs safe.\n\n– FairTrace Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[farmer.email],
                fail_silently=True
            )
        except Exception as e:
            print(f"Email sending failed: {e}")

        return Response(
            {
                "detail": "registered",
                "farmer_id": str(farmer.uid),
                "sacco_id": sacco_id,
                "blockchain_hash": registration_hash,
                "tx_hash": tx_hash
            },
            status=status.HTTP_201_CREATED
        )


class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, email=email, password=password)
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate 6-digit OTP
        otp_plain = f"{secrets.randbelow(10**6):06d}"
        otp_hash = hashlib.sha256(otp_plain.encode()).hexdigest()
        expires_at = timezone.now() + timedelta(minutes=10)  # OTP valid for 10 min

        OTPToken.objects.create(user=user, otp_hash=otp_hash, expires_at=expires_at)

        # Send OTP via email
        send_mail(
            subject='Your FairTrace OTP',
            message=f'Your FairTrace login code is: {otp_plain}\n\nValid for 10 minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True
        )

        return Response({'detail': 'otp_sent'}, status=status.HTTP_200_OK)


# ----------------------------
# Verify OTP (issue JWT)
# ----------------------------
class VerifyOTPAPIView(APIView):
    permission_classes = [AllowAny]  # Login already verified credentials

    def post(self, request, *args, **kwargs):
        print("===== VERIFY OTP: incoming request.data =====")
        try:
            print(request.data)
        except Exception as e:
            print("Could not print request.data:", e)

        # Validate payload
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            print("===== VERIFY OTP: serializer.errors =====")
            print(serializer.errors)
            return Response(
                {"detail": "invalid input", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        otp = data["otp"]
        email = data.get("email")
        user_id = data.get("user_id")

        # Resolve user
        try:
            user = User.objects.get(id=user_id) if user_id else User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "user not found"}, status=status.HTTP_404_NOT_FOUND)

        # Query non-expired tokens
        now = timezone.now()
        tokens_qs = OTPToken.objects.filter(user=user, expires_at__gte=now).order_by("-created_at")
        print(f"Found {tokens_qs.count()} non-expired tokens for user {user.email}")

        # Compare OTP
        otp_hash = hashlib.sha256(otp.encode()).hexdigest()
        for token in tokens_qs:
            print(f"Checking token id={token.id} created_at={token.created_at}")
            if token.otp_hash == otp_hash:
                # Success: consume token and issue JWT with custom claims
                try:
                    token.delete()
                except Exception as e:
                    print(f"Warning: failed to delete OTP token id={token.id}: {e}")

                refresh = MyTokenObtainPairSerializer.get_token(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)

                return Response({
                    "refresh": refresh_token,
                    "access": access_token,
                }, status=status.HTTP_200_OK)

        # No matching tokens
        return Response(
            {"detail": "Invalid or expired OTP", "checked": tokens_qs.count()},
            status=status.HTTP_400_BAD_REQUEST
        )
# ----------------------------
# Product APIs
# ----------------------------
class ProductRegisterAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save(farmer=request.user)
            return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


import logging

class ProductListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Set up logger for this module
    logger = logging.getLogger(__name__)

    def get(self, request):
        products = Product.objects.filter(farmer=request.user)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        self.logger.debug(f"🟡 Incoming product data: {request.data}")
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            # ✅ attach the logged-in user as farmer
            serializer.save(farmer=request.user)
            self.logger.info("✅ Product created successfully")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            self.logger.error(f"❌ Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductStageListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pid):
        product = get_object_or_404(Product, pid=pid, farmer=request.user)
        stages = product.stages.all()
        serializer = ProductStageSerializer(stages, many=True)
        return Response(serializer.data)


class UpdateProductStageAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pid):
        product = get_object_or_404(Product, pid=pid, farmer=request.user)
        stage_name = request.data.get("stage_name")
        quantity = request.data.get("quantity")
        location = request.data.get("location", "")

        ProductStage.objects.create(
            product=product,
            stage_name=stage_name,
            quantity=quantity,
            location=location,
            scanned_qr=True
        )
        return Response({"detail": "Stage updated"}, status=status.HTTP_201_CREATED)

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
from .models import Transporter
from .serializers import TransporterSerializer

class TransporterListAPIView(APIView):
    permission_classes = [permissions.AllowAny]  # you can change this later

    def get(self, request):
        transporters = Transporter.objects.select_related("user").all()
        serializer = TransporterSerializer(transporters, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from products.models import Product  # ✅ make sure this is correct
from products.serializers import ProductSerializer
from logistics.models import Transporter

class ProductAllocateAPIView(APIView):
    """
    Allows a SACCO admin to allocate a product to a transporter.
    """

    def post(self, request, uid):
        try:
            product = Product.objects.get(uid=uid)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        transporter_id = request.data.get("transporter_id")
        if not transporter_id:
            return Response({"detail": "Transporter ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            transporter = Transporter.objects.get(id=transporter_id)
        except Transporter.DoesNotExist:
            return Response({"detail": "Transporter not found."}, status=status.HTTP_404_NOT_FOUND)

        # Allocate logic (customize if needed)
        product.transporter = transporter
        product.save()

        return Response({
            "message": f"Product '{product.title}' allocated to {transporter.user.email}",
            "product": ProductSerializer(product).data
        }, status=status.HTTP_200_OK)
