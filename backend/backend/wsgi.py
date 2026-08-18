"""
WSGI config for backend project.
Reload trigger: 2026-08-18 10:16:30
"""

import os, sys, glob

# Auto-purge stale __pycache__ bytecode files on startup
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for root, dirs, files in os.walk(base_dir):
    if '__pycache__' in dirs:
        cache_dir = os.path.join(root, '__pycache__')
        try:
            for f in os.listdir(cache_dir):
                if f.endswith('.pyc'):
                    os.remove(os.path.join(cache_dir, f))
        except Exception:
            pass

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()
