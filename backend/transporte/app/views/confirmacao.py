# backend/transporte/app/views/confirmacao.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Confirmacao
from ..serializers import ConfirmacaoSerializer
from ..services.confirmacao import ConfirmacaoService, TipoViagem, RegistroEmbarqueStatus
import datetime


class ConfirmacaoViewSet(viewsets.ModelViewSet):
    queryset = Confirmacao.objects.all()
    serializer_class = ConfirmacaoSerializer

    @action(detail=False, methods=['post'], url_path='registrar-embarque')
    def registrar_embarque(self, request):
        data_str = request.data.get('data')
        id_passageiro = request.data.get('id_passageiro')
        tipo_str = request.data.get('tipo')

        if not all([data_str, id_passageiro, tipo_str]):
            return Response(
                {'erro': 'Campos obrigatórios: data, id_passageiro, tipo'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            data = datetime.date.fromisoformat(data_str)
        except ValueError:
            return Response(
                {'erro': 'Data inválida. Use o formato YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            tipo = TipoViagem(tipo_str)
        except ValueError:
            return Response(
                {'erro': f'Tipo inválido. Use: {[t.value for t in TipoViagem]}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        resultado = ConfirmacaoService.registrar_embarque(data, id_passageiro, tipo)

        mapa_status = {
            RegistroEmbarqueStatus.OK: status.HTTP_200_OK,
            RegistroEmbarqueStatus.PLANEJAMENTO_NAO_EXISTE: status.HTTP_404_NOT_FOUND,
            RegistroEmbarqueStatus.PLANEJAMENTO_FECHADO: status.HTTP_409_CONFLICT,
            RegistroEmbarqueStatus.CONFIRMACAO_NAO_ENCONTRADA: status.HTTP_404_NOT_FOUND,
            RegistroEmbarqueStatus.VIAGEM_NAO_CONFIRMADA: status.HTTP_409_CONFLICT,
            RegistroEmbarqueStatus.JA_EMBARCADO: status.HTTP_409_CONFLICT,
        }

        return Response(
            {'status': resultado.name},
            status=mapa_status[resultado],
        )