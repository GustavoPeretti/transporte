from django.db import models

class TipoVeiculoEnum(models.TextChoices):
    ONIBUS = 'ONIBUS', 'Ônibus'
    VAN = 'VAN', 'Van'
    MICROONIBUS = 'MICROONIBUS', 'Microônibus'