from rest_framework import viewsets
from ..models import AlocacaoVeiculo
from ..serializers import AlocacaoVeiculoSerializer
from ..permissions import IsAdminOrReadOnly

class AlocacaoVeiculoViewSet(viewsets.ModelViewSet):
    queryset = AlocacaoVeiculo.objects.all()
    serializer_class = AlocacaoVeiculoSerializer
    permission_classes = [IsAdminOrReadOnly]
