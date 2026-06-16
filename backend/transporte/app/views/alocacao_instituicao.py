from rest_framework import viewsets
from ..models import AlocacaoInstituicao
from ..serializers import AlocacaoInstituicaoSerializer

class AlocacaoInstituicaoViewSet(viewsets.ModelViewSet):
    queryset = AlocacaoInstituicao.objects.all()
    serializer_class = AlocacaoInstituicaoSerializer
