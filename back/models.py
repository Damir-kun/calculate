from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    manager_id: Optional[int] = None

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class MaterialBase(BaseModel):
    name: str
    price: float
    unit: str

class MaterialCreate(MaterialBase):
    pass

class Material(MaterialBase):
    id: int

    class Config:
        orm_mode = True

class CalculationBase(BaseModel):
    type: str
    data: Dict[str, Any]
    result: Dict[str, Any]

class CalculationCreate(CalculationBase):
    pass

class Calculation(CalculationBase):
    id: int
    user_id: int
    created_at: datetime
    is_bookmarked: bool = False

    class Config:
        orm_mode = True 