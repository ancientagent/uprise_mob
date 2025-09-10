# Config Notes (Sanitized)

This repo includes sanitized templates only. Original, local-only configuration artifacts were discovered under:

- Windows path: D:\\july model files
- WSL mount: /mnt/d/july model files

Do not commit any real secrets. Use the provided templates and populate values locally:

- docs/env/.env.api.example → copy to ../webapp_api/.env
- docs/env/.env.mobile.example → copy to project .env
- docs/env/postgresql.conf.example → base for local Postgres tuning (non-sensitive)
- docs/env/pg_hba.conf.example → base for local HBA rules (non-sensitive)

If you see files resembling `.env`, `*.sql`, database dumps, or configs with credentials, keep them on your local disk only and document paths here without values.
