from sqlalchemy import Column, Integer, BigInteger, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date
import secrets


Base = declarative_base()

def generate_api_key():
    return secrets.token_urlsafe(32)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    api_key = Column(String, unique=True, default=generate_api_key)
    email = Column(String, unique=True)
    username = Column(String, unique=True)
    first_name = Column(String)
    last_name = Column(String)
    telegram_user_id = Column(BigInteger, default=None)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    password: str

class UpdateUserRequest(BaseModel):
    telegram_user_id: int

class Tag(BaseModel):
    text: str
    color: str

class PersonInfo(BaseModel):
    nickname: str
    first_name: str
    last_name: str
    patronymic: str
    birthdate: Optional[date] = None
    gender: str

class PersonSettings(BaseModel):
    enableBirthdayReminder: bool

class Person(BaseModel):
    id: str
    api_key: str
    avatar: str
    info: PersonInfo
    tags: List[Tag]
    characteristics: List[str]
    settings: PersonSettings
