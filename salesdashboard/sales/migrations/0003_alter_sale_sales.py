# Generated by Django 5.1.6 on 2025-03-02 20:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0002_profile'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sale',
            name='sales',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
    ]
