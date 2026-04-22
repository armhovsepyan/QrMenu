-- Roles needed by GoTrue, PostgREST, Storage
CREATE ROLE anon                NOLOGIN NOINHERIT;
CREATE ROLE authenticated       NOLOGIN NOINHERIT;
CREATE ROLE service_role        NOLOGIN NOINHERIT BYPASSRLS;
CREATE ROLE supabase_auth_admin    NOINHERIT CREATEROLE LOGIN PASSWORD '493a2638facb718bdb9179926175587dbd7f556273e0c2e9146cc3697028c50e';
CREATE ROLE supabase_storage_admin NOINHERIT CREATEROLE LOGIN PASSWORD '493a2638facb718bdb9179926175587dbd7f556273e0c2e9146cc3697028c50e';
CREATE ROLE authenticator          NOINHERIT            LOGIN PASSWORD '493a2638facb718bdb9179926175587dbd7f556273e0c2e9146cc3697028c50e';

GRANT anon, authenticated, service_role TO authenticator;
GRANT ALL PRIVILEGES ON DATABASE postgres TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON DATABASE postgres TO supabase_storage_admin;

CREATE SCHEMA IF NOT EXISTS auth;
ALTER SCHEMA auth OWNER TO supabase_auth_admin;

CREATE SCHEMA IF NOT EXISTS storage;
ALTER SCHEMA storage OWNER TO supabase_storage_admin;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL   ON SCHEMA public TO postgres;
