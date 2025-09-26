# UPRISE Sprint 2 - Session Kickoff Template

Purpose
- Paste this at the start of any new conversation to quickly restore context and alignment.

## System Facts
```
REPO_ROOT=/mnt/d/uprise_mob
API_DIR=../webapp_api
WEB_DIR=../webapp_ui
DOCS_DIR=docs

# Services & Ports
API_BASE_URL=http://127.0.0.1:3000
PG_HOST=127.0.0.1
PG_PORT=5433
PG_DB=uprise_dev
PG_USER=uprise
ENV_FILE=$API_DIR/.env

# Emulator independence
# All local validation must succeed WITHOUT Android emulator.
# CI/emulator steps are optional and tracked separately.
```

## Starter Prompt (copy/paste)
- You are Codex acting as Tech Lead + Documentation Steward for UPRISE Sprint 2.
- Use `docs/` as the single source of truth; no app code changes without explicit approval.
- DB is Postgres on port 5433 with PostGIS. Read env from `$ENV_FILE` (do not print secrets).
- Sprint 2 priorities: identity unification (ArtistProfile), correct location filters, Radio=Community projection, genre taxonomy/targeting, non-destructive smokes.

## Quick Context Loader
```
rg --files docs | rg -n "PHASE2_EXECUTION_PLAN|SYSTEM_OVERVIEW|_fragments/params.geo-genre|CHANGELOG|CI_WORKFLOWS|CHECKLISTS|CODEX-PHASE2-INTAKE-REPORT|03_AUTHENTICATION|04_COMMUNITY_LOCATION|05_FAIR_PLAY_ALGO|06_SONG_MANAGEMENT|07_DISCOVERY_MAP|08_EVENTS|09_PROMOTIONS_BUSINESS" -S
sed -n '1,160p' docs/SPRINT2_EXECUTION_PLAN.md
sed -n '1,140p' docs/architecture/SYSTEM_OVERVIEW.md
sed -n '1,160p' docs/Session-Logs/CODEX-PHASE2-INTAKE-REPORT.md
sed -n '1,160p' docs/specs/_fragments/params.geo-genre.md
ls -1 "docs/july model/architecture realignment" "docs/july model/Feature realignment"
```

## Non‑Destructive Verification
```
chmod +x docs/scripts/phase2_smoke.sh docs/scripts/psql_postgis_check.sh
COMMUNITY_KEY=austin-texas-hip-hop BASE_URL=$API_BASE_URL ./docs/scripts/phase2_smoke.sh
./docs/scripts/psql_postgis_check.sh
ls -1 $API_DIR/src/routes
ls -1 $API_DIR/src/database/{models,migrations}
```

## Health Checks (run, parse, and summarize)
```
chmod +x docs/scripts/health_checks.sh
API_BASE_URL=$API_BASE_URL PG_HOST=$PG_HOST PG_PORT=$PG_PORT PG_DB=$PG_DB PG_USER=$PG_USER ./docs/scripts/health_checks.sh

# Under the hood, it runs the following (non-destructive):
# - curl -sf $API_BASE_URL/health | jq . || echo "API health failed"
# - psql "postgres://$PG_USER@${PG_HOST}:${PG_PORT}/${PG_DB}" -c "select version();" >/dev/null
# - psql "postgres://$PG_USER@${PG_HOST}:${PG_PORT}/${PG_DB}" -c "select postgis_full_version();" >/dev/null
# If any fail, it prints the failing command and stderr, and points to DOC: docs/ops/TROUBLESHOOTING.md
```

## Optional Scripted Checks (quick wins)
```
# Validate env shape (no secrets printed)
chmod +x docs/scripts/env_shape_check.sh && ENV_FILE=$ENV_FILE ./docs/scripts/env_shape_check.sh

# Run idempotent migrations and show status before/after
chmod +x docs/scripts/migration_guard.sh && API_DIR=$API_DIR ./docs/scripts/migration_guard.sh

# Verify basic API contract (health, onboarding genres, discovery/radio with community_key)
chmod +x docs/scripts/api_contract_check.sh && API_BASE_URL=$API_BASE_URL COMMUNITY_KEY=austin-texas-hip-hop ./docs/scripts/api_contract_check.sh || true

# Generate a normalized community_key from city/state/genre (helper)
chmod +x docs/scripts/community_key.sh && ./docs/scripts/community_key.sh "Austin" "Texas" "Hip Hop"
```

## Essential Files
- docs/SPRINT2_EXECUTION_PLAN.md — workstreams, tasks, acceptance, migrations, test hooks
- docs/architecture/SYSTEM_OVERVIEW.md — unified model + cross‑module contracts
- docs/specs/_fragments/params.geo-genre.md — standard API params
- docs/specs/03..09_*.md - specs aligned to Sprint 2
- docs/ops/CI_WORKFLOWS.md - Sprint 2 smokes (emulator optional)
- docs/ops/CHECKLISTS.md - Sprint-2 daily driver
- docs/Session-Logs/CODEX-PHASE2-INTAKE-REPORT.md — findings + decisions

## Standard API Inputs/Headers
- Query params: `city, state, genre, lat, lng, radius, community_key`
- Creator header: `X-Artist-Canonical-Id: <id>`
- Auth header: `Authorization: Bearer <token>`

## Guardrails
- No secrets in output; non‑destructive DB checks only
- Keep changes atomic; provide exact git commands
- Don’t change app code without explicit approval

## Git Hygiene (docs PR)
```
git checkout -b fix/docs-phase2-alignment
git add -A
git commit -m "docs(phase2): unify July Model with current specs; add execution plan, agent conversions, smoke scripts, and CI notes"
git push -u origin fix/docs-phase2-alignment
```

## Session Checklist (every new thread)
- Confirm repo path and sibling API presence
- Load SYSTEM_OVERVIEW, EXECUTION_PLAN, and params fragment
- State Sprint 2 goals in one sentence
- Run non‑destructive smokes (API + PostGIS)
- Propose next 2–3 steps with acceptance criteria
- Record material decisions in the intake report

## DB Bootstrap Expectations
- No destructive SQL.
- Migrations must run idempotently:
  - `yarn --cwd $API_DIR db:migrate:status`
  - `yarn --cwd $API_DIR db:migrate`
- PostGIS must exist:
  - `CREATE EXTENSION IF NOT EXISTS postgis;`
- Optional: `topology` only if a migration requires it.

### Minimal seed for happy‑path smokes (idempotent)
- Admin user (role=admin)
- One community (`community_key=austin-texas-hip-hop`)
- A few genres from the 97‑genre set
- One ArtistProfile linked to a user

Expected output for seed attempts: "created" or "already‑present".

## July Model Alignment Hook
- Read (don’t echo secrets):
  - "docs/july model/architecture realignment/*"
  - "docs/july model/Feature realignment/*"
- Then produce a short delta report to `docs/Session-Logs/CODEX-JULY-MODEL-DELTA.md`:
  - What's already implemented in Sprint 2 specs
  - What remains (artist/band, location filters, radio/community, genres)
  - Which migrations or endpoints must be added/modified

## API Versioning
- Current version: v1 (implicit)
- Breaking changes require a /v2 route or backward compatibility shims
- Mark deprecated fields in responses; add removal date in docs/specs/*

## One-shot Kickoff Script
```
chmod +x docs/scripts/session_kickoff.sh && ./docs/scripts/session_kickoff.sh
```

