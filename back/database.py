from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Boolean, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./calculator.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # admin, manager, user
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    calculations = relationship("Calculation", back_populates="user")
    managed_users = relationship("User", backref="manager")

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    price = Column(Float)
    unit = Column(String)

class Calculation(Base):
    __tablename__ = "calculations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)  # floor, walls, etc.
    data = Column(JSON)
    result = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_bookmarked = Column(Boolean, default=False)

    user = relationship("User", back_populates="calculations")

# Создаем все таблицы
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 