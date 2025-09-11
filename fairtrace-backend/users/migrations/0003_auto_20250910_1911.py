
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_auto_20250910_1836'),
    ]

    operations = [
        migrations.AddField(
            model_name='otptoken',
            name='code',
            field=models.CharField(max_length=6, default='000000'),
            preserve_default=False,
        ),
    ]
