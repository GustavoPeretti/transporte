from abc import ABC, abstractmethod


# ============================================================
# PATTERN: OBSERVER
# Observer (interface): define o contrato que todo notificador deve seguir.
# ============================================================
class NotificacaoObserver(ABC):
    @abstractmethod
    def atualizar(self, evento: str, dados: dict) -> None:
        pass


# ============================================================
# PATTERN: OBSERVER
# Subject (mixin): mantém a lista de observers e os notifica
# quando um evento relevante ocorre. Classes que herdam este
# mixin tornam-se fontes de eventos observáveis.
# ============================================================
class NotificacaoSubject:
    def __init__(self):
        self._observers: list[NotificacaoObserver] = []

    def adicionar_observer(self, observer: NotificacaoObserver) -> None:
        self._observers.append(observer)

    def remover_observer(self, observer: NotificacaoObserver) -> None:
        self._observers.remove(observer)

    def notificar(self, evento: str, dados: dict) -> None:
        for observer in self._observers:
            observer.atualizar(evento, dados)
