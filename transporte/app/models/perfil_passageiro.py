from django.db import models

class PerfilPassageiro(models.Model):
    usuario_id = models.IntegerField()
    cpf = models.CharField(max_length=11)
    nome = models.CharField(max_length=255)
    instituicao_id = models.IntegerField()
    comprovante_matricula = models.CharField(max_length=255)

    def __str__(self):
        return self.nome