from django.db import models

class Instituicao(models.Model):
    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=255)
    horario_inicio = models.TimeField()
    horario_fim = models.TimeField()

    def __str__(self):
        return self.nome