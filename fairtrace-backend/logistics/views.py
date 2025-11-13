# logistics/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Transporter, Delivery
import logging

logger = logging.getLogger(__name__)

class TransporterMeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # ✅ require login

    def get(self, request):
        user = request.user
        print(f"[PRINT] User object: {user}")
        logger.debug(f"[DEBUG] User object: {user}")

        # ✅ Prevent errors for anonymous users
        if not hasattr(user, "email"):
            print("[PRINT] Anonymous user trying to access transporter profile")
            logger.debug("[DEBUG] Anonymous user trying to access transporter profile")
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        print(f"[PRINT] User email: {user.email}")
        logger.debug(f"[DEBUG] User email: {user.email}")

        # ✅ Check if the user is a transporter
        if not getattr(user, "is_transporter", False):
            print("[PRINT] User is not marked as a transporter")
            logger.debug("[DEBUG] User is not marked as a transporter")
            return Response(
                {"detail": "User is not a transporter."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            transporter = Transporter.objects.get(user=user)
            print(f"[PRINT] Found transporter profile: {transporter}")
            logger.debug(f"[DEBUG] Transporter profile found: {transporter}")

            # ✅ Use fields that actually exist on your User model
            full_name = getattr(user, "full_name", None) or getattr(user, "username", None) or user.email

            data = {
                "id": transporter.id,
                "name": full_name,
                "phone": transporter.phone,
                "vehicle": transporter.vehicle,
                "license_plate": transporter.license_plate,
                "avatar": transporter.avatar,
            }

            print(f"[PRINT] Returning transporter data: {data}")
            logger.debug(f"[DEBUG] Returning transporter data: {data}")

            return Response(data, status=status.HTTP_200_OK)

        except Transporter.DoesNotExist:
            print("[PRINT] Transporter profile not found!")
            logger.debug("[DEBUG] Transporter profile not found!")
            return Response(
                {"detail": "Transporter profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )


class TransporterDeliveriesAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # ✅ require login

    def get(self, request):
        user = request.user
        print(f"[PRINT] User object: {user}")
        logger.debug(f"[DEBUG] User object: {user}")

        # ✅ Prevent errors for anonymous users
        if not hasattr(user, "email"):
            print("[PRINT] Anonymous user trying to fetch deliveries")
            logger.debug("[DEBUG] Anonymous user trying to fetch deliveries")
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        print(f"[PRINT] User email: {user.email}")
        logger.debug(f"[DEBUG] User email: {user.email}")

        # ✅ Check if the user is a transporter
        if not getattr(user, "is_transporter", False):
            print("[PRINT] User is not a transporter")
            logger.debug("[DEBUG] User is not a transporter")
            return Response(
                {"detail": "User is not a transporter."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            transporter = Transporter.objects.get(user=user)
            print(f"[PRINT] Transporter profile found for deliveries: {transporter}")
            logger.debug(f"[DEBUG] Transporter profile found for deliveries: {transporter}")

        except Transporter.DoesNotExist:
            print("[PRINT] Transporter profile not found for deliveries!")
            logger.debug("[DEBUG] Transporter profile not found for deliveries!")
            return Response(
                {"detail": "Transporter profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        deliveries = Delivery.objects.filter(transporter=transporter)
        print(f"[PRINT] Number of deliveries found: {deliveries.count()}")
        logger.debug(f"[DEBUG] Number of deliveries found: {deliveries.count()}")

        data = [
            {
                "id": d.id,
                "pickup": d.pickup,
                "dropoff": d.dropoff,
                "status": d.status,
                "eta": d.eta,
                "weight": d.weight,
                "qr_code": d.qr_code,
            }
            for d in deliveries
        ]

        print(f"[PRINT] Returning deliveries data: {data}")
        logger.debug(f"[DEBUG] Returning deliveries data: {data}")

        return Response(data, status=status.HTTP_200_OK)
