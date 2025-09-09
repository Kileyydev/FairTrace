from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, LoginSerializer, VerifyOTPSerializer
from .models import OTPToken, User
from django.utils import timezone
from datetime import timedelta
import hashlib, secrets
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime


class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farmer = serializer.save()

        # 1. Generate SACCO Membership ID
        year = datetime.now().year

        # fetch SACCO (ensure frontend sends sacco_name or sacco_id)
        sacco = None
        sacco_code = "000"
        sacco_location = "Unknown"
        if farmer.sacco_name:  # assuming this is a FK to Sacco model
            sacco = farmer.sacco_name
            sacco_code = sacco.code
            sacco_location = sacco.location

        # Ensure uniqueness → use farmer.id padded to 4 digits
        unique_number = str(farmer.id).zfill(4)
        sacco_id = f"SACCO-{sacco_code}-{year}-{unique_number}"

        farmer.sacco_membership_id = sacco_id
        farmer.save()

        # 2. Send Email Notification
        try:
            send_mail(
                subject="🎉 Welcome to FairTrace – Your SACCO Membership ID",
                message=(
                    f"Dear {farmer.full_name},\n\n"
                    f"Congratulations! You are now registered on FairTrace.\n\n"
                    f"✅ Your SACCO Membership ID: {sacco_id}\n"
                    f"🏠 Registered SACCO: {sacco.name if sacco else 'N/A'}\n"
                    f"📍 Location: {sacco_location}\n\n"
                    f"Your details are securely stored and verified on the blockchain.\n"
                    f"Keep your SACCO Membership ID safe, you will use it for verification and product tracking.\n\n"
                    f"– FairTrace Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[farmer.email],
                fail_silently=True
            )
        except Exception as e:
            print(f"Email sending failed: {e}")

        # 3. Push Key Data to Blockchain (simplified, pseudocode)
        registration_hash = hashlib.sha256(
            f"{farmer.id}{farmer.email}{sacco_id}".encode()
        ).hexdigest()

        # blockchain_register_farmer(
        #     sacco_id=sacco_id,
        #     user_id=farmer.id,
        #     sacco_location=sacco_location,
        #     timestamp=str(timezone.now()),
        #     data_hash=registration_hash
        # )

        # 4. Response
        return Response(
            {
                "detail": "registered",
                "farmer_id": farmer.id,
                "sacco_id": sacco_id,
                "sacco_location": sacco_location,
                "blockchain_hash": registration_hash  # for debugging/verification
            },
            status=status.HTTP_201_CREATED
        )


class LoginAPIView(APIView):
    # Step 1: Verify password -> send OTP
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, email=email, password=password)
        if user is None:
            return Response(
                {'detail': 'invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate OTP
        otp_plain = f"{secrets.randbelow(10**6):06d}"
        otp_hash = hashlib.sha256(otp_plain.encode()).hexdigest()
        expires_at = timezone.now() + timedelta(minutes=10)

        OTPToken.objects.create(user=user, otp_hash=otp_hash, expires_at=expires_at)

        # Send via email (consider SMS or external email service in production)
        send_mail(
            subject='Your FairTrace OTP',
            message=f'Your FairTrace login code is: {otp_plain}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email]
        )

        return Response({'detail': 'otp_sent'})


class VerifyOTPAPIView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'detail': 'user not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Find valid OTP
        qs = user.otps.filter(used=False).order_by('-created_at')
        for token in qs:
            if token.verify(otp):
                # OTP valid — issue JWT token
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })

        return Response(
            {'detail': 'invalid or expired otp'},
            status=status.HTTP_400_BAD_REQUEST
        )

# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import OTPToken
import random
from django.core.mail import send_mail

class LoginSendOtp(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, email=email, password=password)
        if not user:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        OTPToken.objects.create(user=user, code=otp_code)

        # Send email (configure your email backend in settings.py)
        send_mail(
            "Your FairTrace OTP",
            f"Your OTP is {otp_code}. It expires in 5 minutes.",
            "no-reply@fairtrace.com",
            [email],
        )
        return Response({"message": "OTP sent to your email"}, status=status.HTTP_200_OK)

class VerifyOtp(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp_obj = OTPToken.objects.filter(user=user, code=otp_code).latest('created_at')
        except OTPToken.DoesNotExist:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        if not otp_obj.is_valid():
            return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        # OTP is valid; delete it so it can't be reused
        otp_obj.delete()

        return Response({"message": "OTP verified", "user": user.email}, status=status.HTTP_200_OK)

# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Product, ProductStage
from .serializers import ProductSerializer, ProductStageSerializer
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
    # For admin/Sacco use
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
