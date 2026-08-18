import sys, os

# cPanel Phusion Passenger WSGI Entrypoint
# Location: /backend/passenger_wsgi.py

sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

from backend.wsgi import application
