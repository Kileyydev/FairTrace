# logistics/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Delivery
from .serializers import TransporterSerializer, DeliverySerializer
import logging
# logistics/serializers.py
from logistics.models import Transporter  # instead of .models

logger = logging.getLogger(__name__)


# --- Existing: Transporter profile for logged-in user ---
class TransporterMeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        logger.debug(f"[DEBUG] User object: {user}")

        if not hasattr(user, "email"):
            logger.debug("[DEBUG] Anonymous user trying to access transporter profile")
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not getattr(user, "is_transporter", False):
            logger.debug("[DEBUG] User is not a transporter")
            return Response(
                {"detail": "User is not a transporter."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            transporter = Transporter.objects.get(user=user)
            logger.debug(f"[DEBUG] Transporter profile found: {transporter}")

            full_name = getattr(user, "full_name", None) or getattr(user, "username", None) or user.email

            data = {
                "id": transporter.id,
                "name": full_name,
                "phone": transporter.phone,
                "vehicle": transporter.vehicle,
                "license_plate": transporter.license_plate,
                "avatar": getattr(transporter, "avatar", None),
            }

            logger.debug(f"[DEBUG] Returning transporter data: {data}")
            return Response(data, status=status.HTTP_200_OK)

        except Transporter.DoesNotExist:
            logger.debug("[DEBUG] Transporter profile not found!")
            return Response(
                {"detail": "Transporter profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )


# --- Existing: Transporter deliveries ---
class TransporterDeliveriesAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        logger.debug(f"[DEBUG] User object: {user}")

        if not hasattr(user, "email"):
            logger.debug("[DEBUG] Anonymous user trying to fetch deliveries")
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not getattr(user, "is_transporter", False):
            logger.debug("[DEBUG] User is not a transporter")
            return Response(
                {"detail": "User is not a transporter."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            transporter = Transporter.objects.get(user=user)
            logger.debug(f"[DEBUG] Transporter profile found for deliveries: {transporter}")
        except Transporter.DoesNotExist:
            logger.debug("[DEBUG] Transporter profile not found for deliveries!")
            return Response(
                {"detail": "Transporter profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        deliveries = Delivery.objects.filter(transporter=transporter)
        logger.debug(f"[DEBUG] Number of deliveries found: {deliveries.count()}")

        serializer = DeliverySerializer(deliveries, many=True)
        logger.debug(f"[DEBUG] Returning deliveries data: {serializer.data}")

        return Response(serializer.data, status=status.HTTP_200_OK)


# --- NEW: List all transporters for frontend dropdown ---
# logistics/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from logistics.models import Transporter
from .serializers import TransporterSerializer
import logging

logger = logging.getLogger(__name__)

class TransporterListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # or admin-only

    def get(self, request):
        try:
            transporters = Transporter.objects.all()
            logger.debug(f"[DEBUG] Transporters queryset count: {transporters.count()}")

            # Force iterate to check each object
            for t in transporters:
                try:
                    logger.debug(f"[DEBUG] Transporter {t.id} -> user: {t.user}, "
                                 f"phone: {t.phone}, vehicle: {t.vehicle}, "
                                 f"license_plate: {t.license_plate}")
                except Exception as e_inner:
                    logger.error(f"[ERROR] Transporter {t.id} field fetch error: {e_inner}")

            serializer = TransporterSerializer(transporters, many=True)
            logger.debug(f"[DEBUG] Serialized data: {serializer.data}")

            # Force check for empty fields
            for i, d in enumerate(serializer.data):
                for key in ['name', 'email', 'phone', 'vehicle', 'license_plate']:
                    if not d.get(key):
                        logger.error(f"[ERROR] Transporter id={d['id']} missing {key}!")

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception(f"[EXCEPTION] Failed to fetch transporters: {e}")
            return Response(
                {"detail": "Error fetching transporters, check logs."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# --- NEW: Pending delivery requests for transporter ---
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from products.models import Product
from products.serializers import ProductSerializer
from logistics.models import Transporter

logger = logging.getLogger(__name__)

class PendingDeliveryRequestsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        logger.debug(f"[DEBUG] Authenticated user: {user}")

        if not getattr(user, "is_transporter", False):
            logger.warning(f"[WARNING] User {user} tried to access transporter deliveries but is not a transporter.")
            return Response({"detail": "User is not a transporter."}, status=status.HTTP_403_FORBIDDEN)

        try:
            # Get the actual Transporter instance
            transporter_instance = Transporter.objects.get(user=user)
            logger.debug(f"[DEBUG] Transporter instance: {transporter_instance} (ID: {transporter_instance.id})")
        except Transporter.DoesNotExist:
            logger.error(f"[ERROR] Transporter profile not found for user: {user}")
            return Response({"detail": "Transporter profile not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Use the actual instance in the filter
            pending_deliveries = Product.objects.filter(
                transporter=transporter_instance,
                status="approved"
            )
            logger.debug(f"[DEBUG] Pending deliveries count: {pending_deliveries.count()}")
            for pd in pending_deliveries:
                logger.debug(f"[DEBUG] Pending delivery: {pd.title} (ID: {pd.uid})")
        except Exception as e:
            logger.exception(f"[EXCEPTION] Error fetching pending deliveries: {e}")
            return Response({"detail": "Error fetching pending deliveries."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        serializer = ProductSerializer(pending_deliveries, many=True)
        logger.debug(f"[DEBUG] Serialized pending deliveries data: {serializer.data}")
        return Response(serializer.data, status=status.HTTP_200_OK)


# logistics/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from products.models import Product
from logistics.models import Transporter
import logging

logger = logging.getLogger(__name__)

# Mock blockchain logging function
def log_to_blockchain(product_id, action, transporter_id):
    # This is where you'd call your blockchain API / smart contract
    logger.info(f"[BLOCKCHAIN] Action: {action}, Product: {product_id}, Transporter: {transporter_id}")
    # You can also save tx_hash if returned by your blockchain system
    return "mock_tx_hash_12345"

class AcceptDeliveryRequestAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_uid):
        user = request.user
        if not getattr(user, "is_transporter", False):
            return Response({"detail": "User is not a transporter."}, status=status.HTTP_403_FORBIDDEN)

        try:
            transporter = Transporter.objects.get(user=user)
        except Transporter.DoesNotExist:
            return Response({"detail": "Transporter profile not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            product = Product.objects.get(uid=product_uid, status="approved")
        except Product.DoesNotExist:
            return Response({"detail": "Product not found or already accepted."}, status=status.HTTP_404_NOT_FOUND)

        # Assign transporter and mark as in_transit
        product.transporter = transporter
        product.status = "in_transit"
        tx_hash = log_to_blockchain(product.uid, "accepted_delivery", transporter.id)
        product.tx_hash = tx_hash
        product.save()

        return Response({"detail": "Delivery request accepted.", "tx_hash": tx_hash}, status=status.HTTP_200_OK)


class CompleteDeliveryAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_uid):
        user = request.user
        if not getattr(user, "is_transporter", False):
            return Response({"detail": "User is not a transporter."}, status=status.HTTP_403_FORBIDDEN)

        try:
            transporter = Transporter.objects.get(user=user)
        except Transporter.DoesNotExist:
            return Response({"detail": "Transporter profile not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            product = Product.objects.get(uid=product_uid, transporter=transporter, status="in_transit")
        except Product.DoesNotExist:
            return Response({"detail": "Product not found or not assigned to you."}, status=status.HTTP_404_NOT_FOUND)

        product.status = "delivered"
        tx_hash = log_to_blockchain(product.uid, "completed_delivery", transporter.id)
        product.tx_hash = tx_hash
        product.save()

        return Response({"detail": "Delivery completed and logged.", "tx_hash": tx_hash}, status=status.HTTP_200_OK)

# logistics/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from products.models import Product
from .models import Transporter

class AcceptedDeliveryRequestsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        transporter = Transporter.objects.get(user=request.user)
        products = Product.objects.filter(transporter=transporter, status="approved")
        data = [
            {
                "uid": p.uid,
                "title": p.title,
                "pickup": p.origin_address if hasattr(p, "origin_address") else "—",
                "dropoff": getattr(p, "dropoff", "—"),
                "quantity": str(p.quantity),
                "transporter_note": p.transporter_note,
                "eta": getattr(p, "eta", "—"),
                "weight": str(p.quantity),
                "status": "accepted",
            }
            for p in products
        ]
        return Response(data)


class DeliveredDeliveryRequestsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        transporter = Transporter.objects.get(user=request.user)
        products = Product.objects.filter(transporter=transporter, status="delivered")
        data = [
            {
                "uid": p.uid,
                "title": p.title,
                "pickup": p.origin_address if hasattr(p, "origin_address") else "—",
                "dropoff": getattr(p, "dropoff", "—"),
                "quantity": str(p.quantity),
                "transporter_note": p.transporter_note,
                "eta": getattr(p, "eta", "—"),
                "weight": str(p.quantity),
                "status": "delivered",
            }
            for p in products
        ]
        return Response(data)

# logistics/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from products.models import Product
from logistics.models import Transporter
#from .serializers import ProductSerializer
import logging

logger = logging.getLogger(__name__)

class MyProductsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        logger.debug(f"[DEBUG] Authenticated user: {user} (ID: {user.id})")

        if not getattr(user, "is_transporter", False):
            logger.warning("[WARNING] Non-transporter tried accessing transporter products.")
            return Response(
                {"detail": "User is not a transporter."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            transporter = Transporter.objects.get(user=user)
            logger.debug(f"[DEBUG] Transporter found: {transporter} (ID: {transporter.id})")
        except Transporter.DoesNotExist:
            logger.error("[ERROR] Transporter profile missing for logged user!")
            return Response(
                {"detail": "Transporter profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        products = Product.objects.filter(transporter=transporter)
        logger.debug(f"[DEBUG] Total products assigned to transporter: {products.count()}")

        # Deep dive product logs
        for p in products:
            logger.debug(
                f"[PRODUCT] UID={p.uid}, Title={p.title}, Status={p.status}, "
                f"Quantity={p.quantity}, TransporterNote={p.transporter_note}"
            )

        serializer = ProductSerializer(products, many=True)
        logger.debug(f"[DEBUG] Serialized product data: {serializer.data}")

        return Response(serializer.data, status=status.HTTP_200_OK)

# logistics/views.py
class RejectDeliveryRequestAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_uid):
        user = request.user
        if not getattr(user, "is_transporter", False):
            return Response({"detail": "User is not a transporter."}, status=status.HTTP_403_FORBIDDEN)

        try:
            transporter = Transporter.objects.get(user=user)
        except Transporter.DoesNotExist:
            return Response({"detail": "Transporter profile not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            product = Product.objects.get(uid=product_uid, status="approved")
        except Product.DoesNotExist:
            return Response({"detail": "Product not found or already handled."}, status=status.HTTP_404_NOT_FOUND)

        product.status = "rejected"
        tx_hash = log_to_blockchain(product.uid, "rejected_delivery", transporter.id)
        product.tx_hash = tx_hash
        product.save()

        return Response({"detail": "Delivery request rejected.", "tx_hash": tx_hash}, status=status.HTTP_200_OK)
