# logistics/urls.py
from django.urls import path
from .views import TransporterDeliveriesAPIView, TransporterMeAPIView, TransporterListAPIView

urlpatterns = [
    path("transporters/me/", TransporterMeAPIView.as_view(), name="transporter-me"),
    path("transporters/", TransporterListAPIView.as_view(), name="transporter-list"),
    path("transporters/deliveries/", TransporterDeliveriesAPIView.as_view(), name="transporter-deliveries"),
]
