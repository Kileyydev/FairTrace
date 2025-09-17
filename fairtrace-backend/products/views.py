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
    
    
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Product
from .serializers import AdminProductSerializer
import uuid
import qrcode
import io
from base64 import b64encode

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_product(request, product_uid):
    try:
        product = Product.objects.get(uid=product_uid)
        if request.data.get("action") == "approve":
            # Generate PID
            product.pid = str(uuid.uuid4())
            product.status = "Approved"
            
            # Generate QR code with PID
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(product.pid)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            product.qr_code_data = "data:image/png;base64," + b64encode(buffer.getvalue()).decode()
            
            # TODO: Store approved product info on blockchain
            # store_on_blockchain(product)
            
            product.save()
            return Response(AdminProductSerializer(product).data)
        elif request.data.get("action") == "reject":
            product.status = "Rejected"
            product.admin_reason = request.data.get("review", "")
            product.save()
            return Response(AdminProductSerializer(product).data)
        else:
            return Response({"detail": "Invalid action"}, status=400)
    except Product.DoesNotExist:
        return Response({"detail": "Product not found"}, status=404)

def all_products(request):
    if not request.user.is_sacco_admin:
        return Response({"detail": "Not authorized"}, status=403)
    products = Product.objects.all()
    serializer = AdminProductSerializer(products, many=True)
    return Response(serializer.data)

def sacco_admin_products(request):
    products = Product.objects.all().order_by('-created_at')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

class SaccoAdminProductsView(APIView):
     def get(self, request):
        products = Product.objects.all()
        serializer = AdminProductSerializer(products, many=True)
        return Response(serializer.data)

