from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, response, views
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny

from ..models import PerfilMotorista, PerfilPassageiro
from ..serializers.usuario import UsuarioSerializer


class CsrfTokenView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return response.Response({'csrfToken': get_token(request)})


@method_decorator(csrf_exempt, name='dispatch')
class ObtainAuthTokenView(ObtainAuthToken):
    authentication_classes = []
    permission_classes = [AllowAny]


class CurrentUserView(views.APIView):
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        usuario = request.user
        usuario_data = UsuarioSerializer(usuario).data

        motorista = PerfilMotorista.objects.filter(usuario=usuario).first()
        passageiro = PerfilPassageiro.objects.filter(usuario=usuario).first()

        if motorista:
            role = 'motorista'
        elif passageiro:
            role = 'passageiro'
        else:
            role = 'admin'

        return response.Response({
            'usuario': usuario_data,
            'role': role,
            'perfilMotoristaId': motorista.id if motorista else None,
            'perfilPassageiroId': passageiro.id if passageiro else None,
        })
