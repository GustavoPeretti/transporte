from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Planejamento
from ..serializers import PlanejamentoSerializer
from ..services.planejamento import (
    PlanejamentoService
)

class PlanejamentoViewSet(viewsets.ModelViewSet):
    queryset = Planejamento.objects.all()
    serializer_class = PlanejamentoSerializer

    @action(detail=True, methods=["post"])
    def organizar(self, request, pk=None):
        planejamento = self.get_object()

        resultado = PlanejamentoService.organizar_planejamento(
            planejamento.data
        )

        return Response({
            "status": resultado.name
        })
    