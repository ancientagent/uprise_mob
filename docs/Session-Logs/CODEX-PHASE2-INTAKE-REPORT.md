# Codex Phase 2 Intake Report — July Model Consolidation

Date: 2025-09-08

## Key Findings (July Model vs Current Specs)
- Identity unification
  - July model emphasizes consolidating solo Artists and Bands under a canonical performer identity.
  - Repo evidence: Sequelize `artistprofile` model and migrations for band→artist unification present; API routes include band/artist endpoints.
- Location filtering
  - July model calls for city/state + PostGIS-backed geo; current specs describe community key and hierarchy.
  - Repo evidence: `locations`, lat/lng on `songs`, PostGIS noted in docs and CHANGELOG.
- Radio/Community
  - July model frames Radio as the execution of community queues; current specs treat them closely but needed explicit unification.
  - Update applied: radio defined as projection over community rotation with shared filters.
- Genre upgrade
  - July model proposes stronger taxonomy and tagging; specs had genre integration, but tag arrays and hierarchy needed clarity.
  - Update applied: primary `genre_id` + optional `genre_tags[]`, taxonomy hierarchy for discovery/promotions.

## Decision Points & Resolutions
- Canonical performer id
  - Decision: enforce `artist_canonical_id` across Songs, Events, Promotions; retain optional `band_id`.
  - Rationale: clear ownership, analytics consistency, simpler authorization logic.
- Standard geo/genre API params
  - Decision: use `city,state,genre,lat,lng,radius,community_key` across discovery/radio/events/promotions.
  - Rationale: eliminates drift, enables shared client hooks and cache keys.
- Radio as Community projection
  - Decision: keep one entity (Community) with RaDIYo queues as projections (tiered views); same filters/taxonomy.
  - Rationale: avoids duplicate logic and inconsistencies.
- Genre taxonomy + tags
  - Decision: hierarchical taxonomy with optional `genre_tags[]` for fine-grained discovery and targeting.
  - Rationale: supports both structured browsing and flexible promotion audiences.

## Dependency Map
- Mobile app ↔ API
  - Mobile sends `community_key` (or lat/lng) and reads radio/discovery queues; optional `X-Artist-Canonical-Id` when acting as creator.
- API ↔ DB (Postgres/PostGIS @ 5433)
  - Sequelize models/migrations implement identity, genre, and geo; PostGIS functions used for spatial filters.
- webapp_ui ↔ API
  - Business tools for promotions/events rely on standard params and echoing effective targeting.
- Cross‑module
  - Auth provides identity context; Community provides geo context; Fair Play consumes both; Promotions/Events target via them.

## Light Verification Summary
- .env shape (sibling webapp_api): keys found for DB_HOST/DB_PORT/DB_NAME/DB_USERNAME/DB_PASSWORD + JWT/PORT.
- psql PostGIS check attempted; not executed here (likely not installed or DB not running). Command provided below.
- API structure inspected: routes present for auth, radio, discovery, communities, events; database models/migrations include band/artist unification and geo fields.

## Next Steps (Ops/Dev)
- Run PostGIS check locally: `psql -p $DB_PORT -d $DB_NAME -c "SELECT PostGIS_Full_Version();"`
- Confirm GIST indexes on geo columns; validate ST_DWithin queries with seed data.
- Normalize API params and response echoes; add OpenAPI snippets to route docs.

---

## July Model Alignment — Architecture + Feature Reports (Ingested)

Sources
- docs/july model/architecture realignment/ARCHITECTURAL-REALIGNMENT-IMPLEMENTATION.md
- docs/july model/architecture realignment/BACKEND-FORENSIC-ANALYSIS.md
- docs/july model/architecture realignment/ARTIST-UNIFICATION-IMPLEMENTATION.md
- docs/july model/architecture realignment/FRONTEND-ARTIST-UNIFICATION-REFACTORING.md
- docs/july model/architecture realignment/STATION-COMMUNITY-SYSTEM-ANALYSIS.md
- docs/july model/Feature realignment/MODERN-GENRES-SYSTEM.md

Key problems identified
- Feed logic mixed songs/events; should be notifications only (music via radio).
- Home feed lacked location filtering; discovery endpoints also missed geo filters.
- Genre onboarding used outdated endpoint; needed `/onboarding/all-genres` (97 genres).
- Artist/Band split; backend unification implemented (ArtistProfile), frontend refactor in progress.
- Radio tiers (CITYWIDE/STATEWIDE/NATIONAL) need consistent mapping to community filters.

Mapped actions (Phase 2)
- Confirm feed is notifications-only and keep music in radio/discovery flows.
- Implement/verify geo filters for discovery; standardize params and echo `community_key`.
- Ensure onboarding uses super/all-genre endpoints; align mobile services accordingly.
- Use ArtistProfile endpoints from mobile; enforce canonical ID ownership on writes.
- Treat Radio as a projection of Community queues with same filters and tiers.
