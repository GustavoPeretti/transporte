from rest_framework import serializers
from ..models.notificacao import Notificacao


class NotificacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacao
        fields = ['id', 'titulo', 'mensagem', 'destinatario', 'criado_em', 'lida']
        read_only_fields = ['id', 'titulo', 'mensagem', 'destinatario', 'criado_em']
