import bcrypt
import psycopg2
import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# 📌 Подключение к базе данных PostgreSQL
def get_db_connection():
    return psycopg2.connect(
        dbname="db",       # Имя базы данных
        user="postgres",   # Логин пользователя
        password="root",   # Пароль пользователя
        host="localhost",  # Хост базы данных
        port="5432"        # Порт базы данных
    )

# 📌 Функция генерации 6-значного токена для сброса пароля
def generate_reset_token():
    return str(random.randint(100000, 999999))

def send_reset_email(user_email, reset_token):
    sender_email = "project_404@mail.ru"
    password = "jUxdtwMhVRtFxid4VirS "  # Замени на пароль приложения!
    smtp_server = "smtp.mail.ru"
    smtp_port = 587  # Почта Mail.ru требует 587 для TLS

    subject = "Сброс пароля"
    body = f"Ваш код для сброса пароля: {reset_token}"

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = user_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        # Подключаемся к серверу с TLS
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Включаем шифрование
        server.login(sender_email, password)  # Логинимся
        server.sendmail(sender_email, user_email, msg.as_string())  # Отправляем письмо
        server.quit()  # Закрываем соединение

        print(f"✅ Email с токеном успешно отправлен на {user_email}")
    except Exception as e:
        print(f"❌ Ошибка при отправке email: {e}")



# 📌 Функция обработки сброса пароля
def reset_password(email, input_token, new_password):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 📌 Получение токена сброса из базы данных
    cursor.execute("SELECT password_reset_token FROM users WHERE email = %s", (email,))
    result = cursor.fetchone()
    
    if not result:
        print("❌ Пользователь не найден")
        return False
    
    stored_token = result[0]
    
    # 📌 Проверка введенного токена
    if stored_token != input_token:
        print("❌ Неверный токен")
        return False
    
    # 📌 Хеширование нового пароля перед сохранением в БД
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # 📌 Обновление пароля в базе данных
    cursor.execute("UPDATE users SET password = %s WHERE email = %s", (hashed_password, email))
    conn.commit()
    
    # 📌 Закрытие соединения с БД
    cursor.close()
    conn.close()
    
    print("✅ Пароль успешно сброшен")
    return True

# 📌 Функция обработки запроса на сброс пароля
def request_password_reset(email):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 📌 Проверяем, существует ли пользователь с таким email
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    
    if not user:
        print("❌ Email не найден")
        return False
    
    # 📌 Генерация и сохранение токена в БД
    reset_token = generate_reset_token()
    cursor.execute("UPDATE users SET password_reset_token = %s WHERE email = %s", (reset_token, email))
    conn.commit()
    
    # 📌 Закрытие соединения с БД
    cursor.close()
    conn.close()
    
    # 📌 Отправка email с токеном сброса пароля
    send_reset_email(email, reset_token)
    return True

# 📌 Основной блок выполнения программы (симуляция процесса восстановления пароля)
if __name__ == "__main__":
    user_email = "Eg_234@mail.ru"  # Почта пользователя для сброса пароля
    
    # 📌 1. Пользователь нажимает "Забыли пароль?" — отправляем токен на email
    request_password_reset(user_email)
    
    # 📌 2. Пользователь вводит полученный токен и новый пароль
    input_token = input("Введите полученный токен: ")
    new_password = input("Введите новый пароль: ")
    
    # 📌 3. Проверяем токен и сбрасываем пароль
    reset_password(user_email, input_token, new_password)
