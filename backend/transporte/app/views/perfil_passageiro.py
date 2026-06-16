from rest_framework import viewsets
from ..models import PerfilPassageiro
from ..serializers import PerfilPassageiroSerializer

class PerfilPassageiroViewSet(viewsets.ModelViewSet):
    queryset = PerfilPassageiro.objects.all()
    serializer_class = PerfilPassageiroSerializer
