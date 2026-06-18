import logging
from .observer import NotificacaoObserver

logger = logging.getLogger(__name__)

# Mapeamento de evento → (título, mensagem, destinatário).
_EVENTOS = {
    'PLANEJAMENTO_ORGANIZADO': (
        'Planejamento organizado',
        lambda d: f"O planejamento de {d['data']} foi organizado automaticamente.",
        'admin',
    ),
    'PLANEJAMENTO_FECHADO': (
        'Planejamento fechado',
        lambda d: f"O planejamento de {d['data']} foi encerrado. Confirmações não são mais aceitas.",
        'passageiro',
    ),
    'EMBARQUE_REGISTRADO': (
        'Embarque registrado',
        lambda d: f"Embarque ({d['tipo']}) registrado para o passageiro #{d['id_passageiro']} em {d['data']}.",
        'admin',
    ),
}


# ============================================================
# PATTERN: OBSERVER — Observer concreto: e-mail.
# ============================================================
class EmailNotificador(NotificacaoObserver):
    def atualizar(self, evento: str, dados: dict) -> None:
        logger.info(f'[EMAIL] Evento={evento} | Dados={dados}')


# ============================================================
# PATTERN: OBSERVER — Observer concreto: log.
# ============================================================
class LogNotificador(NotificacaoObserver):
    def atualizar(self, evento: str, dados: dict) -> None:
        logger.info(f'[LOG] Evento={evento} | Dados={dados}')


# ============================================================
# PATTERN: OBSERVER — Observer concreto: banco de dados.
# Persiste a notificação com o destinatário correto para que
# o frontend filtre por papel do usuário autenticado.
# ============================================================
class DatabaseNotificador(NotificacaoObserver):
    def atualizar(self, evento: str, dados: dict) -> None:
        if evento not in _EVENTOS:
            return
        titulo, msg_fn, destinatario = _EVENTOS[evento]
        from ..models.notificacao import Notificacao
        Notificacao.objects.create(
            titulo=titulo,
            mensagem=msg_fn(dados),
            destinatario=destinatario,
        )
