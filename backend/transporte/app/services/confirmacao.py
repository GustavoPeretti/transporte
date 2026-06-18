from enum import Enum
import datetime

from ..models.confirmacao import Confirmacao
from ..models.planejamento import Planejamento
from ..notifications.observer import NotificacaoSubject  # [PATTERN: OBSERVER]


class TipoViagem(Enum):
    IDA = "ida"
    RETORNO = "retorno"


class RegistroEmbarqueStatus(Enum):
    OK = 0
    PLANEJAMENTO_NAO_EXISTE = 1
    CONFIRMACAO_NAO_ENCONTRADA = 2
    VIAGEM_NAO_CONFIRMADA = 3
    JA_EMBARCADO = 4


# ============================================================
# PATTERN: OBSERVER — Subject
# ============================================================
class ConfirmacaoService(NotificacaoSubject):

    def __init__(self):
        super().__init__()

    def registrar_embarque(
        self,
        data: datetime.date,
        id_passageiro: int,
        tipo: TipoViagem,
    ) -> RegistroEmbarqueStatus:
        planejamento = Planejamento.objects.filter(data=data).first()

        if planejamento is None:
            return RegistroEmbarqueStatus.PLANEJAMENTO_NAO_EXISTE

        confirmacao = Confirmacao.objects.filter(
            planejamento=planejamento,
            passageiro_id=id_passageiro,
        ).first()

        if confirmacao is None:
            return RegistroEmbarqueStatus.CONFIRMACAO_NAO_ENCONTRADA

        if tipo == TipoViagem.IDA:
            if not confirmacao.ida:
                return RegistroEmbarqueStatus.VIAGEM_NAO_CONFIRMADA
            if confirmacao.presenca_ida:
                return RegistroEmbarqueStatus.JA_EMBARCADO
            confirmacao.presenca_ida = True
        else:
            if not confirmacao.retorno:
                return RegistroEmbarqueStatus.VIAGEM_NAO_CONFIRMADA
            if confirmacao.presenca_retorno:
                return RegistroEmbarqueStatus.JA_EMBARCADO
            confirmacao.presenca_retorno = True

        confirmacao.save()

        # [PATTERN: OBSERVER] — notifica observers registrados
        self.notificar('EMBARQUE_REGISTRADO', {
            'data': str(data),
            'id_passageiro': id_passageiro,
            'tipo': tipo.value,
        })

        return RegistroEmbarqueStatus.OK
