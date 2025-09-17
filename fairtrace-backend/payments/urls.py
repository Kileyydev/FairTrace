from django.urls import path
from .views import PaymentListCreateAPIView

urlpatterns = [
    path("", PaymentListCreateAPIView.as_view(), name="payment-list-create"),
]
