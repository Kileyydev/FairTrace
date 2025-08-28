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


class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farmer = serializer.save()
        return Response(
            {'detail': 'registered', 'farmer_id': farmer.id},
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
