from django.http import JsonResponse
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Define the home function here
def home(request):
    return JsonResponse({"message": "FairTrace Backend is running!"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/farmers/', include('farmers.urls')),
    path('', home),
   # path("api/products/", include("users.urls")),
    path('api/', include('products.urls')),
    path("users/", include("farmers.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/feedbacks/", include("feedbacks.urls")),
    # ✅ JWT endpoints
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
