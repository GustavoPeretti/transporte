from django.db import models
from .perfil_passageiro import PerfilPassageiro
from .planejamento import Planejamento

class Confirmacao(models.Model):
    passageiro = models.ForeignKey(PerfilPassageiro, on_delete=models.CASCADE)
    planejamento = models.ForeignKey(Planejamento, on_delete=models.CASCADE)
    ida = models.BooleanField()
    retorno = models.BooleanField()
    presenca_ida = models.BooleanField()
    presenca_retorno = models.BooleanField()
    ultima_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.passageiro} - {self.data}'