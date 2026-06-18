import datetime
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Popula o banco com dados de teste'

    def handle(self, *args, **options):
        from app.models import (
            Instituicao, Usuario, PerfilMotorista, PerfilPassageiro,
            Veiculo, Planejamento, Confirmacao,
        )
        from app.enums.tipo_veiculo import TipoVeiculoEnum

        self.stdout.write('Limpando dados existentes...')
        Confirmacao.objects.all().delete()
        Planejamento.objects.all().delete()
        PerfilPassageiro.objects.all().delete()
        PerfilMotorista.objects.all().delete()
        Veiculo.objects.all().delete()
        Instituicao.objects.all().delete()
        Usuario.objects.filter(is_superuser=False).delete()

        self.stdout.write('Criando instituições...')
        ufsc = Instituicao.objects.create(nome='UFSC', horario_inicio=datetime.time(7, 30), horario_fim=datetime.time(12, 0))
        udesc = Instituicao.objects.create(nome='UDESC', horario_inicio=datetime.time(7, 0), horario_fim=datetime.time(12, 30))
        ifsc = Instituicao.objects.create(nome='IFSC', horario_inicio=datetime.time(8, 0), horario_fim=datetime.time(17, 0))

        self.stdout.write('Criando veículos...')
        Veiculo.objects.create(placa='ABC-1234', capacidade=40, modelo='Marcopolo G7', tipo=TipoVeiculoEnum.ONIBUS)
        Veiculo.objects.create(placa='DEF-5678', capacidade=15, modelo='Mercedes Sprinter', tipo=TipoVeiculoEnum.VAN)
        Veiculo.objects.create(placa='GHI-9012', capacidade=25, modelo='Volare W9', tipo=TipoVeiculoEnum.MICROONIBUS)

        self.stdout.write('Criando motoristas...')
        u_m1 = Usuario.objects.create_user(
            username='motorista1', password='senha123',
            first_name='João', last_name='Silva',
            cpf='111.111.111-11', email='joao.silva@teste.com',
        )
        u_m2 = Usuario.objects.create_user(
            username='motorista2', password='senha123',
            first_name='Maria', last_name='Souza',
            cpf='222.222.222-22', email='maria.souza@teste.com',
        )
        PerfilMotorista.objects.create(usuario=u_m1, habilitacao='D')
        PerfilMotorista.objects.create(usuario=u_m2, habilitacao='D')

        self.stdout.write('Criando passageiros...')
        u_p1 = Usuario.objects.create_user(
            username='passageiro1', password='senha123',
            first_name='Ana', last_name='Lima',
            cpf='333.333.333-33', email='ana.lima@teste.com',
        )
        u_p2 = Usuario.objects.create_user(
            username='passageiro2', password='senha123',
            first_name='Carlos', last_name='Ramos',
            cpf='444.444.444-44', email='carlos.ramos@teste.com',
        )
        u_p3 = Usuario.objects.create_user(
            username='passageiro3', password='senha123',
            first_name='Beatriz', last_name='Costa',
            cpf='555.555.555-55', email='beatriz.costa@teste.com',
        )
        u_p4 = Usuario.objects.create_user(
            username='passageiro4', password='senha123',
            first_name='Lucas', last_name='Martins',
            cpf='666.666.666-66', email='lucas.martins@teste.com',
        )
        pp1 = PerfilPassageiro.objects.create(usuario=u_p1, instituicao=ufsc, comprovante_matricula='', matricula_valida=True)
        pp2 = PerfilPassageiro.objects.create(usuario=u_p2, instituicao=ufsc, comprovante_matricula='', matricula_valida=True)
        pp3 = PerfilPassageiro.objects.create(usuario=u_p3, instituicao=udesc, comprovante_matricula='', matricula_valida=True)
        pp4 = PerfilPassageiro.objects.create(usuario=u_p4, instituicao=ifsc, comprovante_matricula='', matricula_valida=False)

        self.stdout.write('Criando planejamentos da semana atual...')
        today = datetime.date.today()
        monday = today - datetime.timedelta(days=today.weekday())

        for i in range(5):
            day = monday + datetime.timedelta(days=i)
            plan = Planejamento.objects.create(data=day, aberto=True)
            Confirmacao.objects.create(passageiro=pp1, planejamento=plan, ida=True, retorno=True, presenca_ida=False, presenca_retorno=False)
            Confirmacao.objects.create(passageiro=pp2, planejamento=plan, ida=True, retorno=False, presenca_ida=False, presenca_retorno=False)
            Confirmacao.objects.create(passageiro=pp3, planejamento=plan, ida=True, retorno=True, presenca_ida=False, presenca_retorno=False)
            Confirmacao.objects.create(passageiro=pp4, planejamento=plan, ida=False, retorno=False, presenca_ida=False, presenca_retorno=False)

        self.stdout.write(self.style.SUCCESS('\nBanco populado com sucesso!'))
        self.stdout.write('  Motoristas : motorista1/senha123, motorista2/senha123')
        self.stdout.write('  Passageiros: passageiro1/senha123, passageiro2/senha123, passageiro3/senha123, passageiro4/senha123')
        self.stdout.write('  Instituições: UFSC, UDESC, IFSC')
