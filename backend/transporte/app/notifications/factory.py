from abc import ABC, abstractmethod
from .observer import NotificacaoObserver


# PATTERN: ABSTRACT FACTORY
# Fábrica abstrata: define a interface para criar observers.
# Cada fábrica concreta produz um tipo específico de notificador,
# permitindo trocar o canal de notificação sem alterar o código
# que consome os observers.
class NotificadorFactory(ABC):
    @abstractmethod
    def criar_observer(self) -> NotificacaoObserver:
        pass


# PATTERN: ABSTRACT FACTORY — Fábrica concreta: e-mail.
class EmailNotificadorFactory(NotificadorFactory):
    def criar_observer(self) -> NotificacaoObserver:
        from .notificadores import EmailNotificador
        return EmailNotificador()


# PATTERN: ABSTRACT FACTORY — Fábrica concreta: log.
# Usada em testes no lugar do banco ou e-mail.
class LogNotificadorFactory(NotificadorFactory):
    def criar_observer(self) -> NotificacaoObserver:
        from .notificadores import LogNotificador
        return LogNotificador()


# PATTERN: ABSTRACT FACTORY — Fábrica concreta: banco de dados.
# Persiste cada notificação como registro, tornando-a visível
# na interface do sistema para todos os usuários.
class DatabaseNotificadorFactory(NotificadorFactory):
    def criar_observer(self) -> NotificacaoObserver:
        from .notificadores import DatabaseNotificador
        return DatabaseNotificador()
