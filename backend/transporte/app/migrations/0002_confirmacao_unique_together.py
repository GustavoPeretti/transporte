from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='confirmacao',
            unique_together={('passageiro', 'planejamento')},
        ),
    ]
