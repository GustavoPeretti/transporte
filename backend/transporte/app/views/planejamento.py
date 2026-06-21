from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Planejamento
from ..models.notificacao import Notificacao
from ..serializers import PlanejamentoSerializer
from ..facades.planejamento import PlanejamentoFacade  # [PATTERN: FACADE]
from ..permissions import IsAdminOrReadOnly


class PlanejamentoViewSet(viewsets.ModelViewSet):
    queryset = Planejamento.objects.all()
    serializer_class = PlanejamentoSerializer
    permission_classes = [IsAdminOrReadOnly]

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        era_aberto = instance.aberto

        response = super().partial_update(request, *args, **kwargs)

        # Emite notificação para passageiros quando o planejamento é fechado.
        instance.refresh_from_db()
        if era_aberto and not instance.aberto:
            Notificacao.objects.create(
                titulo='Planejamento fechado',
                mensagem=f'O planejamento de {instance.data} foi encerrado. Confirmações não são mais aceitas.',
                destinatario='passageiro',
            )

        return response

    @action(detail=True, methods=['post'])
    def organizar(self, request, pk=None):
        planejamento = self.get_object()

        # [PATTERN: FACADE] — a view delega para a Facade sem conhecer
        # os services, a factory de notificações ou os observers internos.
        resultado = PlanejamentoFacade().organizar_planejamento(planejamento.data)

        return Response({'status': resultado.name})
