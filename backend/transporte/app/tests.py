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