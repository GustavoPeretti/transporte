from django.db import models
from app.models import Veiculo, Planejamento, Instituicao

class PerfilMotorista(models.Model):
    usuario_id = models.AutoField(primary_key=True)
    cpf = models.CharField(max_length=14, unique=True)
    nome = models.CharField(max_length=255)
    habilitacao = models.CharField(max_length=20)
    