#!/usr/bin/bash

set -e

python manage.py collectstatic --noinput
python manage.py migrate --noinput

exec gunicorn --bind 0.0.0.0:8000 --workers=3 transporte.wsgi:application
