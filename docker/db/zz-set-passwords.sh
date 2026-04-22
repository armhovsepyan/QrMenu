#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE ROLE anon                NOLOGIN NOINHERIT;
  CREATE ROLE authenticated       NOLOGIN NOINHERIT;
  CREATE ROLE service_role        NOLOGIN NOINHERIT BYPASSRLS;
  CREATE ROLE supabase_auth_admin    NOINHERIT CREATEROLE LOGIN PASSWORD '$POSTGRES_PASSWORD';
  CREATE ROLE supabase_storage_admin NOINHERIT CREATEROLE LOGIN PASSWORD '$POSTGRES_PASSWORD';
  CREATE ROLE authenticator          NOINHERIT            LOGIN PASSWORD '$POSTGRES_PASSWORD';

  GRANT anon, authenticated, service_role TO authenticator;
  GRANT ALL PRIVILEGES ON DATABASE postgres TO supabase_auth_admin;
  GRANT ALL PRIVILEGES ON DATABASE postgres TO supabase_storage_admin;

  CREATE SCHEMA IF NOT EXISTS auth;
  ALTER SCHEMA auth OWNER TO supabase_auth_admin;

  CREATE SCHEMA IF NOT EXISTS storage;
  ALTER SCHEMA storage OWNER TO supabase_storage_admin;

  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL   ON SCHEMA public TO postgres;
EOSQL
