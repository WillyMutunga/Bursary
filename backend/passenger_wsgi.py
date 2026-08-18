import sys, os

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

try:
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("ALTER TABLE applications_bursarybudget ADD COLUMN IF NOT EXISTS is_window_open BOOLEAN DEFAULT TRUE;")
except Exception as e:
    print("Passenger ALTER TABLE error:", e)

from backend.wsgi import application
