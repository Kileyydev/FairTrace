# logistics/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Delivery
from .serializers import TransporterSerializer, DeliverySerializer
import logging
# logistics/serializers.py
from users.models import Transporter  # instead of .models

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
from users.models import Transporter
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
