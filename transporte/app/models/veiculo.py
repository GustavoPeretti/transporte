from django.db import models
from app.enums.tipo_veiculo import TipoVeiculoEnum


class Veiculo(models.Model):
    id = models.AutoField(primary_key=True)
    placa = models.CharField(max_length=10, unique=True)
    capacidade = models.IntegerField()
    modelo = models.CharField(max_length=50)
    tipo = models.CharField(max_length=20, choices=TipoVeiculoEnum.choices, default=TipoVeiculoEnum.ONIBUS)
    