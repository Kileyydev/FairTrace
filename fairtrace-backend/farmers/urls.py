from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_farmers, name='list_farmers'),
]
