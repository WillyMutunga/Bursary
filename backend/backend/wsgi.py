"""
WSGI config for backend project.
Reload trigger: 2026-08-18 10:01:00
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()
