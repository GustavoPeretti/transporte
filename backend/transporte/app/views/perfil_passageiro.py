from rest_framework import viewsets
from ..models import PerfilPassageiro
from ..serializers import PerfilPassageiroSerializer
from ..permissions import IsAdminOrReadOnly

class PerfilPassageiroViewSet(viewsets.ModelViewSet):
    queryset = PerfilPassageiro.objects.all()  # usado pelo router (basename)
    serializer_class = PerfilPassageiroSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        # Passageiro enxerga apenas o próprio perfil (comprovante/qr_token são
        # sensíveis); motorista e admin precisam da lista para as alocações.
        perfil = PerfilPassageiro.objects.filter(usuario=user).first()
        if perfil:
            return PerfilPassageiro.objects.filter(pk=perfil.pk)
        return PerfilPassageiro.objects.all()
