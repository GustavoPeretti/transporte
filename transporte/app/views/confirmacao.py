from rest_framework import viewsets
from ..models import Confirmacao
from ..serializers import ConfirmacaoSerializer

class ConfirmacaoViewSet(viewsets.ModelViewSet):
    queryset = Confirmacao.objects.all()
    serializer_class = ConfirmacaoSerializer
