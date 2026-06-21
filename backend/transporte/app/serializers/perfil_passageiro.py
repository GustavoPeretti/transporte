from rest_framework import serializers
from ..models import PerfilPassageiro
from ..qr import gerar_token


class PerfilPassageiroSerializer(serializers.ModelSerializer):
    # Token assinado do QR da carteirinha — exposto apenas ao próprio dono
    # (ou admin); para os demais vem como None, evitando harvesting de QRs.
    qr_token = serializers.SerializerMethodField()

    class Meta:
        model = PerfilPassageiro
        fields = ["id", "usuario", "instituicao", "comprovante_matricula", "qr_token"]

    def get_qr_token(self, obj):
        request = self.context.get('request')
        if request is None:
            return None
        from ..permissions import is_admin
        user = request.user
        if obj.usuario_id == getattr(user, 'id', None) or is_admin(user):
            return gerar_token(obj.id)
        return None
