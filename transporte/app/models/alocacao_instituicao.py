from django.db import models
from .alocacao_veiculo import AlocacaoVeiculo
from .instituicao import Instituicao

class AlocacaoInstituicao(models.Model):
    alocacao_veiculo = models.ForeignKey(AlocacaoVeiculo, on_delete=models.CASCADE, related_name="alocacoes_instituicao")
    instituicao = models.ForeignKey(Instituicao, on_delete=models.CASCADE, related_name="alocacoes")

    def __str__(self):
        return f"AlocacaoInstituicao {self.id}"