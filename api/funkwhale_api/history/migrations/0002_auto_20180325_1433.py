# Generated by Django 2.0.3 on 2018-03-25 14:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [("history", "0001_initial")]

    operations = [
        migrations.AlterModelOptions(
            name="listening", options={"ordering": ("-creation_date",)}
        ),
        migrations.RenameField(
            model_name="listening", old_name="end_date", new_name="creation_date"
        ),
    ]
