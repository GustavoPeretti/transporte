from django.db import models

class Planejamento(models.Model):
    id = models.AutoField(primary_key=True)
    data = models.DateField()

    def __str__(self):
        return f"Planejamento {self.id} - {self.data}"
    
class Meta:
    verbose_name = "Planejamento"
    verbose_name_plural = "Planejamentos"
    