from ..models import Planejamento, Confirmacao, Veiculo, PerfilMotorista, AlocacaoVeiculo, AlocacaoInstituicao
from enum import Enum
import datetime
from django.db.models import Q, Count

class OrganizacaoPlanejamentoStatus(Enum):
    OK = 0
    NAO_EXISTE = 1
    FECHADO = 2
    SEM_VEICULO_COM_ESPACO = 3
    MOTORISTAS_INSUFICIENTES = 4

class PlanejamentoService:
    @staticmethod
    def organizar_planejamento(data: datetime.date) -> OrganizacaoPlanejamentoStatus:
        planejamento = Planejamento.objects.filter(data=data).first()

        # Verifica se existe planejamento para a data fornecida
        if planejamento is None:
            return OrganizacaoPlanejamentoStatus.NAO_EXISTE

        # Verifica se o planejamento está aberto
        if not planejamento.aberto:
            return OrganizacaoPlanejamentoStatus.FECHADO

        AlocacaoInstituicao.objects.filter(
            alocacao_veiculo__planejamento=planejamento
        ).delete()

        AlocacaoVeiculo.objects.filter(
            planejamento=planejamento
        ).delete()

        veiculos = Veiculo.objects.all()

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

        # Algoritmo Bin Packing - First Fit Decreasing (FFD)

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
                capacidade = caixa['veiculo'].capacidade

                if caixa['ocupacao'] + demanda <= capacidade:
                    caixa['instituicoes'].append(instituicao)
                    caixa['ocupacao'] += demanda
                    break
            else:
                return OrganizacaoPlanejamentoStatus.SEM_VEICULO_COM_ESPACO

        # Salvar alocação no banco de dados

        veiculos_utilizados = [
            caixa for caixa in alocacao
            if caixa['instituicoes']
        ]

        quantidade_veiculos = len(veiculos_utilizados)

        motoristas = PerfilMotorista.objects.all()

        if motoristas.count() < quantidade_veiculos:
            return OrganizacaoPlanejamentoStatus.MOTORISTAS_INSUFICIENTES

        motoristas = list(motoristas)

        for indice, veiculo in enumerate(veiculos_utilizados):
            alocacao_veiculo = AlocacaoVeiculo.objects.create(
                planejamento=planejamento,
                veiculo=veiculo['veiculo'],
                motorista=motoristas[indice],
                embarque=datetime.time(17, 45),
            )

            for instituicao in veiculo['instituicoes']:
                AlocacaoInstituicao.objects.create(
                    alocacao_veiculo=alocacao_veiculo,
                    instituicao_id=instituicao['passageiro__instituicao'],
                )

        return OrganizacaoPlanejamentoStatus.OK
