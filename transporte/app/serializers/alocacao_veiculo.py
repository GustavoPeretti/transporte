from rest_framework import serializers
from ..models import AlocacaoVeiculo

class AlocacaoVeiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlocacaoVeiculo
        fields = ["id", "planejamento", "motorista", "veiculo", "embarque"]
