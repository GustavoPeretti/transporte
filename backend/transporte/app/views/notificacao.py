from django.db.models import Q
from rest_framework import viewsets, permissions
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models.notificacao import Notificacao
from ..serializers.notificacao import NotificacaoSerializer
from ..permissions import IsAdmin, get_role


class NotificacaoViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    serializer_class = NotificacaoSerializer
    http_method_names = ['get', 'patch', 'post', 'head', 'options']

    def get_permissions(self):
        # Apenas admin emite notificações; demais papéis só leem/marcam as suas.
        if self.action == 'create':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        role = get_role(self.request.user)
        return Notificacao.objects.filter(
            Q(destinatario=role) | Q(destinatario='todos')
        )

    @action(detail=False, methods=['post'], url_path='marcar-todas-lidas')
    def marcar_todas_lidas(self, request):
        role = get_role(request.user)
        Notificacao.objects.filter(
            Q(destinatario=role) | Q(destinatario='todos'),
            lida=False,
        ).update(lida=True)
        return Response({'status': 'ok'})
