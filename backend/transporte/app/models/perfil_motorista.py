from django.db import models
from .usuario import Usuario

class PerfilMotorista(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    habilitacao = models.CharField(max_length=20)
    
    def __str__(self):
        return f'{self.usuario.first_name} {self.usuario.last_name}'
