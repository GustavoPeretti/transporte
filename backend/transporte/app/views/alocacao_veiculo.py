from rest_framework import viewsets
from ..models import AlocacaoVeiculo
from ..serializers import AlocacaoVeiculoSerializer

class AlocacaoVeiculoViewSet(viewsets.ModelViewSet):
    queryset = AlocacaoVeiculo.objects.all()
    serializer_class = AlocacaoVeiculoSerializer
