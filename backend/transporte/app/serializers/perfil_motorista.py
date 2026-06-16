from rest_framework import serializers
from ..models import PerfilMotorista

class PerfilMotoristaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilMotorista
        fields = ["id", "usuario", "habilitacao"]
