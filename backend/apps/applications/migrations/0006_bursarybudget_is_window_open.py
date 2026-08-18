from django.db import migrations, models

def add_column_if_not_exists(apps, schema_editor):
    from django.db import connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("ALTER TABLE applications_bursarybudget ADD COLUMN IF NOT EXISTS is_window_open BOOLEAN DEFAULT TRUE;")
    except Exception:
        pass

class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0005_auditlog'),
    ]

    operations = [
        migrations.RunPython(add_column_if_not_exists, reverse_code=migrations.RunPython.noop),
        migrations.AddField(
            model_name='bursarybudget',
            name='is_window_open',
            field=models.BooleanField(default=True),
        ),
    ]
