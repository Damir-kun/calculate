# Примеры запросов к API

## Аутентификация

### Регистрация

```javascript
// Регистрация нового пользователя
fetch('http://localhost:8001/api/v1/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    last_name: 'Иванов',
    first_name: 'Иван',
    phone: '+7 (999) 123-45-67',
    email: 'ivanov@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Вход

```javascript
// Вход в систему
fetch('http://localhost:8001/api/v1/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'ivanov@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => {
  console.log(data);
  // Сохраняем токен
  localStorage.setItem('token', data.token);
});
```

## Расчеты

### Сохранение результатов расчета

```javascript
// Сохранение результатов расчета фундамента
fetch('http://localhost:8001/api/v1/calculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    calc_type: 'foundation',
    params: {
      length: 10,
      width: 5,
      depth: 2
    },
    result: {
      volume: 100,
      cost: 240000,
      materials: [
        { name: 'Бетон М300', quantity: 100, unit: 'м³', cost: 240000 }
      ],
      total_cost: 240000
    },
    address: 'ул. Примерная, д. 1',
    title: 'Расчет фундамента для частного дома'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Получение истории расчетов

```javascript
// Получение истории расчетов
fetch('http://localhost:8001/api/v1/history', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Добавление в закладки

```javascript
// Добавление расчета в закладки
fetch('http://localhost:8001/api/v1/bookmark', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    calculation_id: 1
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Материалы

### Обновление цены материала

```javascript
// Обновление цены материала
fetch('http://localhost:8001/api/v1/manager/update_material_price', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    material_name: 'Бетон М300',
    new_selling_price: 3500.0
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Добавление материала

```javascript
// Добавление нового материала
fetch('http://localhost:8001/api/v1/materials/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    name: 'Кирпич облицовочный',
    description: 'Кирпич облицовочный красный, 250x120x65 мм'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Обработка ошибок

```javascript
// Пример обработки ошибок
fetch('http://localhost:8001/api/v1/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'wrong@example.com',
    password: 'wrongpassword'
  })
})
.then(response => {
  if (!response.ok) {
    return response.json().then(err => {
      throw new Error(err.detail || 'Произошла ошибка');
    });
  }
  return response.json();
})
.then(data => console.log(data))
.catch(error => console.error('Ошибка:', error.message));
``` 