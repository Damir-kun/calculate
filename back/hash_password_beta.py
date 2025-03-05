import bcrypt
import psycopg2  # Пакет для работы с PostgreSQL

# Хеширование пароля
# Пользовательский пароль, который необходимо захешировать
password = "your_password_here"
# Хеширование пароля с использованием bcrypt
hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())


# Проверка пароля
password_check = "your_password_here"  # Это тот пароль, который вводит пользователь
if bcrypt.checkpw(password_check.encode('utf-8'), hashed_password):
    print("Пароль верный")
else:
    print("Пароль неверный")

# Преобразуем байты в строку для вставки в базу данных
# bcrypt возвращает байтовую строку, которая должна быть преобразована в строку для базы данных
hashed_password_str = hashed_password.decode('utf-8')

# Установление соединения с PostgreSQL
# Замените параметры на свои (данные для подключения к базе данных)
conn = psycopg2.connect(
    dbname="db",  # Имя базы данных
    user="postgres",  # Ваш пользователь PostgreSQL
    password="root",  # Ваш пароль для пользователя
    host="localhost",  # Хост, на котором запущена база данных (например, localhost)
    port="5432"  # Порт, на котором работает база данных (по умолчанию 5432)
)

# Создание курсора для выполнения SQL-запросов
cursor = conn.cursor()

# SQL запрос для вставки данных в таблицу users
# Здесь используется параметризированный запрос, чтобы избежать SQL-инъекций
insert_query = """
INSERT INTO users (last_name, first_name, phone, email, password, login)
VALUES (%s, %s, %s, %s, %s, %s);
"""

# Данные для вставки
# Здесь указываются все данные пользователя, включая хешированный пароль
user_data = ('Иваноу', 'Иван', '5252525252', 'ivanov3@example.com', hashed_password_str, 'ivanov3')

# Выполнение запроса с передачей данных
cursor.execute(insert_query, user_data)

# Подтверждение изменений в базе данных
# Необходимо подтвердить транзакцию, чтобы изменения были сохранены
conn.commit()

# Закрытие соединения с базой данных
cursor.close()  # Закрытие курсора
conn.close()  # Закрытие соединения

# Вывод сообщения о успешном добавлении пользователя
print("Пользователь успешно добавлен с хешированным паролем.")
