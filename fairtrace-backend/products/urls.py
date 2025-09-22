from django.urls import path
from .views import (
    FarmerProductListCreateAPIView,
    ProductDetailAPIView,
    UploadProductImageAPIView,
    PendingProductsAPIView,
    ApproveProductAPIView,
    PostLocationAPIView,
    SaccoAdminProductsView
)
from . import views

urlpatterns = [
    path("products/", FarmerProductListCreateAPIView.as_view(), name="farmer-products"),
    path("products/<uuid:uid>/", ProductDetailAPIView.as_view(), name="product-detail"),
    path("products/<uuid:uid>/images/", UploadProductImageAPIView.as_view(), name="upload-image"),
    path("admin/pending-products/", PendingProductsAPIView.as_view(), name="pending-products"),
    path("admin/products/<uuid:uid>/approve/", ApproveProductAPIView.as_view(), name="approve-product"),
    path("products/<uuid:uid>/locations/", PostLocationAPIView.as_view(), name="post-location"),
    path("sacco_admin/products/<uuid:uid>/", views.ProductDetailAPIView.as_view(), name="product-detail"),
    path("sacco_admin/stages/", views.StageViewSet.as_view({"get": "list"}), name="sacco-admin-stages"),
    path("sacco_admin/products/", SaccoAdminProductsView.as_view(), name="sacco-admin-products"),
    path("sacco_admin/products/<uuid:uid>/", views.ProductDetailAPIView.as_view(), name="product-detail"),
    path("sacco_admin/stages/", views.StageViewSet.as_view({"get": "list"}), name="sacco-admin-stages"),
    path("sacco_admin/products/<uuid:uid>/decision/", ApproveProductAPIView.as_view(), name="sacco-decision"),

]
