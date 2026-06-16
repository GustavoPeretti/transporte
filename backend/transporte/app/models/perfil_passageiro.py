from django.db import models
from .usuario import Usuario
from .instituicao import Instituicao

class PerfilPassageiro(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    instituicao = models.ForeignKey(Instituicao, on_delete=models.CASCADE)
    comprovante_matricula = models.FileField()
    matricula_valida = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.usuario.first_name} {self.usuario.last_name}'
