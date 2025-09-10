from django.http import JsonResponse
from django.contrib import admin
from django.urls import path, include

# Define the home function here
def home(request):
    return JsonResponse({"message": "FairTrace Backend is running!"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/farmers/', include('farmers.urls')),
    path('', home),
    path("api/products/", include("users.urls")),
    path("users/", include("farmers.urls")),
]
