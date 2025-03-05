import bcrypt
import psycopg2

# Функция для сброса пароля с использованием токена
def reset_password(token, new_password):
    # Установление соединения с базой данных
    conn = psycopg2.connect(
        dbname="db",  # Имя базы данных
        user="postgres",  # Ваш пользователь PostgreSQL
        password="root",  # Ваш пароль для пользователя
        host="localhost",  # Хост, на котором запущена база данных (например, localhost)
        port="5432"  # Порт, на котором работает база данных (по умолчанию 5432)
    )
    cursor = conn.cursor()

    # Проверка существования токена в базе данных
    select_query = """
    SELECT id, password_reset_token 
    FROM users
    WHERE password_reset_token = %s;
    """
    cursor.execute(select_query, (token,))
    user = cursor.fetchone()  # Извлекаем данные о пользователе по токену

    # Если токен найден, сбрасываем пароль
    if user:
        # Хешируем новый пароль с использованием bcrypt
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Обновление пароля и очистка токена сброса
        update_query = """
        UPDATE users
        SET password = %s, password_reset_token = NULL
        WHERE id = %s;
        """
        cursor.execute(update_query, (hashed_password, user[0]))
        conn.commit()  # Сохраняем изменения в базе данных
        print("Пароль успешно обновлен")
    else:
        print("Неверный токен")  # Если токен не найден

    # Закрытие соединения с базой данных
    cursor.close()
    conn.close()

# Пример вызова функции с токеном и новым паролем
reset_password("123456", "newpassword123")  # Замените на введенные пользователем данные
