from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_confirmacao_unique_together'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='alocacaoveiculo',
            unique_together={('motorista', 'planejamento')},
        ),
    ]
