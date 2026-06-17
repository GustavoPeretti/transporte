from rest_framework import serializers
from ..models.advertencia import Advertencia

class AdvertenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advertencia
        fields = ["id", "confirmacao", "descricao", "data", "justificativa"]