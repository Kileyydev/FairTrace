from django.urls import path
from .views import FeedbackListCreateAPIView

urlpatterns = [
    path("", FeedbackListCreateAPIView.as_view(), name="feedback-list-create"),
]
