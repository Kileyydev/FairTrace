from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import datetime, timedelta
from django.core.mail import send_mail
from django.conf import settings
import hashlib, secrets
from .serializers import RegisterSerializer, LoginSerializer, VerifyOTPSerializer
from .models import OTPToken, User
from farmers.models import Farmer

# ----------------------------
# Registration
# ----------------------------
# Import your blockchain task
from blockchain.tasks import register_farmer_onchain  # make sure this exists and returns tx hash

class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farmer = serializer.save()

        # Auto-generate SACCO membership ID
        year = datetime.now().year
        unique_number = str(farmer.id).zfill(4)  # ensure 4-digit unique ID
        sacco_id = f"FT-{year}-{unique_number}"
        farmer.sacco_membership = sacco_id
        farmer.save()

        # Compute simple blockchain hash
        registration_hash = hashlib.sha256(
            f"{farmer.id}{farmer.email}{sacco_id}".encode()
        ).hexdigest()

        # --- BLOCKCHAIN REGISTRATION ---
        try:
            # This function should interact with Hardhat and return tx hash
            tx_hash = register_farmer_onchain(
                name=farmer.full_name,
                idHash=str(farmer.national_id),
                location=farmer.farm_address
            )
        except Exception as e:
            print(f"Blockchain registration failed: {e}")
            tx_hash = None

        # Send Farmer ID via email
        try:
            send_mail(
                subject="🎉 Welcome to FairTrace – Your Farmer ID",
                message=(
                    f"Dear {farmer.full_name},\n\n"
                    f"Congratulations! You are successfully registered.\n\n"
                    f"✅ Your Farmer ID: {farmer.uid}\n"
                    f"✅ SACCO Membership ID: {sacco_id}\n"
                    f"✅ Blockchain TX: {tx_hash or 'Pending'}\n\n"
                    f"Your details are securely stored and verified on the blockchain.\n"
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

# ----------------------------
# Login (Send OTP)
# ----------------------------
class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, email=email, password=password)
        if not user:
            return Response({'detail': 'invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate 6-digit OTP
        otp_plain = f"{secrets.randbelow(10**6):06d}"
        otp_hash = hashlib.sha256(otp_plain.encode()).hexdigest()
        expires_at = timezone.now() + timedelta(minutes=10)

        OTPToken.objects.create(user=user, otp_hash=otp_hash, expires_at=expires_at)

        # Send OTP via email
        send_mail(
            subject='Your FairTrace OTP',
            message=f'Your FairTrace login code is: {otp_plain}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True
        )

        return Response({'detail': 'otp_sent'}, status=status.HTTP_200_OK)


# ----------------------------
# Verify OTP
# ----------------------------
class VerifyOTPAPIView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'user not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check for valid OTP
        qs = user.otps.filter(used=False).order_by('-created_at')
        for token in qs:
            if token.verify(otp):
                # OTP valid, issue JWT
                from rest_framework_simplejwt.tokens import RefreshToken
                refresh = RefreshToken.for_user(user)
                token.used = True
                token.save()
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })

        return Response({'detail': 'invalid or expired otp'}, status=status.HTTP_400_BAD_REQUEST)


# ----------------------------
# Product APIs
# ----------------------------
from .serializers import ProductSerializer, ProductStageSerializer
from .models import Product, ProductStage
from django.shortcuts import get_object_or_404

class ProductRegisterAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save(farmer=request.user)
            return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        products = Product.objects.filter(farmer=request.user)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


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
        product = get_object_or_404(Product, pid=pid)
        stage_name = request.data.get("stage_name")
        quantity = request.data.get("quantity")
        location = request.data.get("location", "")

        stage = ProductStage.objects.create(
            product=product,
            stage_name=stage_name,
            quantity=quantity,
            location=location,
            scanned_qr=True
        )
        return Response({"detail": "Stage updated"}, status=status.HTTP_201_CREATED)
