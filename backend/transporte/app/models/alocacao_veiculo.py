from django.db import models
from .planejamento import Planejamento
from .perfil_motorista import PerfilMotorista
from .veiculo import Veiculo

class AlocacaoVeiculo(models.Model):
    planejamento = models.ForeignKey(Planejamento, on_delete=models.CASCADE, related_name="alocacoes_veiculo")
    motorista = models.ForeignKey(PerfilMotorista, on_delete=models.CASCADE)
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE)
    embarque = models.TimeField()

    class Meta:
        unique_together = [('motorista', 'planejamento')]

    def __str__(self):
        return f"{self.veiculo} - {self.planejamento}"
    