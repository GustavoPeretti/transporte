from rest_framework import viewsets
from ..models import Planejamento
from ..serializers import PlanejamentoSerializer

class PlanejamentoViewSet(viewsets.ModelViewSet):
    queryset = Planejamento.objects.all()
    serializer_class = PlanejamentoSerializer
