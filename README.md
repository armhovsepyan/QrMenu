# QR Catalog

Multilingual QR-code menu builder — Next.js 14, self-hosted Supabase, Tailwind CSS.

---

## Быстрый старт после клонирования

```bash
git clone https://github.com/armhovsepyan/QrMenu.git
cd QrMenu
node scripts/setup.mjs
docker compose up -d --build
```

Открой **http://localhost:3000/auth/register** и создай аккаунт.

> Первый запуск занимает 2–3 минуты — идёт сборка Docker-образа.

---

## Требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — должен быть запущен
- [Node.js](https://nodejs.org/) 18+

---

## Что делает `setup.mjs`

- Генерирует случайные `POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`
- Создаёт файл `.env` в корне проекта
- Обновляет `docker/db/zz-set-passwords.sql` с новым паролем

Если `.env` уже существует — скрипт ничего не трогает.

---

## Ежедневный запуск (после перезагрузки ПК)

```bash
docker compose up -d
```

---

## Остановка

```bash
docker compose down
```

> Данные БД хранятся в `./data/postgres/` — они переживают перезапуск.  
> Не удаляй папку `data/` вручную, если не хочешь потерять все данные.

---

## Dev-режим (с hot-reload)

```bash
npm install
npm run dev
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
| `ANTHROPIC_API_KEY` | Опционально — AI-генерация описаний товаров |

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
