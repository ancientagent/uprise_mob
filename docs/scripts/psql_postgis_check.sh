#!/usr/bin/env bash
set -euo pipefail

# PostGIS verification (non-destructive)
# Reads DB settings from ../webapp_api/.env if available.

ENV_FILE="${ENV_FILE:-../webapp_api/.env}"

if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set -a; . "$ENV_FILE"; set +a
else
  echo "Env file not found: $ENV_FILE" >&2
  exit 1
fi

: "${DB_HOST:?}" "${DB_PORT:?}" "${DB_NAME:?}" "${DB_USERNAME:?}" "${DB_PASSWORD:?}"

export PGPASSWORD="$DB_PASSWORD"

echo "Checking PostGIS version on $DB_HOST:$DB_PORT/$DB_NAME (user: $DB_USERNAME)"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c "SELECT PostGIS_Full_Version();"

echo "\nOptional: sample geospatial check (skipped if table/columns missing)"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" \
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

