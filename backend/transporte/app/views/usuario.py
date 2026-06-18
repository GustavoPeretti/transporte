from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Usuario, PerfilMotorista, PerfilPassageiro, Instituicao
from ..serializers import UsuarioSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    @action(detail=False, methods=['post'], url_path='criar-motorista')
    def criar_motorista(self, request):
        campos = ['username', 'password', 'first_name', 'last_name', 'email', 'cpf', 'habilitacao']
        dados = {c: request.data.get(c, '').strip() for c in campos}

        faltando = [c for c in campos if not dados[c]]
        if faltando:
            return Response(
                {'erro': f'Campos obrigatórios: {", ".join(faltando)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Usuario.objects.filter(username=dados['username']).exists():
            return Response({'erro': 'Nome de usuário já existe.'}, status=status.HTTP_400_BAD_REQUEST)

        if Usuario.objects.filter(cpf=dados['cpf']).exists():
            return Response({'erro': 'CPF já cadastrado.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            usuario = Usuario.objects.create_user(
                username=dados['username'],
                password=dados['password'],
                first_name=dados['first_name'],
                last_name=dados['last_name'],
                email=dados['email'],
                cpf=dados['cpf'],
            )
            perfil = PerfilMotorista.objects.create(
                usuario=usuario,
                habilitacao=dados['habilitacao'],
            )

        return Response({
            'usuario': UsuarioSerializer(usuario).data,
            'perfilMotoristaId': perfil.id,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='criar-passageiro')
    def criar_passageiro(self, request):
        campos_texto = ['username', 'password', 'first_name', 'last_name', 'email', 'cpf', 'instituicao']
        dados = {c: request.data.get(c, '') for c in campos_texto}

        faltando = [c for c in campos_texto if not str(dados[c]).strip()]
        if faltando:
            return Response(
                {'erro': f'Campos obrigatórios: {", ".join(faltando)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not Instituicao.objects.filter(id=dados['instituicao']).exists():
            return Response({'erro': 'Instituição não encontrada.'}, status=status.HTTP_400_BAD_REQUEST)

        if Usuario.objects.filter(username=str(dados['username']).strip()).exists():
            return Response({'erro': 'Nome de usuário já existe.'}, status=status.HTTP_400_BAD_REQUEST)

        if Usuario.objects.filter(cpf=str(dados['cpf']).strip()).exists():
            return Response({'erro': 'CPF já cadastrado.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            usuario = Usuario.objects.create_user(
                username=str(dados['username']).strip(),
                password=str(dados['password']).strip(),
                first_name=str(dados['first_name']).strip(),
                last_name=str(dados['last_name']).strip(),
                email=str(dados['email']).strip(),
                cpf=str(dados['cpf']).strip(),
            )
            perfil = PerfilPassageiro.objects.create(
                usuario=usuario,
                instituicao_id=dados['instituicao'],
                comprovante_matricula=request.FILES.get('comprovante_matricula', ''),
                matricula_valida=False,
            )

        return Response({
            'usuario': UsuarioSerializer(usuario).data,
            'perfilPassageiroId': perfil.id,
        }, status=status.HTTP_201_CREATED)
