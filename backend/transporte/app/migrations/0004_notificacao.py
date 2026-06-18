from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_alocacaoveiculo_unique_motorista_planejamento'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notificacao',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=100)),
                ('mensagem', models.TextField()),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
                ('lida', models.BooleanField(default=False)),
            ],
            options={
                'ordering': ['-criado_em'],
            },
        ),
    ]
