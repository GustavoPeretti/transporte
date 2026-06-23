import logging
from .observer import NotificacaoObserver

logger = logging.getLogger(__name__)

# Mapeamento de evento → LISTA de notificações (título, mensagem, destinatário).
# Um mesmo evento pode gerar notificações distintas para papéis diferentes.
#
# Apenas eventos REALMENTE relevantes geram notificação persistida. O evento
# O evento continua sendo emitido pelo service (padrão Observer), mas o
# DatabaseNotificador o ignora — outros canais (log/e-mail) poderiam tratá-lo.
_EVENTOS = {
    'PLANEJAMENTO_ORGANIZADO': [
        # Admin: confirmação de que a organização automática rodou.
        ('Planejamento organizado',
         lambda d: f"O planejamento de {d['data']} foi organizado automaticamente.",
         'admin'),
        # Passageiro: aviso útil de que o transporte do dia já está definido.
        ('Transporte organizado',
         lambda d: f"O transporte do dia {d['data']} foi organizado. Confira o seu embarque.",
         'passageiro'),
    ],
    'PLANEJAMENTO_FECHADO': [
        ('Planejamento fechado',
         lambda d: f"O planejamento de {d['data']} foi encerrado. Confirmações não são mais aceitas.",
         'passageiro'),
    ],
}


# PATTERN: OBSERVER — Observer concreto: e-mail.
class EmailNotificador(NotificacaoObserver):
    def atualizar(self, evento: str, dados: dict) -> None:
        logger.info(f'[EMAIL] Evento={evento} | Dados={dados}')


# PATTERN: OBSERVER — Observer concreto: log.
class LogNotificador(NotificacaoObserver):
    def atualizar(self, evento: str, dados: dict) -> None:
        logger.info(f'[LOG] Evento={evento} | Dados={dados}')


# PATTERN: OBSERVER — Observer concreto: banco de dados.
# Persiste a notificação com o destinatário correto para que
# o frontend filtre por papel do usuário autenticado.
class DatabaseNotificador(NotificacaoObserver):
    def atualizar(self, evento: str, dados: dict) -> None:
        if evento not in _EVENTOS:
            return
        from ..models.notificacao import Notificacao
        # Um evento pode gerar uma notificação para cada papel interessado.
        for titulo, msg_fn, destinatario in _EVENTOS[evento]:
            Notificacao.objects.create(
                titulo=titulo,
                mensagem=msg_fn(dados),
                destinatario=destinatario,
            )
