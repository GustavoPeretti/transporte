from django.urls import path
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    VeiculoViewSet,
    PlanejamentoViewSet,
    UsuarioViewSet,
    InstituicaoViewSet,
    PerfilPassageiroViewSet,
    PerfilMotoristaViewSet,
    ConfirmacaoViewSet,
    AdvertenciaViewSet,
    AlocacaoVeiculoViewSet,
    AlocacaoInstituicaoViewSet,
)
from .views.auth import CurrentUserView, CsrfTokenView, ObtainAuthTokenView

router = DefaultRouter()
router.register(r'veiculos', VeiculoViewSet)
router.register(r'planejamentos', PlanejamentoViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'instituicoes', InstituicaoViewSet)
router.register(r'perfis-passageiro', PerfilPassageiroViewSet)
router.register(r'perfis-motorista', PerfilMotoristaViewSet)
router.register(r'confirmacoes', ConfirmacaoViewSet)
router.register(r'advertencias', AdvertenciaViewSet)
router.register(r'alocacoes-veiculo', AlocacaoVeiculoViewSet)
router.register(r'alocacoes-instituicao', AlocacaoInstituicaoViewSet)

urlpatterns = router.urls + [
    path('auth/token/', ObtainAuthTokenView.as_view()),
    path('auth/csrf/', CsrfTokenView.as_view()),
    path('auth/me/', CurrentUserView.as_view()),
]
