# logistics/urls.py
from django.urls import path
from .views import TransporterDeliveriesAPIView, TransporterMeAPIView, TransporterListAPIView, PendingDeliveryRequestsAPIView, AcceptDeliveryRequestAPIView, CompleteDeliveryAPIView, AcceptedDeliveryRequestsAPIView, DeliveredDeliveryRequestsAPIView, MyProductsAPIView
from .views import RejectDeliveryRequestAPIView

urlpatterns = [
    path("transporters/me/", TransporterMeAPIView.as_view(), name="transporter-me"),
    path("transporters/", TransporterListAPIView.as_view(), name="transporter-list"),
    path("transporters/deliveries/", TransporterDeliveriesAPIView.as_view(), name="transporter-deliveries"),
    path("delivery-requests/pending/", PendingDeliveryRequestsAPIView.as_view(), name="pending-deliveries"),
    path("delivery/<uuid:product_uid>/accept/", AcceptDeliveryRequestAPIView.as_view(), name="accept-delivery"),
    path("delivery/<uuid:product_uid>/complete/", CompleteDeliveryAPIView.as_view(), name="complete-delivery"),
    path("delivery-requests/accepted/", AcceptedDeliveryRequestsAPIView.as_view(), name="accepted-deliveries"),
    path("delivery-requests/delivered/", DeliveredDeliveryRequestsAPIView.as_view(), name="delivered-deliveries"),
    path("transporters/me/products/", MyProductsAPIView.as_view(), name="my-products"),
    path("delivery/<uuid:product_uid>/reject/", RejectDeliveryRequestAPIView.as_view(), name="reject-delivery"),


]

