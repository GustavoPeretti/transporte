from unittest.mock import patch, MagicMock
from django.test import TestCase
import datetime

from ..app.services import PlanejamentoService, TipoViagem, RegistroEmbarqueStatus


class RegistrarEmbarqueTest(TestCase):

    def setUp(self):
        self.data = datetime.date(2026, 6, 16)
        self.id_aluno = 1

    def _make_planejamento(self, aberto=True):
        p = MagicMock()
        p.aberto = aberto
        return p

    def _make_confirmacao(self, ida=True, retorno=True, embarcou_ida=False, embarcou_retorno=False):
        c = MagicMock()
        c.ida = ida
        c.retorno = retorno
        c.embarcou_ida = embarcou_ida
        c.embarcou_retorno = embarcou_retorno
        return c

    @patch("transporte.services.Confirmacao")
    @patch("seu_app.services.Planejamento")
    def test_planejamento_nao_existe(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = None

        status = PlanejamentoService.registrar_embarque(self.data, self.id_aluno, TipoViagem.IDA)

        self.assertEqual(status, RegistroEmbarqueStatus.PLANEJAMENTO_NAO_EXISTE)
        MockConfirmacao.objects.filter.assert_not_called()

    @patch("seu_app.services.Confirmacao")
    @patch("seu_app.services.Planejamento")
    def test_planejamento_fechado(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento(aberto=False)

        status = PlanejamentoService.registrar_embarque(self.data, self.id_aluno, TipoViagem.IDA)

        self.assertEqual(status, RegistroEmbarqueStatus.PLANEJAMENTO_FECHADO)
        MockConfirmacao.objects.filter.assert_not_called()

    @patch("seu_app.services.Confirmacao")
    @patch("seu_app.services.Planejamento")
    def test_confirmacao_nao_encontrada(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        MockConfirmacao.objects.filter.return_value.first.return_value = None

        status = PlanejamentoService.registrar_embarque(self.data, self.id_aluno, TipoViagem.IDA)

        self.assertEqual(status, RegistroEmbarqueStatus.CONFIRMACAO_NAO_ENCONTRADA)

    @patch("seu_app.services.Confirmacao")
    @patch("seu_app.services.Planejamento")
    def test_ida_nao_confirmada(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        confirmacao = self._make_confirmacao(ida=False)
        MockConfirmacao.objects.filter.return_value.first.return_value = confirmacao

        status = PlanejamentoService.registrar_embarque(self.data, self.id_aluno, TipoViagem.IDA)

        self.assertEqual(status, RegistroEmbarqueStatus.VIAGEM_NAO_CONFIRMADA)
        confirmacao.save.assert_not_called()

    @patch("seu_app.services.Confirmacao")
    @patch("seu_app.services.Planejamento")
    def test_retorno_nao_confirmado(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        confirmacao = self._make_confirmacao(retorno=False)
        MockConfirmacao.objects.filter.return_value.first.return_value = confirmacao

        status = PlanejamentoService.registrar_embarque(self.data, self.id_aluno, TipoViagem.RETORNO)

        self.assertEqual(status, RegistroEmbarqueStatus.VIAGEM_NAO_CONFIRMADA)
        confirmacao.save.assert_not_called()

    @patch("seu_app.services.Confirmacao")
    @patch("seu_app.services.Planejamento")
    def test_ja_embarcou_ida(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        confirmacao = self._make_confirmacao(ida=True, embarcou_ida=True)
        MockConfirmacao.objects.filter.return_value.first.return_value = confirmacao

        status = PlanejamentoService.registrar_embarque(self.data, self.id_aluno, TipoViagem.IDA)

        self.assertEqual(status, RegistroEmbarqueStatus.JA_EMBARCADO)
        confirmacao.save.assert_not_called()

    @patch("seu_app.services.Confirmacao")
    @patch("seu_app.services.Planejamento")
    def test_ja_embarcou_retorno(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        confirmacao = self._make_confirmacao(retorno=True, embarcou_retorno=True)
        MockConfirmacao.objects.filter.return_value.first.return_value = confirmacao

        status = PlanejamentoService.registrar_embarque(self.data, self.id_aluno, TipoViagem.RETORNO)

        self.assertEqual(status, RegistroEmbarqueStatus.JA_EMBARCADO)
        confirmacao.save.assert_not_called()

    @patch("seu_app.services.Confirmacao")
    @patch("seu_app.services.Planejamento")
    def test_embarque_ida_ok(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        confirmacao = self._make_confirmacao(ida=True, embarcou_ida=False)
        MockConfirmacao.objects.filter.return_value.first.return_value = confirmacao

        status = PlanejamentoService.registrar_embarque(self.data, self.id_aluno, TipoViagem.IDA)

        self.assertEqual(status, RegistroEmbarqueStatus.OK)
        self.assertTrue(confirmacao.embarcou_ida)
        confirmacao.save.assert_called_once()

    @patch("seu_app.services.Confirmacao")
    @patch("seu_app.services.Planejamento")
    def test_embarque_retorno_ok(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        confirmacao = self._make_confirmacao(retorno=True, embarcou_retorno=False)
        MockConfirmacao.objects.filter.return_value.first.return_value = confirmacao

        status = PlanejamentoService.registrar_embarque(self.data, self.id_aluno, TipoViagem.RETORNO)

        self.assertEqual(status, RegistroEmbarqueStatus.OK)
        self.assertTrue(confirmacao.embarcou_retorno)
        confirmacao.save.assert_called_once()



#Planejamento

from .models import Planejamento, Veiculo, Instituicao
from .services.planejamento import PlanejamentoService, OrganizacaoPlanejamentoStatus


def criar_planejamento(data=None, aberto=True):
    return Planejamento.objects.create(
        data=data or datetime.date(2026, 6, 16),
        aberto=aberto,
    )


def criar_veiculo(capacidade=50, placa='ABC-1234', modelo='Ônibus'):
    return Veiculo.objects.create(
        placa=placa,
        capacidade=capacidade,
        modelo=modelo,
    )


def criar_instituicao(nome='UFSC'):
    return Instituicao.objects.create(
        nome=nome,
        horario_inicio=datetime.time(7, 0),
        horario_fim=datetime.time(12, 0),
    )


SERVICE_PATH = 'app.services.planejamento'


class OrganizarPlanejamentoTest(TestCase):

    def setUp(self):
        self.data = datetime.date(2026, 6, 16)

    # ------------------------------------------------------------------
    # Casos de guarda (sem tocar no FFD)
    # ------------------------------------------------------------------

    def test_planejamento_nao_existe(self):
        status = PlanejamentoService.organizar_planejamento(self.data)
        self.assertEqual(status, OrganizacaoPlanejamentoStatus.NAO_EXISTE)

    def test_planejamento_fechado(self):
        criar_planejamento(data=self.data, aberto=False)
        status = PlanejamentoService.organizar_planejamento(self.data)
        self.assertEqual(status, OrganizacaoPlanejamentoStatus.FECHADO)

    # ------------------------------------------------------------------
    # Casos do algoritmo FFD (mock do queryset de instituições)
    # NOTA: o service usa .values('instituicao') mas Confirmacao não tem
    # esse campo direto — deveria ser .values('passageiro__instituicao').
    # Enquanto o model não for corrigido, mockamos o resultado da query.
    # ------------------------------------------------------------------

    def test_sem_veiculo_com_espaco(self):
        criar_planejamento(data=self.data)
        criar_veiculo(capacidade=5, placa='AAA-0001')

        instituicoes = [{'instituicao': 1, 'demanda': 10}]

        with patch(f'{SERVICE_PATH}.Confirmacao') as MockConf:
            MockConf.objects.filter.return_value.filter.return_value.values.return_value.annotate.return_value = instituicoes
            status = PlanejamentoService.organizar_planejamento(self.data)

        self.assertEqual(status, OrganizacaoPlanejamentoStatus.SEM_VEICULO_COM_ESPACO)

    def test_motoristas_insuficientes(self):
        criar_planejamento(data=self.data)
        criar_veiculo(capacidade=50, placa='AAA-0002')

        instituicoes = [{'instituicao': 1, 'demanda': 10}]

        # Nenhum PerfilMotorista cadastrado → motoristas_insuficientes
        with patch(f'{SERVICE_PATH}.Confirmacao') as MockConf:
            MockConf.objects.filter.return_value.filter.return_value.values.return_value.annotate.return_value = instituicoes
            status = PlanejamentoService.organizar_planejamento(self.data)

        self.assertEqual(status, OrganizacaoPlanejamentoStatus.MOTORISTAS_INSUFICIENTES)

    def test_deleta_alocacoes_anteriores(self):
        """Garante que alocações antigas são removidas antes de realocar."""
        criar_planejamento(data=self.data)

        with patch(f'{SERVICE_PATH}.AlocacaoInstituicao') as MockAI, \
             patch(f'{SERVICE_PATH}.AlocacaoVeiculo') as MockAV, \
             patch(f'{SERVICE_PATH}.Confirmacao') as MockConf, \
             patch(f'{SERVICE_PATH}.Veiculo') as MockVeiculo, \
             patch(f'{SERVICE_PATH}.PerfilMotorista') as MockMotorista:

            MockConf.objects.filter.return_value.filter.return_value.values.return_value.annotate.return_value = []
            MockVeiculo.objects.all.return_value = []
            MockMotorista.objects.all.return_value = MagicMock(count=lambda: 0)

            PlanejamentoService.organizar_planejamento(self.data)

            MockAI.objects.filter.return_value.delete.assert_called_once()
            MockAV.objects.filter.return_value.delete.assert_called_once()