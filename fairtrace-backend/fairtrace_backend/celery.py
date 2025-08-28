import os
from celery import Celery


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fairtrace_backend.settings')


app = Celery('fairtrace_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()