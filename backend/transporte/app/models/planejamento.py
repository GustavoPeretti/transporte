from django.db import models

class Planejamento(models.Model):
    data = models.DateField()
    aberto = models.BooleanField(default=True)

    def __str__(self):
        return self.data.strftime('%Y-%m-%d')
