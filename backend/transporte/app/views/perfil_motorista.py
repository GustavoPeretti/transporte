from rest_framework import viewsets
from ..models import PerfilMotorista
from ..serializers import PerfilMotoristaSerializer
from ..permissions import IsAdminOrReadOnly, is_admin

class PerfilMotoristaViewSet(viewsets.ModelViewSet):
    queryset = PerfilMotorista.objects.all()  # usado pelo router (basename)
    serializer_class = PerfilMotoristaSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        # Admin gerencia todos (alocação); motorista vê só o próprio;
        # passageiro não tem acesso à lista de motoristas.
        if is_admin(user):
            return PerfilMotorista.objects.all()
        return PerfilMotorista.objects.filter(usuario=user)
