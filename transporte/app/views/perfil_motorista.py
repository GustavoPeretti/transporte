from rest_framework import viewsets
from ..models import PerfilMotorista
from ..serializers import PerfilMotoristaSerializer

class PerfilMotoristaViewSet(viewsets.ModelViewSet):
    queryset = PerfilMotorista.objects.all()
    serializer_class = PerfilMotoristaSerializer
