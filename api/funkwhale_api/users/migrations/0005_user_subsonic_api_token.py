# Generated by Django 2.0.3 on 2018-05-08 09:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("users", "0004_user_privacy_level")]

    operations = [
        migrations.AddField(
            model_name="user",
            name="subsonic_api_token",
            field=models.CharField(blank=True, max_length=255, null=True),
        )
    ]
