from ..models import Planejamento, Confirmacao, Veiculo, PerfilMotorista, AlocacaoVeiculo, AlocacaoInstituicao
from ..notifications.observer import NotificacaoSubject  # [PATTERN: OBSERVER]
from enum import Enum
import datetime
from django.db.models import Q, Count


class OrganizacaoPlanejamentoStatus(Enum):
    OK = 0
    NAO_EXISTE = 1
    FECHADO = 2
    SEM_VEICULO_COM_ESPACO = 3
    MOTORISTAS_INSUFICIENTES = 4


# PATTERN: OBSERVER — Subject
# PlanejamentoService herda NotificacaoSubject e emite o evento
# 'PLANEJAMENTO_ORGANIZADO' quando a alocação é concluída com
# sucesso. Observers registrados (ex.: LogNotificador,
# EmailNotificador) reagem automaticamente sem que o service
# precise conhecê-los.
class PlanejamentoService(NotificacaoSubject):

    def __init__(self):
        super().__init__()

    def organizar_planejamento(self, data: datetime.date) -> OrganizacaoPlanejamentoStatus:
        planejamento = Planejamento.objects.filter(data=data).first()

        if planejamento is None:
            return OrganizacaoPlanejamentoStatus.NAO_EXISTE

        if not planejamento.aberto:
            return OrganizacaoPlanejamentoStatus.FECHADO

        AlocacaoInstituicao.objects.filter(
            alocacao_veiculo__planejamento=planejamento
        ).delete()

        AlocacaoVeiculo.objects.filter(
            planejamento=planejamento
        ).delete()

        instituicoes = list(
            Confirmacao.objects.filter(
                planejamento=planejamento
            ).filter(
                Q(ida=True) | Q(retorno=True)
            ).values('passageiro__instituicao').annotate(
                demanda=Count('passageiro__instituicao')
            )
        )

        veiculos = list(Veiculo.objects.all())

        # Algoritmo Bin Packing — First Fit Decreasing (FFD)
        instituicoes.sort(key=lambda i: i['demanda'], reverse=True)

        alocacao = []
        for veiculo in veiculos:
            alocacao.append({
                'veiculo': veiculo,
                'ocupacao': 0,
                'instituicoes': [],
            })

        for instituicao in instituicoes:
            demanda = instituicao['demanda']
            for caixa in alocacao:
                if caixa['ocupacao'] + demanda <= caixa['veiculo'].capacidade:
                    caixa['instituicoes'].append(instituicao)
                    caixa['ocupacao'] += demanda
                    break
            else:
                return OrganizacaoPlanejamentoStatus.SEM_VEICULO_COM_ESPACO

        veiculos_utilizados = [c for c in alocacao if c['instituicoes']]
        motoristas = PerfilMotorista.objects.all()

        if motoristas.count() < len(veiculos_utilizados):
            return OrganizacaoPlanejamentoStatus.MOTORISTAS_INSUFICIENTES

        motoristas = list(motoristas)
        for indice, caixa in enumerate(veiculos_utilizados):
            alocacao_veiculo = AlocacaoVeiculo.objects.create(
                planejamento=planejamento,
                veiculo=caixa['veiculo'],
                motorista=motoristas[indice],
                embarque=datetime.time(17, 45),
            )
            for instituicao in caixa['instituicoes']:
                AlocacaoInstituicao.objects.create(
                    alocacao_veiculo=alocacao_veiculo,
                    instituicao_id=instituicao['passageiro__instituicao'],
                )

        # [PATTERN: OBSERVER] — notifica todos os observers registrados
        self.notificar('PLANEJAMENTO_ORGANIZADO', {'data': str(data)})

        return OrganizacaoPlanejamentoStatus.OK
