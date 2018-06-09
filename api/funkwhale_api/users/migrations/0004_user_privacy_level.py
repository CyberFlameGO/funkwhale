# Generated by Django 2.0.2 on 2018-03-01 19:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("users", "0003_auto_20171226_1357")]

    operations = [
        migrations.AddField(
            model_name="user",
            name="privacy_level",
            field=models.CharField(
                choices=[
                    ("me", "Only me"),
                    ("followers", "Me and my followers"),
                    ("instance", "Everyone on my instance, and my followers"),
                    ("everyone", "Everyone, including people on other instances"),
                ],
                default="instance",
                max_length=30,
            ),
        )
    ]
