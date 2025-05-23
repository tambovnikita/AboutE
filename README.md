<h1>AboutE</h1>
https://aboute.online/  

<br><br>
A multifunctional service focused on working with information **about everyone**.  
<small>Многофункциональный сервис, ориентированный на работу с информацией обо всех.</small>

### Области применения

- Продвинутое досье на людей
- Хранилище фото/видео определённого человека
- Управление напоминаниями о важных датах
- Многофункциональная справочная/телефонная книга

### Реализация
<small>Некоторые страницы могут отличаться от итоговой реализации.</small>

![Главная страница](./imgs/home_page.png)
<small>Главная страница</small>

![People List](./imgs/people_list_page.png)
<small>Страница, на которой можно посмотреть информацию о людях и добавить нового человека</small>

![People Map](./imgs/people_map_page.png)
<small>Страница, на которой люди могут быть отображены относительно их географических характеристик (место проживания, место работы и т.п.)</small>

![Person Info 1](./imgs/person_info_1.png)
<small>При клике на карточку человека появляется окно с подробной информацией</small>

![Person Info 2](./imgs/person_info_2.png)
<small>Информацию можно редактировать, добавлять новую и сохранять</small>

<div style="display: flex; column-gap: 20px; margin-top: 20px;">
    <div><img src="./imgs/person_info_3.png" width="100%" alt="Person Info 3"></div>
    <div><img src="./imgs/person_info_4.png" width="100%" alt="Person Info 4"></div>
</div>
<small>При необходимости можно добавить фото/видео, связанные с человеком</small>

![Person Info 5](./imgs/person_info_5.png)
<small>Предусмотрены гибкие настройки, включающие уведомления в Telegram</small>

### Технологии

- **React** - *все страницы и компоненты на стороне клиента*
- **FastAPI** - *обработка всех запросов с Frontend и Telegram-бота*
- **PostgreSQL** - *хранение всех данных о пользователях*
- **MongoDB** - *хранение характеристик и настроек всех persons*
- **TelegramAPI (aiogram)** - *бот-помощник, предоставляющий дополнительный функционал*
- **Nginx** - *гибкая конфигурация, работа с сертификатами, обработка статики*

![Технологии](./imgs/technologies.png)
