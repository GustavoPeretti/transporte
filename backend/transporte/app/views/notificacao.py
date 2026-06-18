from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models.notificacao import Notificacao
from ..models import PerfilMotorista, PerfilPassageiro
from ..serializers.notificacao import NotificacaoSerializer


def _role(user):
    if PerfilMotorista.objects.filter(usuario=user).exists():
        return 'motorista'
    if PerfilPassageiro.objects.filter(usuario=user).exists():
        return 'passageiro'
    return 'admin'


class NotificacaoViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    serializer_class = NotificacaoSerializer
    http_method_names = ['get', 'patch', 'post', 'head', 'options']

    def get_queryset(self):
        role = _role(self.request.user)
        return Notificacao.objects.filter(
            Q(destinatario=role) | Q(destinatario='todos')
        )

    @action(detail=False, methods=['post'], url_path='marcar-todas-lidas')
    def marcar_todas_lidas(self, request):
        role = _role(request.user)
        Notificacao.objects.filter(
            Q(destinatario=role) | Q(destinatario='todos'),
            lida=False,
        ).update(lida=True)
        return Response({'status': 'ok'})
