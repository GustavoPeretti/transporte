from django.db import models


class Notificacao(models.Model):
    class Destinatario(models.TextChoices):
        ADMIN      = 'admin',      'Administrador'
        MOTORISTA  = 'motorista',  'Motorista'
        PASSAGEIRO = 'passageiro', 'Passageiro'
        TODOS      = 'todos',      'Todos'

    titulo       = models.CharField(max_length=100)
    mensagem     = models.TextField()
    destinatario = models.CharField(max_length=20, choices=Destinatario.choices, default=Destinatario.TODOS)
    criado_em    = models.DateTimeField(auto_now_add=True)
    lida         = models.BooleanField(default=False)

    class Meta:
        ordering = ['-criado_em']

    def __str__(self):
        return self.titulo
