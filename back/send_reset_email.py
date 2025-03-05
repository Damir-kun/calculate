import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Функция для отправки email с токеном сброса пароля через Mail.ru
def send_reset_email(user_email, reset_token):
    sender_email = "project_404@mail.ru"  # Замените на свою почту Mail.ru
    password = "xwxGRBEfdkNYgYffLdri"  # Замените на свой SMTP-пароль (не обычный!)

    receiver_email = user_email  # Email пользователя

    # Тема и тело письма
    subject = "Сброс пароля"
    body = f"Для сброса пароля используйте следующий код: {reset_token}"

    # Создаем email-сообщение
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    # Отправка email через SMTP сервер Mail.ru
    try:
        with smtplib.SMTP_SSL('smtp.mail.ru', 465) as server:  # Используем SSL и порт 465
            server.login(sender_email, password)  # Авторизация на сервере
            server.sendmail(sender_email, receiver_email, msg.as_string())  # Отправка письма
        print(f"Email с токеном отправлен на {receiver_email}")
    except Exception as e:
        print(f"Ошибка при отправке email: {e}")

# Пример вызова функции
send_reset_email("Eg_234@mail.ru", "123456")  # Замените email и токен
