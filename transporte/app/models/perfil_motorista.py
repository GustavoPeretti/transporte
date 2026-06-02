from django.db import models

class PerfilMotorista(models.Model):
    usuario_id = models.AutoField(primary_key=True)
    cpf = models.CharField(max_length=14, unique=True)
    nome = models.CharField(max_length=255)
    habilitacao = models.CharField(max_length=20)
    