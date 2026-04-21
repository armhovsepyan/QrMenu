#!/bin/sh
set -e
sed "s|\${SUPABASE_ANON_KEY}|$SUPABASE_ANON_KEY|g
     s|\${SUPABASE_SERVICE_KEY}|$SUPABASE_SERVICE_KEY|g" \
  /home/kong/kong.yml > /tmp/kong-processed.yml
exec env KONG_DECLARATIVE_CONFIG=/tmp/kong-processed.yml /docker-entrypoint.sh kong docker-start