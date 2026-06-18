from rest_framework import serializers
from ..models.confirmacao import Confirmacao

class ConfirmacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Confirmacao
        fields = ['id', 'passageiro', 'planejamento', 'ida', 'retorno', 'presenca_ida', 'presenca_retorno', 'ultima_atualizacao']
        # unique_together é gerenciado pelo get-or-create na view; removido
        # aqui para permitir que o segundo POST atualize o registro existente.
        validators = []
