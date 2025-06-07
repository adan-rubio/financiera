# backend/app/database.py
import psycopg2
from psycopg2.extras import RealDictCursor
from os import environ

def get_db():
    conn = psycopg2.connect(
        dbname=environ.get("DB_NAME", "financiera"),
        user=environ.get("DB_USER", "postgres"),
        password=environ.get("DB_PASSWORD", "secret"),
        host=environ.get("DB_HOST", "db"),
        port=environ.get("DB_PORT", "5432")
    )
    return conn