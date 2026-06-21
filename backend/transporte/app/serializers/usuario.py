from rest_framework import serializers
from ..models.usuario import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'cpf']

    def to_representation(self, instance):
        data = super().to_representation(instance)

        request = self.context.get('request')
        if request is None:
            # Sem contexto de requisição (ex.: resposta de criação pelo admin
            # ou /auth/me/ do próprio usuário): mantém os campos completos.
            return data

        # Import tardio evita ciclo (permissions importa models).
        from ..permissions import is_admin

        user = request.user
        if is_admin(user) or instance.pk == getattr(user, 'pk', None):
            return data

        # Oculta dados pessoais de terceiros para não-admins (LGPD).
        data.pop('cpf', None)
        data.pop('email', None)
        return data
