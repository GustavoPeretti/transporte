from rest_framework import serializers
from ..models import PerfilPassageiro

class PerfilPassageiroSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilPassageiro
        fields = ["id", "usuario", "instituicao", "comprovante_matricula"]