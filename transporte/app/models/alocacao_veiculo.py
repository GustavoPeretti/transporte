from django.db import models
from .planejamento import Planejamento

class AlocacaoVeiculo(models.Model):
    planejamento = models.ForeignKey(Planejamento, on_delete=models.CASCADE, related_name="alocacoes_veiculo")
    motorista_id = models.IntegerField()
    veiculo_id = models.IntegerField()

    def __str__(self):
        return f"AlocacaoVeiculo {self.id}"