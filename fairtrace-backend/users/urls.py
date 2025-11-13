from django.urls import path
from .views import RegisterAPIView, LoginAPIView, VerifyOTPAPIView
from .views import ProductRegisterAPIView, ProductListAPIView, ProductStageListAPIView, UpdateProductStageAPIView, MyTokenObtainPairView, TransporterListAPIView

urlpatterns = [
path('register/', RegisterAPIView.as_view(), name='register'),
path('login/', LoginAPIView.as_view(), name='login'),
path('verify-otp/', VerifyOTPAPIView.as_view(), name='verify-otp'),
path("register/", ProductRegisterAPIView.as_view(), name="product-register"),
path("", ProductListAPIView.as_view(), name="product-list"),
path("<uuid:pid>/stages/", ProductStageListAPIView.as_view(), name="product-stages"),
path("<uuid:pid>/update-stage/", UpdateProductStageAPIView.as_view(), name="update-stage"),
 #path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
 path('transporters/', TransporterListAPIView.as_view(), name='transporter-list'),

]




