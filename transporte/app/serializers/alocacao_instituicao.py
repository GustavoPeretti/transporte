from rest_framework import serializers
from ..models import AlocacaoInstituicao

class AlocacaoInstituicaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlocacaoInstituicao
        fields = ["id", "alocacao_veiculo", "instituicao"]