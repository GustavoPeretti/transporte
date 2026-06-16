from django.db import models
from ..enums.tipo_veiculo import TipoVeiculoEnum

class Veiculo(models.Model):
    placa = models.CharField(max_length=10, unique=True)
    capacidade = models.IntegerField()
    modelo = models.CharField(max_length=50)
    tipo = models.CharField(max_length=20, choices=TipoVeiculoEnum.choices, default=TipoVeiculoEnum.ONIBUS)
    
    def __str__(self):
        return f'{self.tipo.title()} - {self.modelo} - {self.placa}'
