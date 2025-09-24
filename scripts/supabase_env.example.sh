#!/usr/bin/env bash
# Copy to supabase_env.sh, edit PGURI, and source it:
#   cp scripts/supabase_env.example.sh scripts/supabase_env.sh
#   edit PGURI below, then: source scripts/supabase_env.sh

export PGURI="postgres://uprise_ro:CHANGE_ME@HOST:5432/DB?sslmode=require"
echo "PGURI configured for Supabase (read-only recommended)."

