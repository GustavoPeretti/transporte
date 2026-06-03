from rest_framework.routers import DefaultRouter
from .views import VeiculoViewSet

router = DefaultRouter()
router.register(r'veiculos', VeiculoViewSet)

urlpatterns = router.urls
