import datetime

from ..services.planejamento import PlanejamentoService, OrganizacaoPlanejamentoStatus
from ..services.confirmacao import ConfirmacaoService, TipoViagem, RegistroEmbarqueStatus
from ..notifications.factory import NotificadorFactory, DatabaseNotificadorFactory


# ============================================================
# PATTERN: FACADE
# Ponto único de entrada para as operações de planejamento e
# embarque. Esconde da view a criação e configuração dos
# services, a injeção de observers e a ordem das chamadas.
# ============================================================
class PlanejamentoFacade:

    # A factory padrão usa DatabaseNotificador para persistir
    # notificações no banco. Injetar outra factory conforme necessário.
    def __init__(self, factory: NotificadorFactory = None):
        if factory is None:
            factory = DatabaseNotificadorFactory()

        # [PATTERN: OBSERVER] — observers criados pela factory e
        # registrados nos services (Subjects) dentro da Facade.
        self._planejamento_service = PlanejamentoService()
        self._planejamento_service.adicionar_observer(factory.criar_observer())

        self._confirmacao_service = ConfirmacaoService()
        self._confirmacao_service.adicionar_observer(factory.criar_observer())

    def organizar_planejamento(self, data: datetime.date) -> OrganizacaoPlanejamentoStatus:
        return self._planejamento_service.organizar_planejamento(data)

    def registrar_embarque(
        self,
        data: datetime.date,
        id_passageiro: int,
        tipo: TipoViagem,
    ) -> RegistroEmbarqueStatus:
        return self._confirmacao_service.registrar_embarque(data, id_passageiro, tipo)
