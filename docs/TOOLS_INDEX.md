# Tools & Scripts Index

This page lists the most useful local scripts for Phase 2. All tools are non‑destructive and safe to run. Emulator use is optional.

Docs scripts (bash)
- docs/scripts/session_kickoff.sh
  - One‑shot context loader: lists key docs, prints SYSTEM_OVERVIEW and PHASE2_EXECUTION_PLAN, then runs discovery/radio smoke.
  - Usage: chmod +x docs/scripts/session_kickoff.sh && ./docs/scripts/session_kickoff.sh
- docs/scripts/phase2_smoke.sh
  - Read‑only API smokes for discovery, radio, communities, events. Echoes HTTP codes.
  - Env: BASE_URL (default http://127.0.0.1:3000), COMMUNITY_KEY (default austin-texas-hip-hop)
  - Usage: COMMUNITY_KEY=austin-texas-hip-hop BASE_URL=http://127.0.0.1:3000 ./docs/scripts/phase2_smoke.sh
- docs/scripts/psql_postgis_check.sh
  - Non‑destructive DB check. Loads ../webapp_api/.env; confirms PostGIS version and optional ST_DWithin sample.
  - Usage: ./docs/scripts/psql_postgis_check.sh
- docs/scripts/health_checks.sh
  - Runs API /health, Postgres version, PostGIS version; prints failing command + stderr if any check fails.
  - Usage: API_BASE_URL=http://127.0.0.1:3000 ./docs/scripts/health_checks.sh
- docs/scripts/db_bootstrap.sh
  - Idempotent bootstrap: ensures PostGIS; seeds admin role/user, a few genres, community, and ArtistProfile if tables exist.
  - Usage: PG_HOST=127.0.0.1 PG_PORT=5433 PG_DB=uprise_dev PG_USER=uprise ./docs/scripts/db_bootstrap.sh
- docs/scripts/env_shape_check.sh
  - Validates required keys exist in ../webapp_api/.env (no values printed).
  - Usage: ENV_FILE=../webapp_api/.env ./docs/scripts/env_shape_check.sh
- docs/scripts/migration_guard.sh
  - Runs idempotent migrations via yarn in $API_DIR and shows status before/after.
  - Usage: API_DIR=../webapp_api ./docs/scripts/migration_guard.sh
- docs/scripts/api_contract_check.sh
  - Verifies basic contract for /health, /onboarding/all-genres, /api/discovery, /api/radio.
  - Usage: API_BASE_URL=http://127.0.0.1:3000 COMMUNITY_KEY=austin-texas-hip-hop ./docs/scripts/api_contract_check.sh
- docs/scripts/community_key.sh
  - Generates normalized community_key from City, State, Genre inputs.
  - Usage: ./docs/scripts/community_key.sh "Austin" "Texas" "Hip Hop"

Project scripts (Windows/macOS/Linux helpers)
- scripts/local-env-check.ps1
  - Verifies local toolchain (Node 20.19.0, JDK 11, Android SDK paths).
- scripts/local-emulator-run.sh and scripts/local-emulator-run-ubuntu.sh
  - Launch an Android emulator locally (optional for CI; emulator not required for validation).
- scripts/smoke-local.ps1
  - Installs and launches a local APK on emulator; captures logcat and dumpsys (optional).
- scripts/local-build.ps1, scripts/build-local.bat
  - Local build helpers for Windows PowerShell/CMD.

Guardrails & environment
- tools.json documents local dev toolchain guardrails (Node 20.19.0; JDK 11; no global installs; user‑writable paths).
- Emulator independence: All critical validation and smokes succeed without an emulator; CI/emulator steps are optional.

Notes
- Do not print secrets; scripts avoid echoing env values.
- All DB checks are read‑only except the idempotent inserts in db_bootstrap.sh.

Planned additions (tracked for later)
- docs/scripts/schema_sanity.sh: asserts key columns and GIST indexes.
- docs/scripts/sample_responses.sh: saves discovery/radio JSON for regression.
- docs/scripts/geo_sanity.sh: runs parameterized ST_DWithin checks around known coordinates.

Agent helpers
- See docs/Agent-HQ/PHASE2_AGENT_CONVERSIONS.md for Spec-Radar, API-Auditor, and Smoke-Runner roles and how to invoke them in prompts.
