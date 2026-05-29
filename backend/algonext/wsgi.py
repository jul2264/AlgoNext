"""
WSGI config for algonext project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'algonext.settings')

application = get_wsgi_application()

# Run migrations automatically on startup to ensure PostgreSQL schema is in sync
try:
    from django.core.management import call_command
    import sys
    print("Running database migrations on WSGI startup...", file=sys.stdout)
    call_command('migrate', interactive=False)
    print("Database migrations applied successfully!", file=sys.stdout)
except Exception as e:
    import sys
    print(f"Error running auto-migration on WSGI startup: {e}", file=sys.stderr)
