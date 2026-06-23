from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, response, status, views
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny

from ..models import PerfilMotorista, PerfilPassageiro
from ..serializers.usuario import UsuarioSerializer


def dados_sessao(usuario, request=None):
    #Monta o payload de sessão (usuário + papel + ids de perfil).
    contexto = {'request': request} if request is not None else {}
    motorista = PerfilMotorista.objects.filter(usuario=usuario).first()
    passageiro = PerfilPassageiro.objects.filter(usuario=usuario).first()

    if motorista:
        role = 'motorista'
    elif passageiro:
        role = 'passageiro'
    else:
        role = 'admin'

    return {
        'usuario': UsuarioSerializer(usuario, context=contexto).data,
        'role': role,
        'perfilMotoristaId': motorista.id if motorista else None,
        'perfilPassageiroId': passageiro.id if passageiro else None,
    }


class CsrfTokenView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return response.Response({'csrfToken': get_token(request)})


class SessionLoginView(views.APIView):
    #Login por sessão: cria um cookie de sessão httpOnly (resistente a XSS).

    #Sem sessão ativa, o SessionAuthentication do DRF não exige CSRF nesta
    #chamada; após o login, os métodos mutantes passam a exigir CSRF.
    
    authentication_classes = [SessionAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        username = (request.data.get('username') or '').strip()
        password = request.data.get('password') or ''

        usuario = authenticate(request, username=username, password=password)
        if usuario is None:
            return response.Response(
                {'detail': 'Usuário ou senha incorretos.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        login(request, usuario)  # grava a sessão e emite o cookie httpOnly
        return response.Response(dados_sessao(usuario, request))


class SessionLogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return response.Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator(csrf_exempt, name='dispatch')
class ObtainAuthTokenView(ObtainAuthToken):
    """Mantido para clientes não-browser (header `Token`)."""
    authentication_classes = []
    permission_classes = [AllowAny]


class CurrentUserView(views.APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return response.Response(dados_sessao(request.user, request))
