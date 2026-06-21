from rest_framework import viewsets
from ..models import Instituicao
from ..serializers import InstituicaoSerializer
from ..permissions import IsAdminOrReadOnly

class InstituicaoViewSet(viewsets.ModelViewSet):
    queryset = Instituicao.objects.all()
    serializer_class = InstituicaoSerializer
    permission_classes = [IsAdminOrReadOnly]
