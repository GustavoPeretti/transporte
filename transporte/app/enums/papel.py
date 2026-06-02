from django.db import models

class PapelEnum(models.TextChoices):
    ADMINISTRADOR = 'administrador', 'ADMINISTRADOR'
    MOTORISTA = 'motorista', 'MOTORISTA'
    PASSAGEIRO = 'passageiro', 'PASSAGEIRO'
