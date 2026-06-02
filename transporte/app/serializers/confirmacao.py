from rest_framework import serializers
from ..models.confirmacao import Confirmacao

class AdvertenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Confirmacao
        fields = ['id', 'passageiro', 'data', 'ida', 'retorno', 'presenca_ida', 'presenca_retorno', 'ultima_atualizacao']
