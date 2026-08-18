import sys, os

# Force Phusion Passenger WSGI reload
# Timestamp: 2026-08-18 10:12:40

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

from backend.wsgi import application
