from django.db import models

class Planejamento(models.Model):
    data = models.DateTimeField()

    def __str__(self):
        return f"Planejamento {self.id} - {self.data}"