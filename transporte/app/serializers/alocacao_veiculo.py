from rest_framework import serializers
from ..models import AlocacaoVeiculo

class AlocacaoVeiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlocacaoVeiculo
        fields = ["id", "planejamento", "motorista_id", "veiculo_id"]