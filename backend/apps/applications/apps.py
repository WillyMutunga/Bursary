from django.apps import AppConfig

class ApplicationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.applications'

    def ready(self):
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("ALTER TABLE applications_bursarybudget ADD COLUMN IF NOT EXISTS is_window_open BOOLEAN DEFAULT TRUE;")
        except Exception:
            pass
