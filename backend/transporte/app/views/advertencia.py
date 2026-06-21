from rest_framework import viewsets, permissions
from ..models import Advertencia, PerfilPassageiro
from ..serializers import AdvertenciaSerializer
from ..permissions import IsAdmin, is_admin


class AdvertenciaViewSet(viewsets.ModelViewSet):
    serializer_class = AdvertenciaSerializer

    def get_queryset(self):
        user = self.request.user

        # Passageiro só enxerga as próprias advertências (via confirmação).
        perfil = PerfilPassageiro.objects.filter(usuario=user).first()
        if perfil:
            return Advertencia.objects.filter(confirmacao__passageiro=perfil)

        if is_admin(user):
            return Advertencia.objects.all()

        # Motorista não tem acesso a advertências.
        return Advertencia.objects.none()

    def get_permissions(self):
        # Passageiro pode listar/ver e justificar (PATCH) as próprias — o
        # queryset já restringe ao dono. Criar/substituir/remover é só admin.
        if self.action in ('list', 'retrieve', 'partial_update'):
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]
