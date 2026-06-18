from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_notificacao_destinatario'),
    ]

    operations = [
        migrations.AlterField(
            model_name='confirmacao',
            name='presenca_ida',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='confirmacao',
            name='presenca_retorno',
            field=models.BooleanField(default=False),
        ),
    ]
