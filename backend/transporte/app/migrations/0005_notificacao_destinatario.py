from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0004_notificacao'),
    ]

    operations = [
        migrations.AddField(
            model_name='notificacao',
            name='destinatario',
            field=models.CharField(
                choices=[
                    ('admin', 'Administrador'),
                    ('motorista', 'Motorista'),
                    ('passageiro', 'Passageiro'),
                    ('todos', 'Todos'),
                ],
                default='todos',
                max_length=20,
            ),
        ),
    ]
