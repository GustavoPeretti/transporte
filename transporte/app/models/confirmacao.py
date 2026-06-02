from django.db import models
from .usuario import Usuario

class Confirmacao(models.Model):
    id = models.AutoField(primary_key=True)
    passageiro = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    data = models.DateField()
    ida = models.BooleanField()
    retorno = models.BooleanField()
    presenca_ida = models.BooleanField()
    presenca_retorno = models.BooleanField()
    ultima_atualizacao = models.DateTimeField()
