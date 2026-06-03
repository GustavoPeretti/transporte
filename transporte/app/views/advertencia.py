from rest_framework import viewsets
from ..models import Advertencia
from ..serializers import AdvertenciaSerializer

class AdvertenciaViewSet(viewsets.ModelViewSet):
    queryset = Advertencia.objects.all()
    serializer_class = AdvertenciaSerializer
