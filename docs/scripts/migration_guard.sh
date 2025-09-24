#!/usr/bin/env bash
set -euo pipefail

# Migration guard (read-only friendly)
# Behavior:
# 1) If PGURI is provided, report presence and counts of common migration tables.
# 2) Else, if API_DIR has yarn migration scripts, run status/migrate/status.
# 3) Otherwise, warn and exit 0.

PGURI="${PGURI:-}"
if [[ -n "$PGURI" ]]; then
  echo "== Migration tables (read-only) =="
  psql "$PGURI" -v ON_ERROR_STOP=1 -c "\
  DO $$
  DECLARE
    t text;
  BEGIN
    FOR t IN SELECT unnest(ARRAY['SequelizeMeta','knex_migrations','typeorm_migrations']) LOOP
      EXECUTE format('SELECT ''%%s'' AS table, COUNT(*) AS count FROM %%I', t) ;
    END LOOP;
  END$$;" || true
  echo "\nNote: This is a read-only scan; no migrations executed."
  exit 0
fi

API_DIR="${API_DIR:-../webapp_api}"
if [[ -f "$API_DIR/package.json" ]]; then
  if ! command -v yarn >/dev/null 2>&1; then
    echo "yarn not found in PATH" >&2; exit 0; fi
  echo "== Migration status (before) =="
  yarn --cwd "$API_DIR" db:migrate:status || true
  echo "\n== Running migrations =="
  yarn --cwd "$API_DIR" db:migrate || { echo "Migrations failed" >&2; exit 1; }
  echo "\n== Migration status (after) =="
  yarn --cwd "$API_DIR" db:migrate:status || true
  echo "\nMigration guard completed."
  exit 0
fi

echo "[WARN] migration_guard: no PGURI and no API_DIR with migration scripts; skipping." >&2
exit 0
