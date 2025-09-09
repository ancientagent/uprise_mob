# Phase 2 Execution Plan

## Workstreams
- Auth & Identity
- Locations & Geo
- Radio/Community
- Genre Taxonomy
- API Integration
- Mobile UI hooks

---

## Auth & Identity
- Current state
  - Users authenticate; Artist, Band, Venue, Promoter roles exist; migrations include `artistprofile` and band linkage.
  - Tokens are user-scoped; partial band management flows present in API routes.
- Gaps
  - Canonical performer id not enforced end-to-end in writes/reads.
  - Profile switching header/context not standardized.
- Tasks
  - Add `artist_canonical_id` as required on content writes (songs/events/promos).
  - Support profile context via `X-Artist-Canonical-Id` header; authorize against memberships.
  - Ensure band admin privileges propagate for writes referencing `band_id`.
- Acceptance criteria
  - CRUD endpoints reject writes without authorized canonical id.
  - Reads return canonical ids for client linking.
- Test hooks
  - curl: `-H 'X-Artist-Canonical-Id: <id>'` to create song/event; verify 403 on unauthorized ids.

## Locations & Geo
- Current state
  - PostGIS enabled database on port 5433; models for `locations`, `songs` contain lat/lng columns.
- Gaps
  - Inconsistent API params across endpoints; lack of standardized community key echo.
- Tasks
  - Standardize params: `city,state,genre,lat,lng,radius,community_key`.
  - Add GIST indexes on geography columns; verify ST_DWithin and ST_Contains usage.
  - Ensure GPS verification for vote/engagement endpoints.
- Acceptance criteria
  - Endpoints accept common geo params and echo `community_key` in responses.
  - Spatial filters produce expected counts in QA seed data.
- Test hooks
  - psql: `SELECT PostGIS_Full_Version();` then sample `ST_DWithin` queries.
  - curl: `/api/discovery?city=Austin&state=Texas&genre=Hip%20Hop` returns community_key.

## Radio/Community
- Current state
  - Radio routes and Fair Play utilities exist; communities route present.
- Gaps
  - Divergent filter shapes; radio not explicitly expressed as community projection.
- Tasks
  - Unify radio endpoints to require `community_key` (with fallback to lat/lng).
  - Align queue generation with community stats and taxonomy rollups.
- Acceptance criteria
  - Radio responses include `community_key`, `genre_id`, and tier attribution.
- Test hooks
  - curl: `/api/radio?community_key=austin-texas-hip-hop` returns queue with tiers.

## Genre Taxonomy
- Current state
  - `genres` model exists; songs link via `songgenres`.
- Gaps
  - No explicit taxonomy tree or tag array for secondary discovery facets.
- Tasks
  - Define parent/child taxonomy and optional `genre_tags[]`.
  - Update ingestion to store primary `genre_id` + optional tags.
- Acceptance criteria
  - Discovery and promotions can filter by genre hierarchy and tags.
- Test hooks
  - curl: `/api/discovery?genre=hip-hop&tag=trap` yields filtered set.

## API Integration
- Current state
  - Node/Sequelize API with routes: auth, radio, discovery, communities, events, promotions.
- Gaps
  - Param naming inconsistencies; missing `community_key` echo on many responses.
- Tasks
  - Normalize params/responses; add explicit geo/genre contract docs.
- Acceptance criteria
  - OpenAPI/route docs list standard params; responses include effective filters.
- Test hooks
  - curl smoke suite hitting key routes with shared params; validate 200 + schema.

### July Model Alignment (from architecture/feature realignment)
- Confirm feed behavior
  - Feed returns notifications only (not songs/events), as per Architectural Realignment.
  - Mobile uses radio/discovery for music content.
- Fix discovery geo filtering
  - Discovery endpoints must apply city/state/genre or community_key filters.
  - Add `community_key` echo in responses.
- Genre endpoint correctness
  - Use `/onboarding/all-genres` and hierarchical endpoints for onboarding.
- Artist unification usage
  - Mobile reads/updates via `/user/band` and `/user/artist-profile` instead of legacy band routes.

## Mobile UI hooks
- Current state
  - Mobile consumes radio/discovery; needs canonical id + community filters.
- Gaps
  - Profile switching and filter persistence not aligned with new contracts.
- Tasks
  - Add active profile context to API calls; persist `community_key` in state.
- Acceptance criteria
  - Radio/discovery reflect selected city/state/genre consistently.
- Test hooks
  - Network inspector shows requests carrying `community_key` and active artist context.

---

## Migration Checklist (Sequelize/SQL)
- Identity
  - Backfill `artist_canonical_id` on Songs, Events, Promotions from existing relations.
  - Create/confirm `artistprofile` records for solo artists; link bands → members.
- Geo
  - Ensure geometry/geography columns exist where needed; add GIST indexes.
  - Seed city/state lookup with centroids and boundaries.
- Genre
  - Add `parent_genre_id` to taxonomy; optional `genre_tags` array column.
- API
  - Update route validators to accept standard geo/genre params.

---

## Quick Test Hooks
- psql
  - `SELECT PostGIS_Full_Version();`
  - `SELECT COUNT(*) FROM songs WHERE ST_DWithin(artist_geom, ST_SetSRID(ST_MakePoint(-97.7431,30.2672),4326)::geography, 40000);`
- curl
  - `curl \
    -H 'Authorization: Bearer <token>' \
    -H 'X-Artist-Canonical-Id: <id>' \
    "http://localhost:3000/api/radio?community_key=austin-texas-hip-hop"`
  - `curl "http://localhost:3000/api/discovery?city=Austin&state=Texas&genre=Hip%20Hop&radius=25"`
# UPRISE Phase 2 Execution Plan

## Purpose  
Unify the July Model realignments with current Phase 2 specs so that **mobile, API, and webapp** all converge on one canonical architecture. This document is the single source of truth for backend integration, onboarding, and smokes.

---

## Core Realignments (Phase 2 Foundations)

### 1. Artist/Band Unification  
- Canonical model: **ArtistProfile**  
- Endpoints:  
  - `GET /user/band` → returns ArtistProfile  
  - `PUT /user/artist-profile` → update profile & logo  
- Remove Band-only calls in mobile/web.  
- References:  
  - `docs/july model/architecture realignment/ARTIST-UNIFICATION-IMPLEMENTATION.md`  
  - `docs/july model/architecture realignment/FRONTEND-ARTIST-UNIFICATION-REFACTORING.md`  
  - `docs/specs/06_SONG_MANAGEMENT.md` (canonical IDs)

### 2. Community & Location Filtering  
- Canonical key: **`city-state-genre`** (e.g. `austin-texas-hip-hop`)  
- Params: `city, state, genre, lat, lng, radius, community_key`  
- GPS fraud checks via PostGIS (`ST_DWithin`)  
- References:  
  - `docs/specs/04_COMMUNITY_LOCATION.md`  
  - `docs/july model/architecture realignment/STATION-COMMUNITY-SYSTEM-ANALYSIS.md`

### 3. Radio/Community Unification  
- Radio is a projection of community queues.  
- Discovery responses echo back `community_key`.  
- Feed = notifications only (no music payloads).  
- References:  
  - `docs/july model/architecture realignment/STATION-COMMUNITY-SYSTEM-ANALYSIS.md`  
  - (this doc)

### 4. Genre Upgrade (Modern 97 Taxonomy)  
- Endpoints:  
  - `/onboarding/all-genres` → flat 97 list  
  - `/onboarding/super-genres` → hierarchy  
- Used during artist onboarding.  
- References:  
  - `docs/july model/Feature realignment/MODERN-GENRES-SYSTEM.md`  
  - `docs/architecture/SYSTEM_OVERVIEW.md`

### 5. Business & Promotions Alignment  
- Local businesses + events target communities via `community_key`.  
- Promotions system plugs into community + genre targeting.  
- References:  
  - `docs/specs/09_PROMOTIONS_BUSINESS.md`  
  - `docs/specs/08_EVENTS.md`

---

## Integration Targets

- **Auth (JWT + refresh)**  
  - Confirm refresh token handling + 401 responses.  
  - Secrets and expirations aligned in API.  
  - Header for creator actions: `X-Artist-Canonical-Id`.

- **Onboarding (Artist)**  
  - Signup → capture city/state + genre.  
  - Create ArtistProfile if missing.  
  - Set active profile context.  

- **Radio & Discovery**  
  - Always filtered by `community_key`.  
  - Echo back params for consistency.  

---

## Smokes & Verification

- `docs/scripts/session_kickoff.sh`  
- `docs/scripts/phase2_smoke.sh`  
- `docs/scripts/psql_postgis_check.sh`  
- `docs/scripts/health_checks.sh`

**Acceptance Criteria**  
- Login/refresh works reliably.  
- Onboarding shows 97-genre list + home scene.  
- ArtistProfile is linked and editable.  
- Radio responses include `community_key`.  
- Feed = notifications only.  

---

## References (Single Source)

- `docs/architecture/SYSTEM_OVERVIEW.md`  
- `docs/specs/03_AUTHENTICATION.md`  
- `docs/specs/04_COMMUNITY_LOCATION.md`  
- `docs/specs/05_FAIR_PLAY_ALGO.md`  
- `docs/specs/06_SONG_MANAGEMENT.md`  
- `docs/specs/07_DISCOVERY_MAP.md`  
- `docs/specs/08_EVENTS.md`  
- `docs/specs/09_PROMOTIONS_BUSINESS.md`  

### July Model (Previous Investigations)  
- `docs/july model/architecture realignment/`  
- `docs/july model/Feature realignment/`  
