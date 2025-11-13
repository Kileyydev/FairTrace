from django.urls import path
from .views import (
    FarmerProductListCreateAPIView,
    ProductDetailAPIView,
    UploadProductImageAPIView,
    PendingProductsAPIView,
    ApproveProductAPIView,
    PostLocationAPIView,
    SaccoAdminProductsView,
    SaccoAdminDecisionAPIView,
    ProductDecisionAPIView,
    TraceProductAPIView,
    update_status  # <-- import the missing view
)
from . import views
from users.views import ProductAllocateAPIView
from .views import ProductListAPIView


urlpatterns = [
    path("products/", FarmerProductListCreateAPIView.as_view(), name="farmer-products"),
    path("products/<uuid:uid>/", ProductDetailAPIView.as_view(), name="product-detail"),
    path("products/<uuid:uid>/images/", UploadProductImageAPIView.as_view(), name="upload-image"),
    path('products/<uuid:uid>/update_status/', views.update_status, name='update_status'),

    path("admin/pending-products/", PendingProductsAPIView.as_view(), name="pending-products"),
    path("admin/products/<uuid:uid>/approve/", ApproveProductAPIView.as_view(), name="approve-product"),
    path("products/<uuid:uid>/locations/", PostLocationAPIView.as_view(), name="post-location"),
    path("sacco_admin/products/<uuid:uid>/", views.ProductDetailAPIView.as_view(), name="product-detail"),
    path("sacco_admin/stages/", views.StageViewSet.as_view({"get": "list"}), name="sacco-admin-stages"),
    path("sacco_admin/products/", SaccoAdminProductsView.as_view(), name="sacco-admin-products"),
    path("sacco_admin/products/<uuid:uid>/", views.ProductDetailAPIView.as_view(), name="product-detail"),
    path("sacco_admin/stages/", views.StageViewSet.as_view({"get": "list"}), name="sacco-admin-stages"),
    path("sacco_admin/products/<uuid:uid>/decision/", ApproveProductAPIView.as_view(), name="sacco-decision"),
    #path("trace/<uuid:uid>/", views.TraceProductAPIView.as_view(), name="trace-product"),
     path('<uuid:uid>/', TraceProductAPIView.as_view(), name='trace-product'),
    path(
        'api/sacco_admin/products/<uuid:uid>/allocate/',  # ✅ must match 'uid'
        ProductAllocateAPIView.as_view(),
        name='product-allocate'
    ),
    path('products/', ProductListAPIView.as_view(), name='product-list-create'),
     path('sacco_admin/products/<uuid:uid>/decision/', ProductDecisionAPIView.as_view(), name='product-decision'),
]

from django.urls import path
from . import views

urlpatterns = [
    path('products/<uuid:uid>/allocate/', views.allocate_product, name='allocate-product'),
    #path('products/<uuid:uid>/decision/', views.product_decision, name='product-decision'),
    #path('sacco_admin/products/<uuid:uid>/decision/', views.ProductDecisionAPIView.as_view(), name='product-decision'),
    path('sacco_admin/products/<uuid:uid>/', views.ProductDetailAPIView.as_view()),
    path('api/products/', ProductListAPIView.as_view(), name='public-products'),
    path('sacco_admin/products/<uuid:uid>/decision/', views.ProductDecisionAPIView.as_view(), name='product-decision'),
    # ... other URLs
    path("products/<uuid:uid>/decision/", SaccoAdminDecisionAPIView.as_view(), name="product-decision"),
]

from django.urls import path
from . import views

urlpatterns = [
    path('sacco_admin/products/', views.sacco_admin_products, name='sacco-admin-products'),
    path('products/<uuid:uid>/allocate/', ProductAllocateAPIView.as_view(), name='product-allocate'),
    path('sacco_admin/products/<uuid:uid>/', views.sacco_admin_product_detail, name='sacco-admin-product-detail'),
    #path('sacco_admin/products/<uuid:uid>/decision/', views.product_decision, name='product-decision'),
]
   # products/urls.py
from django.urls import path
from .views import sacco_admin_products, sacco_admin_product_detail, ProductDecisionAPIView

urlpatterns = [
    # List all products
    path('sacco_admin/products/', sacco_admin_products, name='sacco-admin-products'),

    # Single product detail
    path('sacco_admin/products/<uuid:uid>/', sacco_admin_product_detail, name='sacco-admin-product-detail'),

    # Approve/reject product
    path('sacco_admin/products/<uuid:uid>/decision/', ProductDecisionAPIView.as_view(), name='product-decision'),
    path('products/<uuid:uid>/update_status/', views.update_status, name='update_status'),
]
