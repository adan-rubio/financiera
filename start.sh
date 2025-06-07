#!/bin/sh
cd /app/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port ${BACKEND_PORT} &
nginx -g 'daemon off;'