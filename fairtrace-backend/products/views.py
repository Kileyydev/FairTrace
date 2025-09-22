from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Product, ProductImage, TransportLocation, Stage
from .serializers import ProductSerializer, ProductImageSerializer, TransportLocationSerializer, StageSerializer
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

class StageViewSet(viewsets.ModelViewSet):
    queryset = Stage.objects.all()
    serializer_class = StageSerializer
    lookup_field = "uid"   # 👈 this tells DRF to use the uuid field

# products/views.py (append or create ApproveProductAPIView)
import os
import json
import base64
import qrcode
import io
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from web3 import Web3, HTTPProvider
from django.core.mail import send_mail
from django.conf import settings
from .models import Product

# helper to load abi
import os
import json
from pathlib import Path

def load_contract_abi():
    abi_path = os.environ.get("CONTRACT_ABI_PATH")
    if not abi_path:
        raise ValueError("❌ CONTRACT_ABI_PATH is not set in .env")

    # If path is relative, resolve it relative to project root
    if not os.path.isabs(abi_path):
        base_dir = Path(__file__).resolve().parent.parent  # backend root
        abi_path = base_dir / abi_path

    if not os.path.exists(abi_path):
        raise FileNotFoundError(f"❌ ABI file not found at: {abi_path}")

    with open(abi_path, "r") as f:
        contract_json = json.load(f)

    return contract_json["abi"]

class ApproveProductAPIView(APIView):
    permission_classes = [IsAuthenticated]  # optionally restrict to sacco admins

    def post(self, request, uid):
        """
        body: { action: "approve"|"reject", review: "..." }
        """
        user = request.user
        # check user.is_sacco_admin or other permission
        if not getattr(user, "is_sacco_admin", False):
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        action = request.data.get("action")
        review = request.data.get("review", "")

        try:
            product = Product.objects.get(uid=uid)
        except Product.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == "reject":
            product.status = "rejected"
            product.admin_reason = review
            product.approved_at = timezone.now()
            product.save()

            # send rejection email
            try:
                send_mail(
                    subject="Your product has been rejected",
                    message=(
                        f"Dear {product.farmer.full_name},\n\n"
                        f"Your product '{product.title}' was rejected by the SACCO admin.\n\n"
                        f"Reason: {review}\n\nPlease correct and re-submit.\n\nRegards,\nFairTrace"
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[product.farmer.email],
                    fail_silently=True
                )
            except Exception as e:
                print("Email error:", e)

            serializer_data = {
                "uid": str(product.uid),
                "status": product.status,
                "admin_reason": product.admin_reason,
            }
            return Response(serializer_data, status=status.HTTP_200_OK)

        elif action == "approve":
            # generate PID (simple, you can adapt to your scheme)
            pid = f"PID-{timezone.now().strftime('%Y%m%d')}-{str(product.id).zfill(6)}"
            product.pid = pid

            # Optionally create metadata URI (IPFS, S3 etc). We'll include basic metadata string
            metadata_uri = f"FairTrace: product {pid} by {product.farmer.email}"

            # --- Call smart contract ---
            web3_provider = os.environ.get("WEB3_PROVIDER") or settings.WEB3_PROVIDER
            w3 = Web3(HTTPProvider(web3_provider))

            contract_address = Web3.to_checksum_address(settings.PRODUCT_REGISTRY_ADDRESS)

            abi = load_contract_abi()
            contract = w3.eth.contract(address=contract_address, abi=abi)

            admin_priv = os.environ.get("ADMIN_WALLET_PRIVATE_KEY")
            admin_addr = Web3.to_checksum_address(os.environ.get("ADMIN_WALLET_ADDRESS"))


            # Build transaction
            try:
                nonce = w3.eth.get_transaction_count(admin_addr)
                tx = contract.functions.registerProduct(
                    pid,
                    product.title[:200],
                    product.farmer.email[:200],
                    metadata_uri[:200]
                ).build_transaction({
                    "from": admin_addr,
                    "nonce": nonce,
                    "gas": 500000,
                    "gasPrice": w3.to_wei('2', 'gwei')
                })

                signed = w3.eth.account.sign_transaction(tx, private_key=admin_priv)
                tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)  # ✅ correct

                tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

                tx_hex = tx_hash.hex()
                product.tx_hash = tx_hex
            except Exception as e:
                import traceback
                print("❌ Blockchain registration failed:", str(e))
                traceback.print_exc()  # full stack trace in Django console
                return Response(
                    {"detail": "Blockchain registration failed", "error": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )


            # --- generate QR code (Data URI) ---
            try:
                qr_payload = {
                    "pid": pid,
                    "product_uid": str(product.uid),
                    "tx": product.tx_hash
                }
                qr_text = json.dumps(qr_payload)
                qr_img = qrcode.make(qr_text)
                buffered = io.BytesIO()
                qr_img.save(buffered, format="PNG")
                img_bytes = buffered.getvalue()
                data_uri = "data:image/png;base64," + base64.b64encode(img_bytes).decode()
                product.qr_code_data = data_uri
            except Exception as e:
                print("QR error:", e)

            product.status = "approved"
            product.admin_reason = review
            product.approved_at = timezone.now()
            product.save()

            # --- send approval email ---
            try:
                send_mail(
                    subject="Your product has been approved",
                    message=(
                        f"Dear {product.farmer.full_name},\n\n"
                        f"Your product '{product.title}' has been approved.\n\n"
                        f"PID: {pid}\n"
                        f"Blockchain tx: {product.tx_hash}\n\n"
                        f"Next steps: your product is live on the system.\n"
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[product.farmer.email],
                    fail_silently=True
                )
            except Exception as e:
                print("Email error:", e)

            return Response({
                "uid": str(product.uid),
                "status": product.status,
                "pid": product.pid,
                "qr_code_data": product.qr_code_data,
                "tx_hash": product.tx_hash,
                "admin_reason": product.admin_reason,
            }, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "action must be approve or reject"}, status=status.HTTP_400_BAD_REQUEST)

from web3 import Web3
from django.conf import settings

raw_address = settings.PRODUCT_REGISTRY_ADDRESS
if not raw_address:
    raise ValueError("PRODUCT_REGISTRY_ADDRESS is not set in settings or .env")

contract_address = Web3.to_checksum_address(raw_address)
