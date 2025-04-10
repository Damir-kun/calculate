import os
from dotenv import load_dotenv
from typing import List

# Загрузка переменных окружения из .env файла
load_dotenv()

# JWT settings
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 3600

# Database settings
DB_NAME = os.getenv("DB_NAME", "db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

# Email settings
EMAIL_SENDER = os.getenv("EMAIL_SENDER", "project_404@mail.ru")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "jUxdtwMhVRtFxid4VirS")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.mail.ru") 
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))                                                                                                                          

# CORS settings
CORS_ORIGINS_STR = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:8001,http://localhost:8000")
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_STR.split(",")]

# API settings
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8001"))
API_RELOAD = os.getenv("API_RELOAD", "True").lower() == "true"
API_VERSION = os.getenv("API_VERSION", "v1")

# Logging settings
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Role IDs
ADMIN_ROLE = 1
MANAGER_ROLE = 2
CLIENT_ROLE = 3

# Database connection string for asyncpg
DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Database config for asyncpg
DB_CONFIG = {
    "database": DB_NAME,
    "user": DB_USER,
    "password": DB_PASSWORD,
    "host": DB_HOST,
    "port": DB_PORT
}

# Email config
EMAIL_CONFIG = {
    "sender_email": EMAIL_SENDER,
    "password": EMAIL_PASSWORD,
    "smtp_server": SMTP_SERVER,
    "smtp_port": SMTP_PORT
} 