# QR Menu

Multilingual QR-code menu builder built with Next.js 14, Supabase (self-hosted), and Tailwind CSS.

---

## Запуск после перезагрузки ПК

### 1. Убедись, что Docker Desktop запущен

Найди иконку Docker в системном трее. Если не запущен — открой Docker Desktop и дождись, пока он полностью загрузится.

### 2. Запусти бэкенд

```bash
cd F:\Temp\qrmenu
docker compose up -d
```

Это запустит PostgreSQL, GoTrue (auth), PostgREST, Storage API и Kong. Подожди ~30–60 секунд.

Проверь, что всё работает:

```bash
docker compose ps
```

Все сервисы должны быть в статусе `running`. Контейнер `db-migrations` будет `exited` — это нормально.

### 3. Открой приложение

Приложение уже работает в Docker на **http://localhost:3000**

Если нужен режим разработки (с hot-reload):

```bash
npm run dev
```

---

## Важно: как правильно останавливать проект

Перед выключением ПК **всегда останавливай контейнеры командой**:

```bash
docker compose down
```

> Если просто выключить ПК без этой команды, Docker может пересоздать тома при следующем запуске — **все данные базы данных (пользователи, меню) будут удалены**.

---

## Если логин не работает после перезагрузки

Это значит, что база данных была пересоздана и все пользователи удалены. Нужно зарегистрироваться заново:

1. Перейди на **http://localhost:3000/auth/register**
2. Создай новый аккаунт
3. Войди и создай меню заново

Чтобы проверить, не пересоздался ли том БД, выполни:

```bash
docker volume ls | grep db-data
```

Если том есть — данные сохранены. Если тома нет — БД пустая.

---

## Первый запуск (с нуля)

### Требования

- [Node.js](https://nodejs.org/) 18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Установка

```bash
# 1. Перейди в папку проекта
cd F:\Temp\qrmenu

# 2. Установи зависимости
npm install

# 3. Запусти бэкенд
docker compose up -d

# 4. Запусти фронтенд (dev-режим)
npm run dev
```

Открой **http://localhost:3000** и зарегистрируй аккаунт на `/auth/register`.

---

## Переменные окружения

| Файл | Назначение |
|------|-----------|
| `.env` | Секреты для Docker Compose (JWT, пароль БД, ключи Supabase) |
| `.env.local` | Переменные для Next.js (URL Supabase, ключи, Anthropic API key) |

Если `.env.local` отсутствует — скопируй пример и заполни значениями из `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY из .env>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY из .env>
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Команды разработки

```bash
npm run dev      # dev-сервер на http://localhost:3000
npm run build    # production-сборка (включает проверку типов)
npm run lint     # ESLint
npx tsc --noEmit # проверка типов без сборки
```

---

## Архитектура

**Next.js 14 App Router** + Tailwind CSS + локальный Supabase (Docker).

### Маршруты

| Путь | Назначение |
|------|-----------|
| `/` | Публичная лендинг-страница |
| `/auth/login`, `/auth/register` | Авторизация |
| `/dashboard` | Список меню (защищено) |
| `/dashboard/menu/[id]` | Настройки меню (название, slug, цвет, логотип) |
| `/dashboard/menu/[id]/categories` | Управление категориями |
| `/dashboard/menu/[id]/items` | Управление блюдами |
| `/dashboard/menu/[id]/qr` | Скачать QR-код |
| `/menu/[slug]` | Публичная страница меню (без авторизации) |
| `/menu/demo` | Демо без Supabase |

### Docker-сервисы

| Контейнер | Назначение | Порт |
|-----------|-----------|------|
| `db` | PostgreSQL 15 | 5432 |
| `auth` | GoTrue (авторизация) | — |
| `rest` | PostgREST (REST API) | — |
| `storage` | Supabase Storage (файлы) | — |
| `kong` | API Gateway | 8000 |
| `qrmenu` | Next.js приложение | 3000 |