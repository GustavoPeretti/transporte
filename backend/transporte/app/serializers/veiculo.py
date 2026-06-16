from rest_framework import serializers
from ..models import Veiculo

class VeiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Veiculo
        fields = ["id", "placa", "capacidade", "modelo", "tipo"]

