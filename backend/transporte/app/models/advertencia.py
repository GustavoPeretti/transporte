from django.db import models
from .confirmacao import Confirmacao

class Advertencia(models.Model):
    confirmacao = models.ForeignKey(Confirmacao, on_delete=models.CASCADE)
    descricao = models.TextField(max_length=200)
    data = models.DateField()
    justificativa = models.TextField(max_length=500, null=True, blank=True)

    def __str__(self):
        return self.descricao
    