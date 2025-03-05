import random
import psycopg2
from datetime import datetime

# Функция для генерации случайного 6-значного токена
def generate_reset_token():
    # Генерация случайного числа от 100000 до 999999
    return str(random.randint(100000, 999999))

# Функция для генерации токена и его сохранения в базе данных
def generate_and_save_token(email):
    # Установление соединения с PostgreSQL

    conn = psycopg2.connect(
        dbname="db",  # Имя базы данных
        user="postgres",  # Ваш пользователь PostgreSQL
        password="root",  # Ваш пароль для пользователя
        host="localhost",  # Хост, на котором запущена база данных (например, localhost)
        port="5432"  # Порт, на котором работает база данных (по умолчанию 5432)
)

    # Создание курсора для выполнения SQL-запросов
    cursor = conn.cursor()

    # Генерация нового токена
    reset_token = generate_reset_token()

    # Запрос на обновление токена сброса пароля в таблице пользователей
    update_query = """
    UPDATE users
    SET password_reset_token = %s, 
        created_at = %s
    WHERE email = %s;
    """
    
    cursor.execute(update_query, (reset_token, datetime.now(), email))

    # Подтверждение изменений в базе данных
    conn.commit()

    # Закрытие соединения
    cursor.close()
    conn.close()

    # Вывод токена для отправки на email (можно удалить, если не нужно выводить токен)
    print(f"Токен для сброса пароля: {reset_token}")

# Пример вызова функции с email пользователя
email = "ivanov@example.com"
generate_and_save_token(email)
