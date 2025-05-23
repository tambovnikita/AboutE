from fastapi import FastAPI, HTTPException, status, Form, File, UploadFile, Request, Response, Depends, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
from werkzeug.utils import secure_filename
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
import bcrypt
from typing import List
import json
import os
from datetime import datetime

from .db import create_postgres_tables, get_db
from .models import User, UserLogin, UserRegister, UpdateUserRequest, Person


app = FastAPI(max_request_body_size=10 * 1024 * 1024)  # Лимит 10 МБ

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://aboute.online", "https://aboute.online"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_db_client():
    # Конфигурация из переменных окружения
    MONGO_URI = os.getenv("MONGO_URI")

    # Подключение к MongoDB
    app.mongodb_client = AsyncIOMotorClient(MONGO_URI)
    app.mongodb = app.mongodb_client.AbouteDB

    # Создание таблиц в PostgreSQL
    await create_postgres_tables()

    # Внесение тестовых данных
    # await add_persons()


@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()


# Эндпоинты
@app.get("/api/people/{api_key}", response_model=List[Person])
async def get_people(api_key: str):
    people = []
    collection = app.mongodb.get_collection("people")
    async for document in collection.find({"api_key": api_key}):
        if document["avatar"] != "":
            document["avatar"] = "https://aboute.online" + document["avatar"]
        document["id"] = str(document["_id"])
        del document["_id"]
        people.append(document)
    return people


@app.get("/api/person/{person_id}", response_model=Person)
async def get_person(person_id: str):
    try:
        # Проверяем валидность ID
        if not ObjectId.is_valid(person_id):
            raise HTTPException(status_code=400, detail="Invalid ID format")
        
        collection = app.mongodb.get_collection("people")
        document = await collection.find_one({"_id": ObjectId(person_id)})
        
        if not document:
            raise HTTPException(status_code=404, detail="Person not found")
        
        if document["avatar"] != "":
            document["avatar"] = "https://aboute.online" + document["avatar"]
        document["id"] = str(document["_id"])
        del document["_id"]
        return document
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def handle_avatar_upload(avatar: UploadFile, api_key: str, person_id: str):
    if not avatar:
        return ""
    
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 МБ
    content = await avatar.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max size = 10 Mb")
    await avatar.seek(0)  # Возвращаем позицию чтения на начало
    
    # Проверка расширения
    file_ext = avatar.filename.split('.')[-1].lower()
    if file_ext not in {'png', 'jpg', 'jpeg', 'gif'}:
        raise HTTPException(400, "Invalid file extension")
    
    # Проверка MIME-типа
    if avatar.content_type not in {'image/jpeg', 'image/png', 'image/gif'}:
        raise HTTPException(400, "Invalid MIME type")
    
    # Создание папки пользователя, если её нет
    save_dir = os.path.join("static", "users", api_key, "people_avatars")
    os.makedirs(save_dir, exist_ok=True)
    
    # Сохранение файла
    save_path = os.path.join(save_dir, f"{person_id}.{file_ext}")
    with open(save_path, "wb") as buffer:
        content = await avatar.read()
        buffer.write(content)
    
    return f'/api/static/users/{api_key}/people_avatars/{f"{person_id}.{file_ext}"}'


@app.post("/api/person", status_code=201)
async def create_person(request: Request, avatar: UploadFile = File(None)):
    try:
        form_data = await request.form()
        person_data = dict(form_data)
        person_data["info"] = json.loads(person_data["info"])
        person_data["tags"] = json.loads(person_data["tags"])
        person_data["characteristics"] = json.loads(person_data["characteristics"])
        person_data["settings"] = json.loads(person_data["settings"])

        if person_data["info"]["birthdate"] == "":
            person_data["info"]["birthdate"] = None
        person_data["avatar"] = ""
        
        collection = app.mongodb.get_collection("people")
        result = await collection.insert_one(person_data)
        person_id = str(result.inserted_id)

        if avatar and avatar.filename:
            try:
                person_data["avatar"] = await handle_avatar_upload(avatar=avatar, api_key=person_data["api_key"], person_id=person_id)
            except HTTPException as e:
                raise e
            except Exception as e:
                raise HTTPException(500, f"File upload failed: {str(e)}")
        else:
            person_data["avatar"] = ""

        result = await collection.update_one(
            {"_id": ObjectId(person_id)},
            {"$set": {"avatar": person_data["avatar"]}}
        )

        return {"id": person_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/person/{person_id}")
async def update_person(person_id: str, request: Request, avatar: UploadFile = File(None)):
    form_data = await request.form()
    update_data = dict()
    for key, value in dict(form_data).items():
        if key == "avatar":
            continue
        update_data[f"info.{key}"] = value
    
    if avatar and avatar.filename:
        try:
            update_data["avatar"] = await handle_avatar_upload(avatar=avatar, api_key=update_data["info.api_key"], person_id=person_id)
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(500, f"File upload failed: {str(e)}")
    del update_data["info.api_key"]

    try:
        collection = app.mongodb.get_collection("people")
        result = await collection.update_one(
            {"_id": ObjectId(person_id)},
            {"$set": update_data}
        )
        return {"success": True}
    except Exception as e:
        # Обработка неожиданных ошибок
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/person/{person_id}")
async def delete_person(person_id: str):
    try:
        # Проверка валидности ID
        if not ObjectId.is_valid(person_id):
            raise HTTPException(status_code=400, detail="Invalid ID format")
        
        collection = app.mongodb.get_collection("people")
        # Удаление документа и проверка результата
        result = await collection.delete_one({"_id": ObjectId(person_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Person not found")
        
        # Возвращаем статус 204 без содержимого
        return Response(status_code=204)
    except HTTPException:
        # Пробрасываем уже обработанные исключения
        raise
    except Exception as e:
        # Обработка неожиданных ошибок
        raise HTTPException(status_code=500, detail=str(e))


# @app.post("/api/add_persons", status_code=201)
# async def add_persons():
#     collection = app.mongodb.get_collection("people")
#     with open("app/people.json", "r") as file:
#         await collection.insert_many(json.load(file))
#     return "Данные из people.json добавлены в БД"


@app.post("/api/register")
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    errors = []
    # Проверка уникальности email
    existing_email = await db.execute(select(User).where(User.email == user_data.email))
    if existing_email.scalar_one_or_none():
        errors.append("Пользователь с таким email уже существует")
    # Проверка уникальности username
    existing_username = await db.execute(select(User).where(User.username == user_data.username))
    if existing_username.scalar_one_or_none():
        errors.append("Пользователь с таким username уже существует")
    if errors:
        return JSONResponse(status_code=400, content={"success": False, "errors": errors})

    try:
        hashed_password = bcrypt.hashpw(user_data.password.encode(), bcrypt.gensalt()).decode()
        new_user = User(username=user_data.username, email=user_data.email, first_name=user_data.first_name, last_name=user_data.last_name, hashed_password=hashed_password)
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return {
            "success": True,
            "data": {
                "id": new_user.id,
                "email": new_user.email,
                "first_name": new_user.first_name,
                "last_name": new_user.last_name,
                "username": new_user.username,
                "api_key": new_user.api_key
            }
        }
    
    except Exception as e:
        await db.rollback()
        return JSONResponse(status_code=500, content={"success": False, "errors": ["Internal server error"]})


@app.post("/api/login")
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()
    if not user:
        return JSONResponse(status_code=400, content={"success": False, "errors": ["Нет пользователя с такими данными"]})
    elif not bcrypt.checkpw(user_data.password.encode(), user.hashed_password.encode()):
        return JSONResponse(status_code=400, content={"success": False, "errors": ["Введён неверный пароль"]})
    return {
        "success": True,
        "data": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "api_key": user.api_key
        }
    }


@app.get("/api/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()


@app.get("/api/users/{api_key}")
async def get_user_by_api_key(api_key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.api_key == api_key))
    return result.scalar_one_or_none()


@app.put("/api/users/{api_key}")
async def update_user_by_api_key(api_key: str, data: UpdateUserRequest, db: AsyncSession = Depends(get_db)):
    user = await db.execute(select(User).where(User.api_key == api_key))
    user = user.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Нет пользователя с такими данными")
    
    await db.execute(
        update(User)
        .where(User.api_key == api_key)
        .values(telegram_user_id=data.telegram_user_id)
    )
    await db.commit()
    return await db.get(User, user.id)


@app.delete("/api/users/{user_id}")
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await db.delete(user)
    await db.commit()
    
    return {"message": f"User (id={user_id}) deleted successfully"}


app.mount("/static", StaticFiles(directory="static"), name="static")
