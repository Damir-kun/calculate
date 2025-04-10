import os
import random
import bcrypt
import asyncpg
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from typing import Optional, Dict, Any, List
import jwt
from datetime import datetime, timedelta
import json
from enum import Enum
import logging
from config import (
    JWT_SECRET, JWT_ALGORITHM, JWT_EXP_DELTA_SECONDS,
    DB_CONFIG, EMAIL_CONFIG, CORS_ORIGINS,
    ADMIN_ROLE, MANAGER_ROLE, CLIENT_ROLE,
    DATABASE_URL
)
from fastapi.responses import JSONResponse

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Версия API
API_VERSION = "v1"

app = FastAPI(
    title="Construction Calculator API",
    description="API для расчета строительных конструкций",
    version="1.0.0",
    docs_url=f"/api/{API_VERSION}/docs",
    redoc_url=f"/api/{API_VERSION}/redoc",
    openapi_url=f"/api/{API_VERSION}/openapi.json"
)

# Настройки CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Явная обработка OPTIONS запросов для всех путей
@app.options("/{path:path}")
async def options_handler(path: str):
    return {"message": "OK"}

# ------------------------------
# Подключение к базе данных
# ------------------------------
async def get_db_connection():
    try:
        conn = await asyncpg.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Ошибка подключения к базе данных: {str(e)}")
        raise HTTPException(status_code=500, detail="Ошибка подключения к базе данных")

# ------------------------------
# Модели запросов
# ------------------------------
class RegisterRequest(BaseModel):
    last_name: str
    first_name: str
    phone: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class PasswordResetRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    token: str
    new_password: str

class CalculationType(str, Enum):
    FOUNDATION = "foundation"
    FRAME = "frame"
    ROOF = "roof"
    STAIRCASE = "staircase"
    ELECTRICITY = "electricity"
    PIPELINE = "pipeline"
    VENTILATION = "ventilation"

class CalculationRequest(BaseModel):
    calc_type: CalculationType
    params: Dict[str, Any]
    result: Dict[str, Any]
    address: Optional[str] = None
    title: Optional[str] = None

class BookmarkRequest(BaseModel):
    calculation_id: int

class AssignManagerRequest(BaseModel):
    user_id: int

class UpdateMaterialPriceRequest(BaseModel):
    material_name: str
    new_selling_price: float

class AddMaterialRequest(BaseModel):
    name: str
    description: Optional[str] = None

# ------------------------------
# JWT-реализация
# ------------------------------
def create_jwt(user_id: int, role: int) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(seconds=JWT_EXP_DELTA_SECONDS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def decode_jwt(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if authorization is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        scheme, token = authorization.split()
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid auth header")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid auth scheme")
    return decode_jwt(token)

# ------------------------------
# Функции для работы с ролями
# ------------------------------
async def assign_role(conn, user_id: int, role_id: int):
    try:
        await conn.execute("""
            INSERT INTO users_roles (user_id, role_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, role_id) DO NOTHING;
        """, user_id, role_id)
    except Exception as e:
        logger.error(f"Ошибка при назначении роли: {str(e)}")
        raise

async def get_user_role(conn, user_id: int) -> int:
    """
    Возвращает роль пользователя. Если роль не установлена, возвращается роль клиента по умолчанию.
    """
    try:
        role = await conn.fetchval(
            "SELECT role_id FROM users_roles WHERE user_id = $1 LIMIT 1;",
            user_id
        )
        return role if role else CLIENT_ROLE
    except Exception as e:
        logger.error(f"Ошибка при получении роли: {str(e)}")
        return CLIENT_ROLE

# ------------------------------
# Вспомогательные функции
# ------------------------------
def generate_reset_token():
    return str(random.randint(100000, 999999))

async def send_email(recipient: str, subject: str, body: str):
    """
    Отправляет email с использованием настроек из конфигурации.
    """
    msg = MIMEMultipart()
    msg["From"] = EMAIL_CONFIG["sender_email"]
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))
    
    try:
        async with aiosmtplib.SMTP(
            hostname=EMAIL_CONFIG["smtp_server"],
            port=EMAIL_CONFIG["smtp_port"],
            use_tls=True
        ) as smtp:
            await smtp.login(EMAIL_CONFIG["sender_email"], EMAIL_CONFIG["password"])
            await smtp.send_message(msg)
        logger.info(f"Email успешно отправлен на {recipient}")
    except Exception as e:
        logger.error(f"Ошибка отправки email: {str(e)}")
        raise HTTPException(status_code=500, detail="Ошибка отправки email")

async def get_material_cost(conn, material_name: str) -> float:
    """
    Возвращает последнюю цену материала из БД.
    """
    try:
        price = await conn.fetchval("""
            SELECT pl.selling_price
            FROM price_lists pl
            JOIN material_characteristics mc ON pl.material_characteristics_id = mc.id
            JOIN materials m ON mc.materials_id = m.id
            WHERE m.name = $1
            ORDER BY pl.date DESC
            LIMIT 1;
        """, material_name)
        return float(price) if price else 2400.0
    except Exception as e:
        logger.error(f"Error fetching material cost: {e}")
        return 2400.0

# ------------------------------
# Эндпоинты для регистрации и авторизации
# ------------------------------
@app.post(f"/api/{API_VERSION}/register")
async def register(data: RegisterRequest):
    conn = await get_db_connection()
    try:
        async with conn.transaction():
            # Проверка уникальности email
            exists = await conn.fetchval(
                "SELECT id FROM users WHERE email = $1;",
                data.email
            )
            if exists:
                raise HTTPException(status_code=409, detail="Email уже зарегистрирован")

            # Хеширование пароля
            hashed_password = bcrypt.hashpw(
                data.password.encode('utf-8'),
                bcrypt.gensalt()
            ).decode('utf-8')

            # Создание пользователя
            user_id = await conn.fetchval("""
                INSERT INTO users (login, password, first_name, last_name, email)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id;
            """, data.email, hashed_password, data.first_name, data.last_name, data.email)

            # Создание клиента
            full_name = f"{data.last_name} {data.first_name}"
            await conn.execute("""
                INSERT INTO customers (user_id, full_name, phone)
                VALUES ($1, $2, $3);
            """, user_id, full_name, data.phone)

            # Назначение роли
            await assign_role(conn, user_id, CLIENT_ROLE)
            
            return {"message": "Регистрация успешна", "user_id": user_id}
    
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка регистрации: {str(e)}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")
    finally:
        await conn.close()

@app.post(f"/api/{API_VERSION}/login")
async def login(data: LoginRequest):
    conn = await get_db_connection()
    try:
        user = await conn.fetchrow(
            "SELECT id, password FROM users WHERE email = $1",
            data.email
        )
        
        if user and bcrypt.checkpw(
            data.password.encode('utf-8'),
            user['password'].encode('utf-8')
        ):
            role = await get_user_role(conn, user['id'])
            token = create_jwt(user['id'], role)
            return {"message": "Login successful", "token": token}
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    finally:
        await conn.close()

@app.post(f"/api/{API_VERSION}/request_password_reset")
async def request_password_reset(data: PasswordResetRequest):
    conn = await get_db_connection()
    try:
        user = await conn.fetchrow(
            "SELECT id FROM users WHERE email = $1",
            data.email
        )
        if not user:
            raise HTTPException(status_code=404, detail="Email not found")
            
        reset_token = generate_reset_token()
        await conn.execute(
            "UPDATE users SET password_reset_token = $1 WHERE email = $2",
            reset_token, data.email
        )
        
        await send_email(
            data.email,
            "Password Reset",
            f"Your reset token is: {reset_token}"
        )
        return {"message": "Reset token sent"}
    finally:
        await conn.close()

@app.post(f"/api/{API_VERSION}/reset_password")
async def reset_password(data: ResetPasswordRequest):
    conn = await get_db_connection()
    try:
        token = await conn.fetchval(
            "SELECT password_reset_token FROM users WHERE email = $1",
            data.email
        )
        if not token or token != data.token:
            raise HTTPException(status_code=400, detail="Invalid token")
            
        hashed_password = bcrypt.hashpw(
            data.new_password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')
        
        await conn.execute("""
            UPDATE users 
            SET password = $1, password_reset_token = NULL 
            WHERE email = $2
        """, hashed_password, data.email)
        
        return {"message": "Password reset successful"}
    finally:
        await conn.close()

# ------------------------------
# Эндпоинты сохранения расчётов
# ------------------------------
@app.post(f"/api/{API_VERSION}/calculate")
async def calculate(calc: CalculationRequest, user_data: dict = Depends(get_current_user)):
    """
    Сохраняет результаты расчета, выполненные на frontend.
    """
    logger.info(f"Получен запрос на сохранение расчета: {calc}")
    user_id = user_data["user_id"]
    conn = await get_db_connection()
    try:
        # Получаем customer_id
        customer = await conn.fetchrow(
            "SELECT id FROM customers WHERE user_id = $1",
            user_id
        )
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        customer_id = customer['id']

        # Подготовка данных
        input_data = json.dumps(calc.params, ensure_ascii=False)
        result_data = json.dumps(calc.result, ensure_ascii=False)
        print(input_data)
        print(result_data)
        # Выполняем запрос
        calculation_id = await conn.fetchval("""
            INSERT INTO calculations (
                customer_id,
                calculation_type,
                title,
                input_data,
                results,
                state_id
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id;
        """, customer_id, calc.calc_type, calc.title or f"Расчет {calc.calc_type}",
            input_data, result_data, 1)
        
        return {
            "message": "Расчёт успешно сохранён",
            "calculation_id": calculation_id,
            "calc_type": calc.calc_type
        }

    except Exception as e:
        logger.error(f"Ошибка при сохранении расчета: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при сохранении расчета: {str(e)}"
        )
    finally:
        await conn.close()

# ------------------------------
# Эндпоинты истории и закладок
# ------------------------------
@app.get(f"/api/{API_VERSION}/history")
async def history(user_data: dict = Depends(get_current_user)):
    user_id = user_data["user_id"]
    conn = await get_db_connection()
    try:
        rows = await conn.fetch("""
            SELECT id, title, calculation_type, input_data, results, created_at
            FROM calculations
            WHERE customer_id = (SELECT id FROM customers WHERE user_id = $1)
            ORDER BY created_at DESC
        """, user_id)

        history = []
        for row in rows:
            history.append({
                "id": row['id'],
                "title": row['title'],
                "type": row['calculation_type'],
                "input": row['input_data'],
                "result": row['results'] if row['results'] else {},
                "date": row['created_at'].isoformat()
            })
            
        return {"history": history}
    finally:
        await conn.close()

@app.get(f"/api/{API_VERSION}/")
async def read_root():
    return {"message": "Welcome to the calc application!"}
    
@app.post(f"/api/{API_VERSION}/bookmark")
async def bookmark(data: BookmarkRequest, user_data: dict = Depends(get_current_user)):
    """
    Добавляет расчет в закладки пользователя.
    """
    user_id = user_data["user_id"]
    conn = await get_db_connection()
    try:
        customer = await conn.fetchrow(
            "SELECT id FROM customers WHERE user_id = $1",
            user_id
        )
        if not customer:
            raise HTTPException(status_code=404, detail="Customer record not found")
            
        await conn.execute("""
            INSERT INTO saved_calculations (customer_id, calculation_id)
            VALUES ($1, $2)
            ON CONFLICT (customer_id, calculation_id) DO NOTHING;
        """, customer['id'], data.calculation_id)
        
        return {"message": "Расчёт добавлен в закладки"}
    finally:
        await conn.close()

# ------------------------------
# Эндпоинты для менеджера и администратора
# ------------------------------
@app.get(f"/api/{API_VERSION}/manager/calculations")
async def manager_calculations(user_data: dict = Depends(get_current_user)):
    """
    Возвращает список всех расчётов для менеджеров и администраторов.
    """
    user_role = user_data.get("role", CLIENT_ROLE)
    if user_role not in (MANAGER_ROLE, ADMIN_ROLE):
        raise HTTPException(
            status_code=403,
            detail="Недостаточно прав для доступа к данным всех пользователей"
        )
        
    conn = await get_db_connection()
    try:
        # Запрос из общей таблицы calculations
        records_general = await conn.fetch("""
            SELECT id, number, address_object_construction, created_date, 
                   total_cost, calc_type, params, result 
            FROM calculations
        """)
        
        # Запрос для расчётов фундамента
        records_foundation = await conn.fetch("""
            SELECT id, number, address_object_construction, created_date, 
                   total_cost, 'foundation' as calc_type, params, result 
            FROM foundation_calculations
        """)
        
        # Запрос для расчётов каркаса
        records_frame = await conn.fetch("""
            SELECT id, number, address_object_construction, created_date, 
                   total_cost, 'frame' as calc_type, params, result 
            FROM frame_calculations
        """)
        
        all_records = records_general + records_foundation + records_frame
        
        calc_list = []
        for rec in all_records:
            calc_list.append({
                "calculation_id": rec['id'],
                "number": rec['number'],
                "address": rec['address_object_construction'],
                "created_date": rec['created_date'].isoformat(),
                "total_cost": rec['total_cost'],
                "calc_type": rec['calc_type'],
                "params": rec['params'],
                "result": rec['result']
            })
            
        # Сортировка по дате
        calc_list.sort(key=lambda x: x["created_date"], reverse=True)
        return {"calculations": calc_list}
    finally:
        await conn.close()

@app.post(f"/api/{API_VERSION}/assign_manager")
async def assign_manager(data: AssignManagerRequest, user_data: dict = Depends(get_current_user)):
    """
    Назначает пользователя менеджером.
    Доступно только администратору.
    """
    user_role = user_data.get("role", CLIENT_ROLE)
    if user_role != ADMIN_ROLE:
        raise HTTPException(
            status_code=403,
            detail="Только администратор может назначать менеджеров"
        )
        
    conn = await get_db_connection()
    try:
        await assign_role(conn, data.user_id, MANAGER_ROLE)
        return {"message": f"Пользователю с id {data.user_id} назначена роль менеджера"}
    finally:
        await conn.close()

@app.post(f"/api/{API_VERSION}/manager/update_material_price")
async def update_material_price(
    data: UpdateMaterialPriceRequest,
    user_data: dict = Depends(get_current_user)
):
    user_role = user_data.get("role", CLIENT_ROLE)
    if user_role not in (MANAGER_ROLE, ADMIN_ROLE):
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    conn = await get_db_connection()
    try:
        async with conn.transaction():
            # Получаем текущую цену
            material = await conn.fetchrow("""
                SELECT id, selling_price 
                FROM materials 
                WHERE name = $1 
                ORDER BY id DESC 
                LIMIT 1
            """, data.material_name)
            
            if not material:
                raise HTTPException(status_code=404, detail="Материал не найден")
            
            # Обновляем цену в материалах
            await conn.execute("""
                UPDATE materials
                SET selling_price = $1
                WHERE id = $2
            """, data.new_selling_price, material['id'])
            
            # Добавляем запись в прайс-лист
            await conn.execute("""
                INSERT INTO price_lists 
                (material_id, price, valid_from)
                VALUES ($1, $2, CURRENT_DATE)
            """, material['id'], data.new_selling_price)
            
            return {"message": f"Цена обновлена для {data.material_name}"}
    finally:
        await conn.close()

@app.post(f"/api/{API_VERSION}/materials/add")
async def add_material(data: AddMaterialRequest, user_data: dict = Depends(get_current_user)):
    """
    Добавляет новый материал в систему.
    Доступно менеджерам и администраторам.
    """
    user_role = user_data.get("role", CLIENT_ROLE)
    if user_role not in (MANAGER_ROLE, ADMIN_ROLE):
        raise HTTPException(
            status_code=403,
            detail="Недостаточно прав для добавления материалов"
        )
        
    conn = await get_db_connection()
    try:
        material_id = await conn.fetchval("""
            INSERT INTO materials (name, description)
            VALUES ($1, $2)
            RETURNING id;
        """, data.name, data.description)
        
        return {
            "message": f"Материал '{data.name}' успешно добавлен",
            "material_id": material_id
        }
    except Exception as e:
        logger.error(f"Ошибка при добавлении материала: {str(e)}")
        raise HTTPException(status_code=500, detail="Ошибка при добавлении материала")
    finally:
        await conn.close()

# ------------------------------
# Затычки для получения данных расчётов с фронтенда
# ------------------------------
@app.get(f"/api/{API_VERSION}/calculations")
async def get_calculations(user_data: dict = Depends(get_current_user)):
    """
    Возвращает список расчётов для текущего пользователя.
    """
    user_id = user_data["user_id"]
    conn = await get_db_connection()
    try:
        # Получаем customer_id
        customer = await conn.fetchrow(
            "SELECT id FROM customers WHERE user_id = $1",
            user_id
        )
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        customer_id = customer['id']

        # Запрос из общей таблицы calculations
        records = await conn.fetch("""
            SELECT id, calculation_type, title, input_data, results, created_at
            FROM calculations
            WHERE customer_id = $1
            ORDER BY created_at DESC
        """, customer_id)
        
        calc_list = []
        for rec in records:
            calc_list.append({
                "id": rec['id'],
                "type": rec['calculation_type'],
                "title": rec['title'],
                "parameters": json.loads(rec['input_data']),
                "result": json.loads(rec['results']),
                "created_at": rec['created_at'].isoformat()
            })
            
        return {"calculations": calc_list}
    finally:
        await conn.close()

@app.get(f"/api/{API_VERSION}/calculation/{{calc_id}}")
async def get_calculation(calc_id: int, user_data: dict = Depends(get_current_user)):
    """
    Возвращает детали расчёта по ID.
    """
    user_id = user_data["user_id"]
    conn = await get_db_connection()
    try:
        # Получаем customer_id
        customer = await conn.fetchrow(
            "SELECT id FROM customers WHERE user_id = $1",
            user_id
        )
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        customer_id = customer['id']

        # Запрос из общей таблицы calculations
        record = await conn.fetchrow("""
            SELECT id, calculation_type, title, input_data, results, created_at
            FROM calculations
            WHERE id = $1 AND customer_id = $2
        """, calc_id, customer_id)
        
        if not record:
            raise HTTPException(status_code=404, detail="Calculation not found")
            
        return {
            "id": record['id'],
            "type": record['calculation_type'],
            "title": record['title'],
            "parameters": json.loads(record['input_data']),
            "result": json.loads(record['results']),
            "created_at": record['created_at'].isoformat()
        }
    finally:
        await conn.close()

# ------------------------------
# Обработка ошибок
# ------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTP ошибка: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Необработанная ошибка: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Внутренняя ошибка сервера"}
    )

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    logger.error(f"Ошибка валидации: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

@app.get(f"/api/{API_VERSION}/health")
async def health_check():
    """
    Эндпоинт для проверки работоспособности API.
    """
    return {
        "status": "ok",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "ok",
            "email": "ok"
        }
    }

# ------------------------------
# Запуск приложения
# ------------------------------
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
