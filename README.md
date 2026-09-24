# 🦷 СМ-Стоматология — веб-сайт клиники

Полноценный сайт стоматологической клиники с админ-панелью, регистрацией пациентов и базой данных.

## 📸 Возможности

### Публичная часть
- 🎨 Современный лендинг с градиентным дизайном
- 📋 Каталог услуг и цен
- 👨‍⚕️ Карточки врачей
- 📞 Форма обратного звонка
- 📅 Онлайн-запись на приём
- 🔐 Регистрация и вход для пациентов
- 👤 Личный кабинет с историей заявок

### Админ-панель (`/admin`)
- 📊 Просмотр обратных звонков
- 📅 Просмотр записей на приём
- ✏️ Изменение статуса заявок
- 🗑️ Удаление заявок

## 🛠️ Технологии

- **Backend:** Python 3.13, Flask, SQLAlchemy
- **Database:** SQLite
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Иконки:** Font Awesome

## 🚀 Установка и запуск

```bash
# 1. Клонировать репозиторий
git clone https://github.com/ВАШ_ЛОГИН/sm_stomatology.git
cd sm_stomatology

# 2. Установить зависимости
pip install flask flask-sqlalchemy werkzeug

# 3. Запустить
python app.py

Открыть: http://127.0.0.1:5000

🔑 Доступы
Роль	URL	Логин	Пароль
Админ	/admin	admin	admin123
Пациент	/	регистрация	—
📁 Структура
text
sm_stomatology/
├── app.py                  # Backend + БД
├── static/
│   ├── style.css          # Стили сайта
│   ├── script.js          # Логика сайта
│   ├── admin.css          # Стили админки
│   └── admin.js           # Логика админки
├── templates/
│   ├── index.html         # Главная страница
│   └── admin.html         # Админ-панель
└── README.md
📝 Лицензия
MIT

text

---

## 🎯 Шаг 2: Создайте репозиторий на GitHub

1. Зайдите на **https://github.com** и войдите в аккаунт.
2. Нажмите **зелёную кнопку `+`** в правом верхнем углу → **New repository**.
3. Заполните:
   - **Repository name:** `sm_stomatology`
   - **Description:** Сайт стоматологии с админ-панелью
   - **Public** (публичный) или **Private** (приватный) — на ваш выбор
   - ❌ **НЕ ставьте галочки** на «Add README», «Add .gitignore», «Choose license» — они нам не нужны, у нас уже есть свои файлы.
4. Нажмите **Create repository**.

После создания GitHub покажет страницу с командами. **Скопируйте URL** вашего репозитория (например, `https://github.com/ваш-логин/sm_stomatology.git`).

---

## 🎯 Шаг 3: Настройка Git (один раз)

Откройте **терминал** (Win+R → `cmd` → Enter) и выполните:

```bash
git config --global user.name "Ваше Имя"
git config --global user.email "ваша_почта@example.com"