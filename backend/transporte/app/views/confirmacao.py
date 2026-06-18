from rest_framework import viewsets, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
import datetime

from ..models import Confirmacao, PerfilPassageiro
from ..serializers import ConfirmacaoSerializer
from ..facades.planejamento import PlanejamentoFacade  # [PATTERN: FACADE]
from ..services.confirmacao import TipoViagem, RegistroEmbarqueStatus


class ConfirmacaoViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    serializer_class = ConfirmacaoSerializer

    def get_queryset(self):
        user = self.request.user

        # Passageiros só podem ver suas próprias confirmações.
        perfil_passageiro = PerfilPassageiro.objects.filter(usuario=user).first()
        if perfil_passageiro:
            return Confirmacao.objects.filter(passageiro=perfil_passageiro)

        # Admin e motoristas podem filtrar por passageiro via query param.
        queryset = Confirmacao.objects.all()
        passageiro = self.request.query_params.get('passageiro')
        if passageiro:
            queryset = queryset.filter(passageiro=passageiro)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        passageiro = serializer.validated_data['passageiro']
        planejamento = serializer.validated_data['planejamento']

        try:
            instance = Confirmacao.objects.get(passageiro=passageiro, planejamento=planejamento)
            instance.ida = serializer.validated_data['ida']
            instance.retorno = serializer.validated_data['retorno']
            instance.save(update_fields=['ida', 'retorno'])
            created = False
        except Confirmacao.DoesNotExist:
            instance = Confirmacao.objects.create(
                passageiro=passageiro,
                planejamento=planejamento,
                ida=serializer.validated_data['ida'],
                retorno=serializer.validated_data['retorno'],
            )
            created = True

        return Response(
            self.get_serializer(instance).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

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

        # [PATTERN: FACADE]
        resultado = PlanejamentoFacade().registrar_embarque(data, id_passageiro, tipo)

        mapa_status = {
            RegistroEmbarqueStatus.OK:                         status.HTTP_200_OK,
            RegistroEmbarqueStatus.PLANEJAMENTO_NAO_EXISTE:    status.HTTP_404_NOT_FOUND,
            RegistroEmbarqueStatus.CONFIRMACAO_NAO_ENCONTRADA: status.HTTP_404_NOT_FOUND,
            RegistroEmbarqueStatus.VIAGEM_NAO_CONFIRMADA:      status.HTTP_409_CONFLICT,
            RegistroEmbarqueStatus.JA_EMBARCADO:               status.HTTP_409_CONFLICT,
        }

        return Response(
            {'status': resultado.name},
            status=mapa_status[resultado],
        )
