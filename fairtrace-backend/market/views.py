from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Listing, Sale
from .serializers import ListingSerializer, SaleSerializer
from .permissions import IsSaccoAdmin
from django.shortcuts import get_object_or_404

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all().order_by('-created_at')
    serializer_class = ListingSerializer

    def perform_create(self, serializer):
        serializer.save(sacco=self.request.user)

    def get_permissions(self):
        if self.action in ['create','update','partial_update','destroy','my_listings']:
            return [IsSaccoAdmin()]
        return [permissions.AllowAny()]

    @action(detail=False, methods=['get'], permission_classes=[IsSaccoAdmin])
    def my_listings(self, request):
        qs = Listing.objects.filter(sacco=request.user)
        return Response(self.get_serializer(qs, many=True).data)


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().order_by('-created_at')
    serializer_class = SaleSerializer

    def perform_create(self, serializer):
        serializer.save()

    def get_permissions(self):
        if self.action in ['approve_sale','record_payment_onchain','partial_update','destroy']:
            return [IsSaccoAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'], permission_classes=[IsSaccoAdmin])
    def approve_sale(self, request, pk=None):
        sale = self.get_object()
        sale.approved = True
        sale.save()
        return Response(SaleSerializer(sale).data)

    @action(detail=True, methods=['post'], permission_classes=[IsSaccoAdmin])
    def record_payment_onchain(self, request, pk=None):
        """
        Called by admin after marking sale as paid. This endpoint will trigger
        backend to write onchain (optional) and store tx hash.
        """
        sale = self.get_object()
        tx_hash = request.data.get('tx_hash')  # if UI performed tx via MetaMask, pass hash
        if tx_hash:
            sale.onchain_tx = tx_hash
            sale.paid = True
            sale.save()
            return Response(SaleSerializer(sale).data)
        # Optionally the backend can itself create the tx (web3.py)
        # implement backend signing flow below if desired
        return Response({'detail': 'tx_hash missing'}, status=status.HTTP_400_BAD_REQUEST)
