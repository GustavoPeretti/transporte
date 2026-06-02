from django.contrib.auth.models import AbstractUser
from django.db import models
from ..enums.papel import PapelEnum

class Usuario(AbstractUser):
    papel = models.CharField(max_length=25, choices=PapelEnum.choices)
