from django.db import models

class Instituicao(models.Model):
    nome = models.CharField(max_length=255)
    horario_inicio = models.TimeField()
    horario_fim = models.TimeField()

    def __str__(self):
        return self.nome