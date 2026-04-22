# QR Catalog

Multilingual QR-code menu builder — Next.js 14, self-hosted Supabase, Tailwind CSS.

---

## После клонирования (первый запуск)

### Требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — запущен и работает
- [Node.js](https://nodejs.org/) 18+ — только для dev-режима

### 1. Создай файл `.env`

`.env` не хранится в репозитории. Нужно создать его вручную.

**Вариант A — сгенерировать новые ключи автоматически:**

```bash
node scripts/generate-keys.mjs
```

Скрипт выведет готовые строки — скопируй их в новый файл `.env`.

**Вариант B — создать `.env` вручную:**

```bash
cp .env.example .env
```

Затем открой `.env` и заполни значения:

- `POSTGRES_PASSWORD` — любой длинный случайный пароль
- `JWT_SECRET` — длинная случайная строка (минимум 32 символа)
- `ANON_KEY` и `SERVICE_ROLE_KEY` — JWT токены, сгенерированные из `JWT_SECRET` (используй скрипт выше)

### 2. Обнови `docker/db/zz-set-passwords.sql`

В этом файле пароль DB захардкожен. Замени его на значение `POSTGRES_PASSWORD` из твоего `.env`:

```sql
-- строки 5, 6, 7 в файле docker/db/zz-set-passwords.sql
CREATE ROLE supabase_auth_admin    ... PASSWORD 'ВАШ_POSTGRES_PASSWORD';
CREATE ROLE supabase_storage_admin ... PASSWORD 'ВАШ_POSTGRES_PASSWORD';
CREATE ROLE authenticator          ... PASSWORD 'ВАШ_POSTGRES_PASSWORD';
```

### 3. Запусти проект

```bash
docker compose up -d --build
```

Первый запуск занимает 2–3 минуты (сборка Next.js образа).

### 4. Открой приложение

**http://localhost:3000**

Перейди на `/auth/register` и создай аккаунт.

---

## Ежедневный запуск (после перезагрузки ПК)

```bash
docker compose up -d
```

Открой Docker Desktop → убедись что он запущен, затем выполни команду.

---

## Остановка

```bash
docker compose down
```

> Данные БД хранятся в `./data/postgres/` на диске — они переживают перезапуск.  
> Никогда не удаляй папку `data/` вручную, если не хочешь потерять все данные.

---

## Dev-режим (с hot-reload)

```bash
npm install       # один раз
npm run dev       # запускает Next.js на localhost:3000
```

Бэкенд (Docker) должен быть запущен отдельно.

---

## Структура `.env`

| Переменная | Назначение |
|---|---|
| `POSTGRES_PASSWORD` | Пароль для всех сервисных аккаунтов PostgreSQL |
| `JWT_SECRET` | Секрет подписи всех JWT токенов |
| `ANON_KEY` | Публичный JWT (роль `anon`) |
| `SERVICE_ROLE_KEY` | Серверный JWT (обходит RLS) |
| `ANTHROPIC_API_KEY` | Опционально — AI-генерация описаний |

---

## Команды разработки

```bash
npm run dev      # dev-сервер http://localhost:3000
npm run build    # production-сборка + проверка типов
npm run lint     # ESLint
npx tsc --noEmit # только проверка типов
```

---

## Маршруты

| Путь | Назначение |
|---|---|
| `/` | Лендинг |
| `/auth/login`, `/auth/register` | Авторизация |
| `/dashboard` | Список каталогов (защищено) |
| `/dashboard/menu/[id]` | Настройки каталога |
| `/dashboard/menu/[id]/categories` | Категории |
| `/dashboard/menu/[id]/items` | Товары |
| `/dashboard/menu/[id]/qr` | QR-код |
| `/menu/[slug]` | Публичная страница (без авторизации) |
| `/menu/demo` | Демо без Supabase |

---

## Docker-сервисы

| Контейнер | Назначение | Порт |
|---|---|---|
| `db` | PostgreSQL 15 | 5432 |
| `auth` | GoTrue (авторизация) | — |
| `rest` | PostgREST (REST API) | — |
| `storage` | Supabase Storage | — |
| `kong` | API Gateway | 8000 |
| `qrmenu` | Next.js приложение | 3000 |
