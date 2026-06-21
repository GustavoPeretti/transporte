from rest_framework import viewsets
from ..models import AlocacaoInstituicao
from ..serializers import AlocacaoInstituicaoSerializer
from ..permissions import IsAdminOrReadOnly

class AlocacaoInstituicaoViewSet(viewsets.ModelViewSet):
    queryset = AlocacaoInstituicao.objects.all()
    serializer_class = AlocacaoInstituicaoSerializer
    permission_classes = [IsAdminOrReadOnly]
