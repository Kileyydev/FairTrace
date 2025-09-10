from django.urls import path
from . import views
from .views import RegisterView

urlpatterns = [
    path('', views.list_farmers, name='list_farmers'),
    path('register/', RegisterView.as_view(), name='farmer-register'),
    path('', views.list_farmers, name='list_farmers'),
]
