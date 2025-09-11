from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Product, ProductImage, TransportLocation
from .serializers import ProductSerializer, ProductImageSerializer, TransportLocationSerializer
from .utils import generate_pid, create_qr_data_url
from tasks.anchor import enqueue_anchor  # we'll create a simple task enqueuer

class FarmerProductListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(farmer=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)

class ProductDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = "uid"

class UploadProductImageAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, uid):
        product = get_object_or_404(Product, uid=uid, farmer=request.user)
        img = request.FILES.get("image")
        if not img:
            return Response({"detail":"no image"}, status=400)
        pi = ProductImage.objects.create(product=product, image=img)
        return Response(ProductImageSerializer(pi).data, status=201)

# Admin views
class PendingProductsAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = ProductSerializer
    queryset = Product.objects.filter(status="pending").order_by("-created_at")

class ApproveProductAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, uid):
        product = get_object_or_404(Product, uid=uid)
        action = request.data.get("action")
        reason = request.data.get("reason", "")
        if action == "approve":
            product.status = "approved"
            product.approved_at = timezone.now()
            product.pid = generate_pid(product)
            product.qr_code_data = create_qr_data_url(product.pid)  # data:image/png;base64,...
            product.save()
            # enqueue anchor (async) — we'll implement a simple job runner
            enqueue_anchor(product.id)
            return Response({"detail":"approved","pid":product.pid}, status=200)
        else:
            product.status = "declined"
            product.admin_reason = reason
            product.save()
            return Response({"detail":"declined"}, status=200)

class PostLocationAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, uid):
        product = get_object_or_404(Product, uid=uid)
        lat = request.data.get("lat")
        lng = request.data.get("lng")
        if lat is None or lng is None:
            return Response({"detail":"lat and lng required"}, status=400)
        tl = TransportLocation.objects.create(product=product, lat=lat, lng=lng)
        # optional: notify via socket.io (we will)
        return Response(TransportLocationSerializer(tl).data, status=201)
