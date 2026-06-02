from django.db import models
from .usuario import Usuario
from .instituicao import Instituicao

class PerfilPassageiro(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    cpf = models.CharField(max_length=11)
    nome = models.CharField(max_length=255)
    instituicao = models.ForeignKey(Instituicao, on_delete=models.CASCADE)
    comprovante_matricula = models.CharField(max_length=255)

    def __str__(self):
        return self.nome
