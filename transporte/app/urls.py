from rest_framework.routers import DefaultRouter
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

urlpatterns = router.urls
