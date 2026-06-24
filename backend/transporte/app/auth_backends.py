from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend


class CaseInsensitiveModelBackend(ModelBackend):
    """Autentica por username sem diferenciar maiúsculas/minúsculas.

    Muitos teclados de celular capitalizam a primeira letra automaticamente,
    então `Bruna.silva` deve ser aceito da mesma forma que `bruna.silva`.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
        if username is None or password is None:
            return None
        try:
            user = UserModel._default_manager.get(
                **{f'{UserModel.USERNAME_FIELD}__iexact': username}
            )
        except UserModel.DoesNotExist:
            # Roda o hasher mesmo sem usuário para manter tempo constante
            # e dificultar a enumeração de contas.
            UserModel().set_password(password)
            return None
        except UserModel.MultipleObjectsReturned:
            # Defensivo: usernames que só diferem por caixa não devem logar.
            return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
