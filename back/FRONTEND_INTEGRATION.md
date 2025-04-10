# Инструкция по интеграции с Frontend

## API Endpoints

### Аутентификация

- **Регистрация**: `POST /register`
  ```json
  {
    "last_name": "string",
    "first_name": "string",
    "phone": "string",
    "email": "string",
    "password": "string"
  }
  ```

- **Вход**: `POST /login`
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

- **Сброс пароля**: `POST /request_password_reset`
  ```json
  {
    "email": "string"
  }
  ```

- **Установка нового пароля**: `POST /reset_password`
  ```json
  {
    "email": "string",
    "token": "string",
    "new_password": "string"
  }
  ```

### Расчеты

- **Создание расчета**: `POST /calculate`
  ```json
  {
    "calc_type": "foundation|frame|roof|staircase|electricity|pipeline|ventilation",
    "params": {},
    "result": {},
    "address": "string"
  }
  ```

- **История расчетов**: `GET /history`

- **Добавление в закладки**: `POST /bookmark`
  ```json
  {
    "calculation_id": 0
  }
  ```

### Материалы

- **Обновление цены материала**: `POST /manager/update_material_price`
  ```json
  {
    "material_name": "string",
    "new_selling_price": 0
  }
  ```

- **Добавление материала**: `POST /materials/add`
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```

## Аутентификация

Для аутентификации используется JWT токен. Токен должен быть включен в заголовок Authorization:

```
Authorization: Bearer <token>
```

## CORS

API настроен для работы с frontend на следующих доменах:
- http://localhost:3000
- http://localhost:5173

## Обработка ошибок

API возвращает ошибки в формате:

```json
{
  "detail": "Сообщение об ошибке"
}
```

Коды ошибок:
- 400: Неверный запрос
- 401: Не авторизован
- 403: Доступ запрещен
- 404: Ресурс не найден
- 409: Конфликт (например, email уже зарегистрирован)
- 500: Внутренняя ошибка сервера 