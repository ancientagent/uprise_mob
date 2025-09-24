# Copy to scripts\supabase_env.ps1, edit PGURI, then run:
#   . scripts\supabase_env.ps1

$env:PGURI = "postgres://uprise_ro:CHANGE_ME@HOST:5432/DB?sslmode=require"
Write-Host "PGURI configured for Supabase (read-only recommended)."

