from unittest.mock import patch, MagicMock
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
import datetime

from .services.confirmacao import ConfirmacaoService, TipoViagem, RegistroEmbarqueStatus
from .models import (
    Usuario, Instituicao, PerfilMotorista, PerfilPassageiro,
    Confirmacao, Planejamento, Notificacao,
)


class RegistrarEmbarqueTest(TestCase):

    def setUp(self):
        self.data = datetime.date(2026, 6, 16)
        self.id_aluno = 1

    def _make_planejamento(self, aberto=True):
        p = MagicMock()
        p.aberto = aberto
        return p

    def _make_confirmacao(self, ida=True, retorno=True, presenca_ida=False, presenca_retorno=False):
        c = MagicMock()
        c.ida = ida
        c.retorno = retorno
        c.presenca_ida = presenca_ida
        c.presenca_retorno = presenca_retorno
        return c

    @patch('app.services.confirmacao.Confirmacao')
    @patch('app.services.confirmacao.Planejamento')
    def test_planejamento_nao_existe(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = None

        resultado = ConfirmacaoService().registrar_embarque(self.data, self.id_aluno, TipoViagem.IDA)

        self.assertEqual(resultado, RegistroEmbarqueStatus.PLANEJAMENTO_NAO_EXISTE)
        MockConfirmacao.objects.filter.assert_not_called()

    @patch('app.services.confirmacao.Confirmacao')
    @patch('app.services.confirmacao.Planejamento')
    def test_confirmacao_nao_encontrada(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        MockConfirmacao.objects.filter.return_value.first.return_value = None

        resultado = ConfirmacaoService().registrar_embarque(self.data, self.id_aluno, TipoViagem.IDA)

        self.assertEqual(resultado, RegistroEmbarqueStatus.CONFIRMACAO_NAO_ENCONTRADA)

    @patch('app.services.confirmacao.Confirmacao')
    @patch('app.services.confirmacao.Planejamento')
    def test_ida_nao_confirmada(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        confirmacao = self._make_confirmacao(ida=False)
        MockConfirmacao.objects.filter.return_value.first.return_value = confirmacao

        resultado = ConfirmacaoService().registrar_embarque(self.data, self.id_aluno, TipoViagem.IDA)

        self.assertEqual(resultado, RegistroEmbarqueStatus.VIAGEM_NAO_CONFIRMADA)
        confirmacao.save.assert_not_called()

    @patch('app.services.confirmacao.Confirmacao')
    @patch('app.services.confirmacao.Planejamento')
    def test_retorno_nao_confirmado(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        confirmacao = self._make_confirmacao(retorno=False)
        MockConfirmacao.objects.filter.return_value.first.return_value = confirmacao

        resultado = ConfirmacaoService().registrar_embarque(self.data, self.id_aluno, TipoViagem.RETORNO)

        self.assertEqual(resultado, RegistroEmbarqueStatus.VIAGEM_NAO_CONFIRMADA)
        confirmacao.save.assert_not_called()

    @patch('app.services.confirmacao.Confirmacao')
    @patch('app.services.confirmacao.Planejamento')
    def test_ja_embarcou_ida(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        confirmacao = self._make_confirmacao(ida=True, presenca_ida=True)
        MockConfirmacao.objects.filter.return_value.first.return_value = confirmacao

        resultado = ConfirmacaoService().registrar_embarque(self.data, self.id_aluno, TipoViagem.IDA)

        self.assertEqual(resultado, RegistroEmbarqueStatus.JA_EMBARCADO)
        confirmacao.save.assert_not_called()

    @patch('app.services.confirmacao.Confirmacao')
    @patch('app.services.confirmacao.Planejamento')
    def test_ja_embarcou_retorno(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        confirmacao = self._make_confirmacao(retorno=True, presenca_retorno=True)
        MockConfirmacao.objects.filter.return_value.first.return_value = confirmacao

        resultado = ConfirmacaoService().registrar_embarque(self.data, self.id_aluno, TipoViagem.RETORNO)

        self.assertEqual(resultado, RegistroEmbarqueStatus.JA_EMBARCADO)
        confirmacao.save.assert_not_called()

    @patch('app.services.confirmacao.Confirmacao')
    @patch('app.services.confirmacao.Planejamento')
    def test_embarque_ida_ok(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        confirmacao = self._make_confirmacao(ida=True, presenca_ida=False)
        MockConfirmacao.objects.filter.return_value.first.return_value = confirmacao

        resultado = ConfirmacaoService().registrar_embarque(self.data, self.id_aluno, TipoViagem.IDA)

        self.assertEqual(resultado, RegistroEmbarqueStatus.OK)
        self.assertTrue(confirmacao.presenca_ida)
        confirmacao.save.assert_called_once()

    @patch('app.services.confirmacao.Confirmacao')
    @patch('app.services.confirmacao.Planejamento')
    def test_embarque_retorno_ok(self, MockPlanejamento, MockConfirmacao):
        MockPlanejamento.objects.filter.return_value.first.return_value = self._make_planejamento()
        confirmacao = self._make_confirmacao(retorno=True, presenca_retorno=False)
        MockConfirmacao.objects.filter.return_value.first.return_value = confirmacao

        resultado = ConfirmacaoService().registrar_embarque(self.data, self.id_aluno, TipoViagem.RETORNO)

        self.assertEqual(resultado, RegistroEmbarqueStatus.OK)
        self.assertTrue(confirmacao.presenca_retorno)
        confirmacao.save.assert_called_once()


# ---------------------------------------------------------------------------
# Testes do PlanejamentoService
# ---------------------------------------------------------------------------

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

    def test_planejamento_nao_existe(self):
        resultado = PlanejamentoService().organizar_planejamento(self.data)
        self.assertEqual(resultado, OrganizacaoPlanejamentoStatus.NAO_EXISTE)

    def test_planejamento_fechado(self):
        criar_planejamento(data=self.data, aberto=False)
        resultado = PlanejamentoService().organizar_planejamento(self.data)
        self.assertEqual(resultado, OrganizacaoPlanejamentoStatus.FECHADO)

    def test_sem_veiculo_com_espaco(self):
        criar_planejamento(data=self.data)
        criar_veiculo(capacidade=5, placa='AAA-0001')

        instituicoes = [{'passageiro__instituicao': 1, 'demanda': 10}]

        with patch(f'{SERVICE_PATH}.Confirmacao') as MockConf:
            MockConf.objects.filter.return_value.filter.return_value.values.return_value.annotate.return_value = instituicoes
            resultado = PlanejamentoService().organizar_planejamento(self.data)

        self.assertEqual(resultado, OrganizacaoPlanejamentoStatus.SEM_VEICULO_COM_ESPACO)

    def test_motoristas_insuficientes(self):
        criar_planejamento(data=self.data)
        criar_veiculo(capacidade=50, placa='AAA-0002')

        instituicoes = [{'passageiro__instituicao': 1, 'demanda': 10}]

        with patch(f'{SERVICE_PATH}.Confirmacao') as MockConf:
            MockConf.objects.filter.return_value.filter.return_value.values.return_value.annotate.return_value = instituicoes
            resultado = PlanejamentoService().organizar_planejamento(self.data)

        self.assertEqual(resultado, OrganizacaoPlanejamentoStatus.MOTORISTAS_INSUFICIENTES)

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

            PlanejamentoService().organizar_planejamento(self.data)

            MockAI.objects.filter.return_value.delete.assert_called_once()
            MockAV.objects.filter.return_value.delete.assert_called_once()


# ---------------------------------------------------------------------------
# Helpers compartilhados pelos testes de integração (ViewSets)
# ---------------------------------------------------------------------------

def _criar_usuario(username, cpf, superuser=False):
    if superuser:
        return Usuario.objects.create_superuser(
            username=username, password='senha123',
            email=f'{username}@test.com', cpf=cpf,
        )
    return Usuario.objects.create_user(
        username=username, password='senha123',
        email=f'{username}@test.com', cpf=cpf,
    )

def _token(usuario):
    token, _ = Token.objects.get_or_create(user=usuario)
    return token.key

def _instituicao():
    return Instituicao.objects.create(
        nome='UFSC', horario_inicio=datetime.time(7, 0), horario_fim=datetime.time(12, 0),
    )


# ---------------------------------------------------------------------------
# DatabaseNotificador
# ---------------------------------------------------------------------------

class DatabaseNotificadorTest(TestCase):

    def test_planejamento_organizado_cria_notificacao_para_admin(self):
        from app.notifications.notificadores import DatabaseNotificador
        DatabaseNotificador().atualizar('PLANEJAMENTO_ORGANIZADO', {'data': '2026-06-16'})
        n = Notificacao.objects.get()
        self.assertEqual(n.destinatario, 'admin')
        self.assertIn('2026-06-16', n.mensagem)

    def test_planejamento_fechado_cria_notificacao_para_passageiro(self):
        from app.notifications.notificadores import DatabaseNotificador
        DatabaseNotificador().atualizar('PLANEJAMENTO_FECHADO', {'data': '2026-06-17'})
        n = Notificacao.objects.get()
        self.assertEqual(n.destinatario, 'passageiro')

    def test_embarque_registrado_cria_notificacao_para_admin(self):
        from app.notifications.notificadores import DatabaseNotificador
        DatabaseNotificador().atualizar('EMBARQUE_REGISTRADO', {
            'data': '2026-06-16', 'id_passageiro': 1, 'tipo': 'ida',
        })
        n = Notificacao.objects.get()
        self.assertEqual(n.destinatario, 'admin')

    def test_evento_desconhecido_nao_cria_notificacao(self):
        from app.notifications.notificadores import DatabaseNotificador
        DatabaseNotificador().atualizar('EVENTO_INEXISTENTE', {})
        self.assertEqual(Notificacao.objects.count(), 0)


# ---------------------------------------------------------------------------
# ConfirmacaoViewSet — isolamento por papel e unicidade
# ---------------------------------------------------------------------------

class ConfirmacaoViewSetTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.inst = _instituicao()
        self.plan = Planejamento.objects.create(data=datetime.date(2026, 6, 16), aberto=True)

        u1 = _criar_usuario('pass_a', '111.111.111-11')
        u2 = _criar_usuario('pass_b', '222.222.222-22')
        self.perfil1 = PerfilPassageiro.objects.create(
            usuario=u1, instituicao=self.inst, comprovante_matricula='', matricula_valida=True,
        )
        self.perfil2 = PerfilPassageiro.objects.create(
            usuario=u2, instituicao=self.inst, comprovante_matricula='', matricula_valida=True,
        )
        self.token1 = _token(u1)
        self.token2 = _token(u2)

        admin = _criar_usuario('admin_conf', '000.000.000-00', superuser=True)
        self.token_admin = _token(admin)

    def test_passageiro_ve_apenas_proprias_confirmacoes(self):
        Confirmacao.objects.create(passageiro=self.perfil1, planejamento=self.plan,
                                   ida=True, retorno=False, presenca_ida=False, presenca_retorno=False)
        Confirmacao.objects.create(passageiro=self.perfil2, planejamento=self.plan,
                                   ida=True, retorno=False, presenca_ida=False, presenca_retorno=False)

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1}')
        resp = self.client.get('/api/confirmacoes/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['passageiro'], self.perfil1.id)

    def test_admin_ve_todas_as_confirmacoes(self):
        Confirmacao.objects.create(passageiro=self.perfil1, planejamento=self.plan,
                                   ida=True, retorno=False, presenca_ida=False, presenca_retorno=False)
        Confirmacao.objects.create(passageiro=self.perfil2, planejamento=self.plan,
                                   ida=True, retorno=False, presenca_ida=False, presenca_retorno=False)

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin}')
        resp = self.client.get('/api/confirmacoes/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 2)

    def test_create_nao_duplica_confirmacao(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1}')

        resp1 = self.client.post('/api/confirmacoes/', {
            'passageiro': self.perfil1.id, 'planejamento': self.plan.id,
            'ida': True, 'retorno': False,
        }, format='json')
        self.assertEqual(resp1.status_code, 201, f'Primeiro POST falhou: {resp1.data}')

        resp2 = self.client.post('/api/confirmacoes/', {
            'passageiro': self.perfil1.id, 'planejamento': self.plan.id,
            'ida': False, 'retorno': True,
        }, format='json')
        self.assertEqual(resp2.status_code, 200, f'Segundo POST falhou: {resp2.data}')

        self.assertEqual(Confirmacao.objects.filter(passageiro=self.perfil1).count(), 1)
        conf = Confirmacao.objects.get(passageiro=self.perfil1)
        self.assertFalse(conf.ida)
        self.assertTrue(conf.retorno)

    def test_create_nao_reseta_presenca(self):
        conf = Confirmacao.objects.create(passageiro=self.perfil1, planejamento=self.plan,
                                          ida=True, retorno=False,
                                          presenca_ida=True, presenca_retorno=False)

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1}')
        self.client.post('/api/confirmacoes/', {
            'passageiro': self.perfil1.id, 'planejamento': self.plan.id,
            'ida': True, 'retorno': True,
        }, format='json')

        conf.refresh_from_db()
        self.assertTrue(conf.presenca_ida)  # não deve ter sido zerada


# ---------------------------------------------------------------------------
# UsuarioViewSet — criar motorista e passageiro
# ---------------------------------------------------------------------------

class CriarUsuarioTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        admin = _criar_usuario('admin_usr', '999.999.999-99', superuser=True)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {_token(admin)}')
        self.inst = _instituicao()

    def test_criar_motorista_retorna_201_e_persiste(self):
        resp = self.client.post('/api/usuarios/criar-motorista/', {
            'username': 'mot_novo', 'password': 'senha123',
            'first_name': 'João', 'last_name': 'Silva',
            'email': 'joao@test.com', 'cpf': '123.456.789-00', 'habilitacao': 'D',
        }, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertIn('perfilMotoristaId', resp.data)
        self.assertTrue(PerfilMotorista.objects.filter(usuario__username='mot_novo').exists())

    def test_criar_passageiro_retorna_201_e_persiste(self):
        resp = self.client.post('/api/usuarios/criar-passageiro/', {
            'username': 'pass_novo', 'password': 'senha123',
            'first_name': 'Ana', 'last_name': 'Lima',
            'email': 'ana@test.com', 'cpf': '987.654.321-00',
            'instituicao': self.inst.id,
        }, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertIn('perfilPassageiroId', resp.data)
        self.assertTrue(PerfilPassageiro.objects.filter(usuario__username='pass_novo').exists())

    def test_criar_motorista_username_duplicado_retorna_400(self):
        _criar_usuario('mot_dup', '111.222.333-44')
        resp = self.client.post('/api/usuarios/criar-motorista/', {
            'username': 'mot_dup', 'password': 'senha123',
            'first_name': 'X', 'last_name': 'Y',
            'email': 'x@y.com', 'cpf': '999.888.777-66', 'habilitacao': 'D',
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_criar_passageiro_cpf_duplicado_retorna_400(self):
        _criar_usuario('user_cpf', '777.666.555-44')
        resp = self.client.post('/api/usuarios/criar-passageiro/', {
            'username': 'pass_cpf2', 'password': 'senha123',
            'first_name': 'Z', 'last_name': 'W',
            'email': 'z@w.com', 'cpf': '777.666.555-44',
            'instituicao': self.inst.id,
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_criar_motorista_campo_faltando_retorna_400(self):
        resp = self.client.post('/api/usuarios/criar-motorista/', {
            'username': 'sem_habilitacao', 'password': 'senha123',
            'first_name': 'X', 'last_name': 'Y', 'email': 'a@b.com', 'cpf': '000.111.222-33',
        }, format='json')
        self.assertEqual(resp.status_code, 400)


# ---------------------------------------------------------------------------
# PlanejamentoViewSet — notificação ao fechar planejamento
# ---------------------------------------------------------------------------

class PlanejamentoFechamentoTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        admin = _criar_usuario('admin_plan', '888.888.888-88', superuser=True)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {_token(admin)}')

    def test_fechar_planejamento_cria_notificacao_passageiro(self):
        plan = Planejamento.objects.create(data=datetime.date(2026, 6, 20), aberto=True)
        resp = self.client.patch(f'/api/planejamentos/{plan.id}/', {'aberto': False}, format='json')
        self.assertEqual(resp.status_code, 200)
        n = Notificacao.objects.get()
        self.assertEqual(n.destinatario, 'passageiro')

    def test_abrir_planejamento_nao_cria_notificacao(self):
        plan = Planejamento.objects.create(data=datetime.date(2026, 6, 21), aberto=False)
        self.client.patch(f'/api/planejamentos/{plan.id}/', {'aberto': True}, format='json')
        self.assertEqual(Notificacao.objects.count(), 0)


# ---------------------------------------------------------------------------
# NotificacaoViewSet — filtragem por papel do usuário
# ---------------------------------------------------------------------------

class NotificacaoViewSetTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        inst = _instituicao()

        admin = _criar_usuario('admin_notif', '333.333.333-33', superuser=True)
        self.token_admin = _token(admin)

        u_pass = _criar_usuario('pass_notif', '444.444.444-44')
        self.token_pass = _token(u_pass)
        PerfilPassageiro.objects.create(
            usuario=u_pass, instituicao=inst, comprovante_matricula='', matricula_valida=True,
        )

        u_mot = _criar_usuario('mot_notif', '555.555.555-55')
        self.token_mot = _token(u_mot)
        PerfilMotorista.objects.create(usuario=u_mot, habilitacao='D')

        Notificacao.objects.create(titulo='Admin msg',      mensagem='', destinatario='admin')
        Notificacao.objects.create(titulo='Passageiro msg', mensagem='', destinatario='passageiro')
        Notificacao.objects.create(titulo='Motorista msg',  mensagem='', destinatario='motorista')
        Notificacao.objects.create(titulo='Todos msg',      mensagem='', destinatario='todos')

    def _titulos(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        return [n['titulo'] for n in self.client.get('/api/notificacoes/').data]

    def test_admin_ve_proprias_e_todos(self):
        titulos = self._titulos(self.token_admin)
        self.assertIn('Admin msg', titulos)
        self.assertIn('Todos msg', titulos)
        self.assertNotIn('Passageiro msg', titulos)
        self.assertNotIn('Motorista msg', titulos)

    def test_passageiro_ve_proprias_e_todos(self):
        titulos = self._titulos(self.token_pass)
        self.assertIn('Passageiro msg', titulos)
        self.assertIn('Todos msg', titulos)
        self.assertNotIn('Admin msg', titulos)
        self.assertNotIn('Motorista msg', titulos)

    def test_motorista_ve_proprias_e_todos(self):
        titulos = self._titulos(self.token_mot)
        self.assertIn('Motorista msg', titulos)
        self.assertIn('Todos msg', titulos)
        self.assertNotIn('Admin msg', titulos)
        self.assertNotIn('Passageiro msg', titulos)

    def test_marcar_todas_lidas_afeta_apenas_proprias(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_pass}')
        self.client.post('/api/notificacoes/marcar-todas-lidas/')

        lidas_pass = Notificacao.objects.filter(
            destinatario__in=['passageiro', 'todos'], lida=True,
        ).count()
        nao_lidas_admin = Notificacao.objects.filter(destinatario='admin', lida=False).count()

        self.assertEqual(lidas_pass, 2)   # passageiro + todos
        self.assertEqual(nao_lidas_admin, 1)
