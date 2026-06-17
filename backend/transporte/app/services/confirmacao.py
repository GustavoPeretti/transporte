from enum import Enum
import datetime
from django.db.models import Q

from ..models.confirmacao import Confirmacao
from ..models.planejamento import Planejamento


class TipoViagem(Enum):
    IDA = "ida"
    RETORNO = "retorno"


class RegistroEmbarqueStatus(Enum):
    OK = 0
    PLANEJAMENTO_NAO_EXISTE = 1
    PLANEJAMENTO_FECHADO = 2
    CONFIRMACAO_NAO_ENCONTRADA = 3
    VIAGEM_NAO_CONFIRMADA = 4
    JA_EMBARCADO = 5


class ConfirmacaoService:
    @staticmethod
    def registrar_embarque(
        data: datetime.date,
        id_passageiro: int,
        tipo: TipoViagem,
    ) -> RegistroEmbarqueStatus:
        planejamento = Planejamento.objects.filter(data=data).first()

        if planejamento is None:
            return RegistroEmbarqueStatus.PLANEJAMENTO_NAO_EXISTE

        if not planejamento.aberto:
            return RegistroEmbarqueStatus.PLANEJAMENTO_FECHADO

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
        return RegistroEmbarqueStatus.OK
