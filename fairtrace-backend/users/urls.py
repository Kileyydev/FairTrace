from django.urls import path
from .views import RegisterAPIView, LoginAPIView, VerifyOTPAPIView


urlpatterns = [
path('register/', RegisterAPIView.as_view(), name='register'),
path('login/', LoginAPIView.as_view(), name='login'),
path('verify-otp/', VerifyOTPAPIView.as_view(), name='verify-otp'),
]