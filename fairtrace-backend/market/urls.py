from rest_framework import routers
from .views import ListingViewSet, SaleViewSet
router = routers.DefaultRouter()
router.register('listings', ListingViewSet)
router.register('sales', SaleViewSet)

urlpatterns = router.urls
