#!/bin/bash
psql -U postgres -c "ALTER USER supabase_auth_admin    WITH PASSWORD '$POSTGRES_PASSWORD';" || true
psql -U postgres -c "ALTER USER supabase_storage_admin WITH PASSWORD '$POSTGRES_PASSWORD';" || true
psql -U postgres -c "ALTER USER authenticator          WITH PASSWORD '$POSTGRES_PASSWORD';" || true
