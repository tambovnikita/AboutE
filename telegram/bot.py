import os
import asyncio
import aiohttp
from datetime import datetime
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command, CommandStart
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from motor.motor_asyncio import AsyncIOMotorClient


# Конфигурация из переменных окружения
API_URL = os.getenv("API_URL")
MONGO_URI = os.getenv("MONGO_URI")
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

# Инициализация бота и планировщика
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()
scheduler = AsyncIOScheduler(timezone="UTC")

# Подключение к MongoDB
client = AsyncIOMotorClient(MONGO_URI)
db = client["AbouteDB"]
collection = db["people"]


@dp.message(CommandStart())
async def handle_start_with_referral(message: types.Message, command: CommandStart):
    # Получаем аргументы из команды /start
    args = command.args
    if args:
        try:
            api_key = str(args)
            # await message.answer(api_key)

            # Попытка обновления данных пользователя в базе данных
            user_data = await update_user_by_api_key(api_key, {"telegram_user_id": message.from_user.id})
            if not user_data:
                await message.answer("❌ Пользователь не найден!\nВернитесь на сайт и повторите попытку.")
                return

            username = user_data.get('username', '')
            name_parts = [
                user_data.get('first_name', ''),
                user_data.get('last_name', '')
            ]
            full_name = ' '.join(filter(None, name_parts)).strip()
            name_in_text = f"<b>{username}</b>"
            if len(full_name) > 0:
                name_in_text += f" <i>({full_name})</i>"
            
            text = "\n".join([
                f"🎉 Добро пожаловать, {name_in_text}!",
                "С этого момента бот будет присылать напоминания в 06:00 UTC (09:00 Russia, Moscow) в дни, когда у добавленных persons Дни Рождения 🎂",
                '\nВернитесь обратно на сайт и <b>нажмите на кнопку "Готово"</b>.',
                '\nПосле этого откроется Главная страница сайта и его функционал станет полностью доступен.'
            ])
            await message.answer(text, parse_mode="HTML")

        except ValueError:
            await message.answer("❌ Некорректный формат ссылки!")
    
    else:
        # Обычный запуск без параметров
        await message.answer(f"🎉 Добро пожаловать!\nПерейдите на сайт https://aboute.online и активируйте режим отправки напоминаний в 06:00 UTC (09:00 Russia, Moscow) в день, когда у добавленного человека День Рождения 🎂", parse_mode="HTML")


@dp.message(Command("go"))
async def handle_go_command(message: types.Message):
    await check_birthdays()


async def get_user_by_api_key(api_key: str):
    url = f"{API_URL}/users/{api_key}"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    user_data = await response.json()
                    return user_data
                elif response.status == 404:
                    # print("🚫 Пользователь не найден")
                    return None
                else:
                    # print(f"❌ Ошибка сервера: {response.status}")
                    return None
    except aiohttp.ClientConnectorError:
        # print("🔥 Невозможно подключиться к серверу")
        return None


async def update_user_by_api_key(api_key: str, update_data: dict):
    url = f"{API_URL}/users/{api_key}"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.put(url, json=update_data) as response:
                if response.status == 200:
                    return await response.json()
                elif response.status == 404:
                    # print("🚫 Пользователь не найден")
                    return None
                else:
                    # print(f"❌ Ошибка сервера: {response.status}")
                    return None
    except aiohttp.ClientConnectorError:
        # print("🔥 Невозможно подключиться к серверу")
        return None


async def check_birthdays():
    today = datetime.now()
    current_day = today.day
    current_month = today.month
    current_year = today.year

    pipeline = [
        {
            "$match": {
                "settings.enableBirthdayReminder": True
            }
        },
        {
            "$addFields": {
                "birthdate": {
                    "$dateFromString": {
                        "dateString": "$info.birthdate",
                        "format": "%Y-%m-%d"
                    }
                }
            }
        },
        {
            "$addFields": {
                "birth_day": {"$dayOfMonth": "$birthdate"},
                "birth_month": {"$month": "$birthdate"},
                "birth_year": {"$year": "$birthdate"}
            }
        },
        {
            "$match": {
                "birth_day": current_day,
                "birth_month": current_month
            }
        },
    ]

    try:
        people = await collection.aggregate(pipeline).to_list(None)
        
        if not people:
            return

        for person in people:
            api_key = person.get('api_key', None)
            if not api_key:
                continue
            user_data = await get_user_by_api_key(api_key)
            if not user_data:
                continue
            telegram_user_id = user_data["telegram_user_id"]

            nickname = person["info"].get('nickname', '')
            name_parts = [
                person["info"].get('last_name', ''),
                person["info"].get('first_name', ''),
                person["info"].get('patronymic', '')
            ]
            full_name = ' '.join(filter(None, name_parts)).strip()
            name_in_text = f"<b>{nickname}</b>"
            if len(full_name) > 0:
                name_in_text += f" <i>({full_name})</i>"

            birth_year = person.get('birth_year', current_year)
            age = current_year - birth_year

            date_str = today.strftime("%d.%m.%Y")

            text = (f"🎂 Сегодня <b>({date_str})</b> День Рождения\nу {name_in_text}\nисполнилось {age} лет")
            await bot.send_message(chat_id=telegram_user_id, text=text, parse_mode="HTML")

    except Exception as e:
        print(f"Ошибка при обработке дней рождений: {e}")


async def main():
    # Запуск планировщика
    scheduler.add_job(check_birthdays, 'cron', hour=6, minute=00)
    scheduler.start()
    
    # Запуск бота
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
