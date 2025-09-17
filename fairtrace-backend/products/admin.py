from django.contrib import admin
from .models import Product, ProductImage, TransportLocation


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("title", "farmer", "status", "price", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("title", "farmer__username", "variety")


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "image", "uploaded_at")


@admin.register(TransportLocation)
class TransportLocationAdmin(admin.ModelAdmin):
    list_display = ("product", "lat", "lng", "recorded_at")
