#!/usr/bin/env bash
set -euo pipefail

#!/usr/bin/env bash
set -euo pipefail

# PostGIS verification (non-destructive)
# Prefers PGURI if set; otherwise uses PG_* env vars; as a last resort parses ENV_FILE.

PGURI="${PGURI:-}"
if [[ -z "$PGURI" ]]; then
  # Build from PG_* if present
  if [[ -n "${PG_HOST:-}" && -n "${PG_PORT:-}" && -n "${PG_DB:-}" && -n "${PG_USER:-}" ]]; then
    PGSSLMODE="${PGSSLMODE:-}"
    if [[ -n "${PGPASSWORD:-}" ]]; then
      PGURI="postgres://${PG_USER}:${PGPASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}${PGSSLMODE:+?sslmode=${PGSSLMODE}}"
    else
      PGURI="postgres://${PG_USER}@${PG_HOST}:${PG_PORT}/${PG_DB}${PGSSLMODE:+?sslmode=${PGSSLMODE}}"
    fi
  fi
fi

if [[ -z "$PGURI" ]]; then
  # Fallback to .env file if provided, otherwise skip with warning
  ENV_FILE="${ENV_FILE:-../webapp_api/.env}"
  if [[ -f "$ENV_FILE" ]]; then
    declare -A _env
    while IFS= read -r line || [[ -n "$line" ]]; do
      line="${line#$'\xEF\xBB\xBF'}"; line="${line%%#*}"; line="${line##[[:space:]]}"; line="${line%%[[:space:]]}"
      [[ -z "$line" ]] && continue
      key="${line%%=*}"; val="${line#*=}"; key="${key##[[:space:]]}"; key="${key%%[[:space:]]}"; val="${val##[[:space:]]}"; val="${val%%[[:space:]]}"
      val="${val%$'\r'}"; [[ ${val:0:1} == '"' && ${val: -1} == '"' ]] && val="${val:1:${#val}-2}" || true
      [[ ${val:0:1} == "'" && ${val: -1} == "'" ]] && val="${val:1:${#val}-2}" || true
      _env["$key"]="$val"
    done < "$ENV_FILE"
    DB_HOST="${_env[DB_HOST]:-}"; DB_PORT="${_env[DB_PORT]:-}"; DB_NAME="${_env[DB_NAME]:-}"; DB_USERNAME="${_env[DB_USERNAME]:-}"; DB_PASSWORD="${_env[DB_PASSWORD]:-}"
    if [[ -n "$DB_HOST" && -n "$DB_PORT" && -n "$DB_NAME" && -n "$DB_USERNAME" ]]; then
      PGURI="postgres://${DB_USERNAME}${DB_PASSWORD:+:${DB_PASSWORD}}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    fi
  fi
fi

if [[ -z "$PGURI" ]]; then
  echo "[WARN] No PGURI/PG_* envs or readable ENV_FILE; skipping PostGIS check" >&2
  exit 0
fi

echo "Checking PostGIS version via: ${PGURI%%@*}@…"
psql "$PGURI" -c "SELECT postgis_full_version();" || {
  echo "[WARN] postgis_full_version() failed; connection or extension issue" >&2; exit 0; }

echo "\nOptional: sample geospatial check (skipped if table/columns missing)"
psql "$PGURI" \
  -c "\
DO $$\
BEGIN\
  IF EXISTS (\
    SELECT 1 FROM information_schema.columns\
    WHERE table_name='songs' AND column_name IN ('latitude','longitude')\
  ) THEN\
    RAISE NOTICE 'Songs within ~40km of Austin: %', (\
      SELECT COUNT(*) FROM songs\
      WHERE ST_DWithin(\
        ST_SetSRID(ST_MakePoint(longitude, latitude),4326)::geography,\
        ST_SetSRID(ST_MakePoint(-97.7431, 30.2672),4326)::geography,\
        40000\
      )\
    );\
  ELSE\
    RAISE NOTICE 'songs(latitude,longitude) not present; skipping distance check';\
  END IF;\
END$$;\
"

echo "\nDone. Non-destructive checks completed."
