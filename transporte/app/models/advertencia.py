from django.db import models
from .confirmacao import Confirmacao

class Advertencia(models.Model):
    id = models.AutoField(primary_key=True)
    confirmacao = models.ForeignKey(Confirmacao, on_delete=models.CASCADE)
    descricao = models.TextField(max_length=200)
    data = models.DateField()
