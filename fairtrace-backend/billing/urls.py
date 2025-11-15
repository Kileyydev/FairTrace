from django.urls import path
from .views import (
    WalletView,
    TipCreateView,
    TipsReceivedView,
    ConsumerLoginAPIView,
    ConsumerTipAPIView,
)

urlpatterns = [
    path("wallet/", WalletView.as_view(), name="wallet-detail"),
    path("tips/send/", TipCreateView.as_view(), name="tip-create"),
    path("tips/received/", TipsReceivedView.as_view(), name="tips-received"),
    path("consumer/login/", ConsumerLoginAPIView.as_view(), name="consumer-login"),
    path("consumer/tip/", ConsumerTipAPIView.as_view(), name="consumer-tip"),
]
