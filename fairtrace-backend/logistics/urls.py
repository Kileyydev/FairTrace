from django.urls import path
from .views import TransporterMeAPIView, TransporterDeliveriesAPIView

urlpatterns = [
    path('transporters/me/', TransporterMeAPIView.as_view(), name='transporter-me'),
    path('deliveries/transporter/', TransporterDeliveriesAPIView.as_view(), name='transporter-deliveries'),
]
