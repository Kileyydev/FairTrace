from django.urls import path
from .views import TraceProductAPIView

urlpatterns = [
    path('<uuid:uid>/', TraceProductAPIView.as_view(), name='trace-product'),
]
