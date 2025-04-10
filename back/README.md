# Construction Calculator API

API для расчета строительных конструкций с различными типами пользователей (администраторы, менеджеры, клиенты).

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd <repository-directory>
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Создайте файл `.env` в корневой директории проекта со следующими переменными:
```
JWT_SECRET=your_jwt_secret_key
DB_NAME=db
DB_USER=postgres
DB_PASSWORD=root
DB_HOST=localhost
DB_PORT=5432
EMAIL_SENDER=your_email@example.com
EMAIL_PASSWORD=your_email_password
SMTP_SERVER=smtp.example.com
SMTP_PORT=587
CORS_ORIGINS=http://localhost:3000
```

## Запуск

1. Запустите сервер:
```bash
python main.py
```

2. API будет доступно по адресу: http://localhost:8001

## Документация API

После запуска сервера, документация API доступна по следующим адресам:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## Основные функции

- Регистрация и аутентификация пользователей
- Расчет строительных конструкций
- Управление материалами и ценами
- История расчетов и закладки
- Управление пользователями и ролями

## Безопасность

- JWT аутентификация
- Хеширование паролей
- CORS защита
- Разграничение доступа по ролям 