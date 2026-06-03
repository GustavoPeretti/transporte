from rest_framework import viewsets
from ..models import Instituicao
from ..serializers import InstituicaoSerializer

class InstituicaoViewSet(viewsets.ModelViewSet):
    queryset = Instituicao.objects.all()
    serializer_class = InstituicaoSerializer
