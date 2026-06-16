from rest_framework import serializers
from ..models import Instituicao

class InstituicaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instituicao
        fields = ["id", "nome", "horario_inicio", "horario_fim"]