# Codex July Model Delta — Phase 2 Alignment

Date: 2025-09-16

Purpose
- Summarize what the July Model realignments already cover in current Phase 2 docs, what remains to implement, and which migrations/endpoints are implicated.

Already Implemented (in Phase 2 specs)
- ArtistProfile unification: ArtistProfile is the canonical creator model; band-only calls deprecated. Target endpoints: `GET /user/band` (returns ArtistProfile), `PUT /user/artist-profile`.
- Community/Location filters: Normalized `community_key=city-state-genre`; standard params `city,state,genre,lat,lng,radius,community_key` defined; responses echo `community_key`.
- Radio=Community projection: Radio and Discovery operate on community queues; responses return the effective filters and community_key; feed is notifications-only.
- Genre taxonomy (97): Onboarding uses `/onboarding/all-genres` (flat) and `/onboarding/super-genres` (hierarchical).
- Routing intent: Post-login goes to Home Scene Creation (CommunitySetup); Dashboard only after onboarding completes and a community exists.

Remains / Gaps
- Onboarding data: Ensure `/onboarding/all-genres` returns the 97-genre set (dev DB seed or idempotent loader required).
- Discovery/Radio inputs: Accept standard geo/genre params or `community_key` and consistently echo `community_key` in responses (verify across handlers/middleware).
- Identity headers: For creator mutations, require `X-Artist-Canonical-Id` and enforce 403 on mismatch; confirm GET `/user/band` returns the unified ArtistProfile.
- Location filters: Ensure PostGIS usage (`ST_DWithin`, proper SRID) for `lat/lng/radius`; normalize city/state and map `genre` slugs to `genre_id`.
- Promotions/Events: Confirm targeting via `community_key` and genre taxonomy; align any legacy “Station” terminology in responses.

Migrations / Endpoints to Add or Modify
- Migrations (present in repo, need idempotent run/verify):
  - `unify-bands-into-artist-profiles.js`
  - `add-location-to-bands.js`, `add-location-to-artist-profiles.js`
  - Supporting 2024–2025 migrations (song likes/skips/priority) as per `src/database/migrations`.
- Endpoints:
  - Confirm/implement: `PUT /user/artist-profile`, `GET /user/band` (ArtistProfile projection), `/onboarding/all-genres`, `/onboarding/super-genres`.
  - Discovery/Radio: ensure handlers accept standard params and return `community_key` in payloads/metadata.
- Health/version:
  - `/health` returns 200; include a version hash/build info for CI smokes.

DB Requirements
- Postgres 16 with PostGIS extension; consider `uuid-ossp` and `pgcrypto` if used.
- All migrations must be idempotent; status clean after execution on dev.

Notes
- This delta focuses on aligning current Phase 2 docs with July Model intent and the live API structure discovered under `../webapp_api`.
